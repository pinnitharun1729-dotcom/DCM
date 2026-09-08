import fs from 'fs';

let content = fs.readFileSync('src/components/AddDueModal.tsx', 'utf-8');

// Import getClearanceRecords
content = content.replace(
  /import \{ getStudents \} from '\.\.\/utils\/storage';/,
  "import { getStudents, getClearanceRecords } from '../utils/storage';"
);

// Get records and check status
const insertLogic = `
  const records = getClearanceRecords();
  const selectedRecord = records[selectedStudentId];
  const isCertified = selectedRecord?.certificate_generated === true;
`;

content = content.replace(
  /const \[error, setError\] = useState<string \| null>\(null\);/,
  "const [error, setError] = useState<string | null>(null);\n" + insertLogic
);

// Update select options to include ✅ Certified
const selectReplacement = `
              {students.map((st) => {
                const rec = records[st.id];
                const cert = rec?.certificate_generated ? ' [✅ Certified]' : '';
                return (
                  <option key={st.id} value={st.id}>
                    {st.id.toUpperCase()} — {st.name} ({st.branch}){cert}
                  </option>
                );
              })}
`;

content = content.replace(
  /\{students\.map\(\(st\) => \([\s\S]*?<\/option>\s*\)\)\}/,
  selectReplacement
);

// Add alert and disable submit
const submitButtonReplacement = `
          {isCertified && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Clearance Locked:</strong> This student's No-Dues Certificate has already been issued and digitally sealed (Cert Ref: {selectedRecord?.certificate_hash || 'Pending'}). New dues cannot be raised against a certified student. Please route through a Post-Certification Dispute/Reopen Request if necessary.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCertified}
              className={\`px-4 py-2 text-sm font-semibold text-white rounded-xl flex items-center space-x-2 transition-colors \${isCertified ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-xs'}\`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Official Due</span>
            </button>
          </div>
`;

content = content.replace(
  /\{\/\* Actions \*\/\}[\s\S]*?<\/div>/,
  submitButtonReplacement
);

fs.writeFileSync('src/components/AddDueModal.tsx', content);
