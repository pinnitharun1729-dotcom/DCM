import fs from 'fs';

let content = fs.readFileSync('src/components/CertificatePreviewModal.tsx', 'utf-8');

// Update watermark opacity to 8%
content = content.replace(
  /className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5"/,
  'className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]"'
);

// Fix QR code position and remove "Scan to Verify" text
// Replace the whole QR code section
const qrReplacement = `
              {/* Bottom Notice & QR Code */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="text-left text-[10px] text-slate-500 max-w-[80%] space-y-1">
                  <p>
                    <strong>Authenticity Verification:</strong> This is a digitally generated document. 
                    The clearance status reflects data recorded by respective department heads on the No-Dues portal.
                  </p>
                  <p>
                    This digital document is electronically generated and digitally signed by RGUKT RK Valley. No physical signature is required.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 pb-1">
                  <QRCode 
                    value={JSON.stringify({
                      certId: certNo,
                      studentId: student.id.toUpperCase(),
                      date: issueDate
                    })} 
                    size={60} 
                    level="L"
                  />
                </div>
              </div>
`;
content = content.replace(/\{\/\* Bottom Notice & QR Code \*\/\}[\s\S]*?Scan to Verify<\/span>\s*<\/div>\s*<\/div>/, qrReplacement);

fs.writeFileSync('src/components/CertificatePreviewModal.tsx', content);
