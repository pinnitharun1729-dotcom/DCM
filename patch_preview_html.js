import fs from 'fs';

let content = fs.readFileSync('src/components/CertificatePreviewModal.tsx', 'utf-8');

if (!content.includes('import QRCode')) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport QRCode from 'react-qr-code';\nimport { LOGO_BASE64 } from '../constants';");
}

// add LOGO_BASE64 export to constants
let constants = fs.readFileSync('src/constants.ts', 'utf-8');
if (!constants.includes('LOGO_BASE64')) {
  let logoContent = fs.readFileSync('rgukt_logo_base64.txt', 'utf-8');
  constants += `\nexport const LOGO_BASE64 = "${logoContent}";\n`;
  fs.writeFileSync('src/constants.ts', constants);
}

// Now inject logo and watermark and qr code into the JSX.
// Top seal area:
const topSealReplacement = `
              {/* Seal Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <img src={LOGO_BASE64} alt="Watermark" className="w-96 h-96 object-contain" />
              </div>
              
              {/* Certificate Top Seal & University Banner */}
              <div className="flex flex-col items-center border-b border-slate-200 pb-5 space-y-1 relative">
                <div className="absolute left-0 top-0 hidden sm:block">
                  <img src={LOGO_BASE64} alt="RGUKT Logo" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-center space-y-1 z-10 relative">
                  <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    {RGUKT_INFO.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {RGUKT_INFO.campus}, {RGUKT_INFO.state} • Established 2008
                  </p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    OFFICE OF ACADEMIC AFFAIRS & STUDENT WELFARE
                  </p>
                </div>
                <div className="pt-2 z-10">
                  <span className="inline-block px-4 py-1 bg-red-800 text-white font-bold text-xs sm:text-sm tracking-wide rounded-md">
                    CONSOLIDATED NO-DUES & CLEARANCE CERTIFICATE
                  </span>
                </div>
                <div className="flex w-full items-center justify-between text-[11px] font-mono text-slate-600 pt-2 z-10">
                  <span>Cert No: {certNo}</span>
                  <span>Issued: {issueDate}</span>
                </div>
              </div>
`;
content = content.replace(/\{\/\* Seal Watermark Background \*\/\}[\s\S]*?Issued: \{issueDate\}<\/span>\s*<\/div>\s*<\/div>/, topSealReplacement);

// Add QR Code at the bottom, near the hash.
// Look for where to put QR code. Usually bottom right.
// Let's find "Bottom Notice & Legal Footnote" or similar in preview.
const qrReplacement = `
                {/* QR Code and Notice */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between">
                  <div className="text-[10px] text-slate-500 max-w-lg space-y-1.5">
                    <p>
                      <strong>Authenticity Verification:</strong> This is a digitally generated document. 
                      The clearance status reflects data recorded by respective department heads on the No-Dues portal.
                    </p>
                    <p>
                      The cryptographic hash acts as a digital signature verifying the state of records at the time of issuance.
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <QRCode 
                      value={JSON.stringify({
                        certId: certNo,
                        studentId: student.id.toUpperCase(),
                        date: issueDate
                      })} 
                      size={90} 
                      level="L"
                    />
                    <span className="text-[9px] font-semibold text-slate-500 mt-1.5">Scan to Verify</span>
                  </div>
                </div>
`;
content = content.replace(/<div className="mt-6 pt-4 border-t border-slate-200 text-\[10px\] text-slate-500 space-y-1">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, qrReplacement + '\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>');

fs.writeFileSync('src/components/CertificatePreviewModal.tsx', content);

