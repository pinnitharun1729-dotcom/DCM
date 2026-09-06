import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  FileUp,
  Info,
  Upload,
  X,
} from 'lucide-react';
import { CodeDue } from '../types';
import { SBI_COLLECT_URL } from '../constants';
import { compressImageFile } from '../utils/receiptStorage';

interface DuePaymentModalProps {
  due: CodeDue | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReceipt: (params: {
    dueId: string;
    receiptUrl: string;
    receiptFileName: string;
    transactionRef: string;
  }) => void;
  initialPayNowTriggered?: boolean;
}

export const DuePaymentModal: React.FC<DuePaymentModalProps> = ({
  due,
  isOpen,
  onClose,
  onSubmitReceipt,
  initialPayNowTriggered = false,
}) => {
  const [sbiRedirectOpened, setSbiRedirectOpened] = useState(initialPayNowTriggered);
  const [transactionRef, setTransactionRef] = useState(due?.transaction_ref || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(due?.receipt_url || null);
  const [fileName, setFileName] = useState<string>(due?.receipt_file_name || '');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !due) return null;

  const handleOpenSbiPortal = () => {
    // Open SBI Collect portal in a new tab without query params as requested
    window.open(SBI_COLLECT_URL, '_blank', 'noopener,noreferrer');
    setSbiRedirectOpened(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid format. Only PDF, JPG, and PNG files are accepted.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    // If image, compress client-side before preview and storage to minimize footprint
    if (file.type.startsWith('image/')) {
      compressImageFile(file, 900, 0.75)
        .then((compressedUrl) => {
          setPreviewUrl(compressedUrl);
        })
        .catch(() => {
          const reader = new FileReader();
          reader.onload = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
    } else {
      // PDF or non-image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setFileError('Please select a payment receipt file (PDF/JPG/PNG).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReceipt({
        dueId: due.id,
        receiptUrl: previewUrl,
        receiptFileName: fileName || 'SBI_Receipt.pdf',
        transactionRef: transactionRef.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-due-payment"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Clear Outstanding Due — {due.department.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Student ID: {due.student_id.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Due Summary Card */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Assessed University Due
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {due.reason}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{due.amount}
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: SBI Collect Redirect Button */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Step 1: Pay via Official SBI Collect Portal
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Official Gateway
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Click below to launch the State Bank of India Collect portal. Select{' '}
              <strong>"Educational Institutions" → "RGUKT RK Valley"</strong>, choose the
              appropriate fee category, and complete your online transaction.
            </p>

            <button
              id="btn-open-sbi-collect"
              type="button"
              onClick={handleOpenSbiPortal}
              className="w-full py-2.5 px-4 bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch SBI Collect Portal (New Tab)</span>
            </button>
          </div>

          {/* Prompt Mandate: On-screen Note after clicking Pay Now */}
          {sbiRedirectOpened && (
            <div
              id="sbi-onscreen-note"
              className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2.5 animate-in fade-in"
            >
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-bold">Payment Gateway Opened:</p>
                <p className="mt-0.5">
                  After completing payment on SBI Collect, note your reference number and
                  upload the receipt below.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Receipt Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Step 2: SBI Transaction Reference Number{' '}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="input-transaction-ref"
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. DUK882910492"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Payment Receipt{' '}
                <span className="text-rose-500">* (PDF, JPG, PNG - Max 5MB)</span>
              </label>

              {/* File Input Box */}
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  previewUrl
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
                }`}
              >
                <input
                  id="input-receipt-file"
                  type="file"
                  accept=".pdf,image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="input-receipt-file"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                >
                  {previewUrl ? (
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">
                          {fileName || 'Receipt Selected'}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">
                          Click to choose a different file
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click or Drag to Upload SBI Receipt
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Accepts PDF, JPG, or PNG up to 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>

              {fileError && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fileError}</span>
                </p>
              )}
            </div>

            {/* Receipt Preview Thumbnail if Image */}
            {previewUrl && previewUrl.startsWith('data:image') && (
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-100/50">
                <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Receipt Preview:
                </p>
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-36 rounded-lg object-contain mx-auto border border-slate-200"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-receipt-confirm"
                type="submit"
                disabled={isSubmitting || !previewUrl}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-center"
              >
                {isSubmitting ? (
                  <span>Submitting Receipt...</span>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    <span>Submit Receipt for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
