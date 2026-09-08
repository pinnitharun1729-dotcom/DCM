import fs from 'fs';

let content = fs.readFileSync('src/components/CertificatePreviewModal.tsx', 'utf-8');

const qrReplacement = `
              {/* Bottom Notice & QR Code */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-end justify-between">
                <div className="text-left text-[10px] text-slate-500 max-w-[75%] space-y-1">
                  <p>
                    <strong>Authenticity Verification:</strong> This is a digitally generated document. 
                    The clearance status reflects data recorded by respective department heads on the No-Dues portal.
                  </p>
                  <p>
                    This digital document is electronically generated and digitally signed by RGUKT RK Valley. No physical signature is required.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0">
                  <QRCode 
                    value={JSON.stringify({
                      certId: certNo,
                      studentId: student.id.toUpperCase(),
                      date: issueDate
                    })} 
                    size={70} 
                    level="L"
                  />
                  <span className="text-[9px] font-semibold text-slate-500 mt-1">Scan to Verify</span>
                </div>
              </div>
`;

content = content.replace(/\{\/\* Bottom Notice \*\/\}[\s\S]*?No physical signature is required\.\s*<\/div>/, qrReplacement);

fs.writeFileSync('src/components/CertificatePreviewModal.tsx', content);
