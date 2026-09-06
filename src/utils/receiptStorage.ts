/**
 * IndexedDB + In-Memory Store for receipt documents and attachments.
 * Prevents localStorage QuotaExceededError by storing large receipt blobs/PDFs
 * in IndexedDB (which has hundreds of MBs of capacity) while keeping localStorage lightweight.
 */

const DB_NAME = 'rgukt_receipts_db_v1';
const STORE_NAME = 'receipt_files';

// Fast in-memory cache for the current session
const receiptMemoryCache = new Map<string, string>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => {
          console.warn('[ReceiptStorage] IndexedDB open error:', err);
          resolve(null);
        };
      } catch (e) {
        console.warn('[ReceiptStorage] IndexedDB initialization error:', e);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * Stores a receipt data URL in both in-memory cache and IndexedDB.
 */
export async function saveReceiptToStorage(dueId: string, dataUrl: string): Promise<void> {
  if (!dueId || !dataUrl) return;

  // 1. In-memory cache for immediate synchronous retrieval
  receiptMemoryCache.set(dueId, dataUrl);

  // 2. Persistent storage in IndexedDB
  try {
    const db = await getDb();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUrl, dueId);
  } catch (err) {
    console.warn('[ReceiptStorage] Failed to store receipt in IndexedDB:', err);
  }
}

/**
 * Synchronously retrieves from in-memory cache if available
 */
export function getCachedReceipt(dueId: string): string | null {
  return receiptMemoryCache.get(dueId) || null;
}

/**
 * Asynchronously retrieves the full receipt document (from memory or IndexedDB)
 */
export async function getReceiptFromStorage(dueId: string): Promise<string | null> {
  if (!dueId) return null;

  // 1. Check memory cache
  const cached = receiptMemoryCache.get(dueId);
  if (cached) return cached;

  // 2. Retrieve from IndexedDB
  try {
    const db = await getDb();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(dueId);
      request.onsuccess = () => {
        const result = request.result as string | undefined;
        if (result) {
          receiptMemoryCache.set(dueId, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Generates an SVG data URL for a receipt summary card when storing in localStorage
 * to ensure localStorage remains under 1-2 KB per due.
 */
export function generateReceiptSvg(info: {
  amount: number;
  reason: string;
  department: string;
  studentId: string;
  refNumber?: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#f8fafc" rx="16"/>
    <rect x="20" y="20" width="560" height="360" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="12"/>
    <rect x="20" y="20" width="560" height="60" fill="#0284c7" rx="12"/>
    <rect x="20" y="68" width="560" height="12" fill="#0284c7"/>
    <text x="40" y="56" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="bold">State Bank of India — e-Challan / Receipt</text>
    <text x="40" y="120" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">BENEFICIARY</text>
    <text x="40" y="142" fill="#0f172a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">RGUKT RK Valley — ${info.department.toUpperCase()} DEPT</text>
    <text x="40" y="190" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">STUDENT PARTICULARS</text>
    <text x="40" y="212" fill="#0f172a" font-family="Arial, sans-serif" font-size="15 font-weight="bold">${info.studentId.toUpperCase()}</text>
    <text x="40" y="250" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">PURPOSE / DUE</text>
    <text x="40" y="272" fill="#334155" font-family="Arial, sans-serif" font-size="14">${info.reason.substring(0, 48)}</text>
    <line x1="40" y1="300" x2="560" y2="300" stroke="#f1f5f9" stroke-width="2"/>
    <text x="40" y="340" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">SBI REFERENCE</text>
    <text x="40" y="362" fill="#0369a1" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${info.refNumber || 'DUA09182736'}</text>
    <text x="440" y="340" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="end">AMOUNT PAID</text>
    <text x="560" y="365" fill="#15803d" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="end">₹${info.amount}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Client-side image compressor using HTML5 canvas.
 * Compresses camera photos / large screenshots (2-5MB) down to 30-70KB without visual loss.
 */
export function compressImageFile(file: File, maxDimension = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // For non-images (e.g. PDF), read directly
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
