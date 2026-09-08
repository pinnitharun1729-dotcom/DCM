import React, { useState } from 'react';
import { AlertCircle, DollarSign, PlusCircle, User, X } from 'lucide-react';
import { DepartmentId, StudentProfile } from '../types';
import { getStudents, getClearanceRecords } from '../utils/storage';

interface AddDueModalProps {
  department: DepartmentId;
  isOpen: boolean;
  onClose: () => void;
  onAddDue: (params: {
    student_id: string;
    department: DepartmentId;
    reason: string;
    amount: number;
  }) => void;
}

export const AddDueModal: React.FC<AddDueModalProps> = ({
  department,
  isOpen,
  onClose,
  onAddDue,
}) => {
  const students = getStudents();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const records = getClearanceRecords();
  const selectedRecord = records[selectedStudentId];
  const isCertified = selectedRecord?.certificate_generated === true;


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    if (!reason.trim()) {
      setError('Please specify the exact reason for this departmental due.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid due amount greater than 0.');
      return;
    }

    onAddDue({
      student_id: selectedStudentId,
      department,
      reason: reason.trim(),
      amount: Math.round(parsedAmount),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-add-due"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Add Student Due — {department.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500">
              Assesses an official monetary liability against student account
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student (RGUKT ID / Name)
            </label>
            <select
              id="select-due-student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            >
              
              {students.map((st) => {
                const rec = records[st.id];
                const cert = rec?.certificate_generated ? ' [✅ Certified]' : '';
                return (
                  <option key={st.id} value={st.id}>
                    {st.id.toUpperCase()} — {st.name} ({st.branch}){cert}
                  </option>
                );
              })}

            </select>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Reason / Description
            </label>
            <textarea
              id="input-due-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Overdue library book: 'Computer Networks' by Tanenbaum (45 days)"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                ₹
              </span>
              <input
                id="input-due-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="350"
                className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Immediately reflects on student's portal with SBI Collect payment redirect.
            </p>
          </div>

          
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
              className={`px-4 py-2 text-sm font-semibold text-white rounded-xl flex items-center space-x-2 transition-colors ${isCertified ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-xs'}`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Official Due</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
