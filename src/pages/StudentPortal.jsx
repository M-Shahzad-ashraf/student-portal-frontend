import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI } from '../api/students';
import { feesAPI } from '../api/fees';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getInitials, getCampusColor, getStatusBadgeClass, formatCurrency } from '../utils/helpers';
import { CAMPUSES, FEE_MONTHS } from '../utils/constants';
import toast from 'react-hot-toast';

const StudentPortal = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [studentRes, feeRes] = await Promise.all([
        studentsAPI.getById(user.studentId),
        feesAPI.getStudentSummary(user.studentId)
      ]);
      setStudent(studentRes.data);
      setFeeData(feeRes.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async (month, amount) => {
    try {
      await feesAPI.updateFee(user.studentId, month, 2026, {
        status: 'Paid',
        paidAmount: amount,
        paidDate: new Date().toISOString().split('T')[0],
        receipt: `RCP${Math.floor(10000 + Math.random() * 89999)}`
      });
      toast.success('Fee paid successfully');
      setShowPayModal(false);
      fetchStudentData();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const handlePrintChallan = async (month) => {
    try {
      const response = await feesAPI.getChallan(user.studentId, month, 2026);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to generate challan');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!student) return <div className="text-center py-8">Profile not found</div>;

  const campus = CAMPUSES.find(c => c.id === student.campusId);
  const portalHeroBg = `bg-gradient-to-br from-[#042c53] to-[${getCampusColor(student.campusId)}]`;
  const totalPaid = feeData?.totalPaid || 0;
  const totalOutstanding = feeData?.outstanding || 0;

  return (
    <div className="max-w-[820px] mx-auto">
      {/* Profile Hero */}
      <div className={`rounded-2xl p-7 relative overflow-hidden text-white mb-5 flex flex-col items-center text-center ${portalHeroBg}`}>
        <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/40 flex items-center justify-center text-3xl font-bold mb-3">
          {getInitials(student.name)}
        </div>
        <div className="font-amiri text-2xl font-bold">{student.name}</div>
        <div className="text-sm opacity-80 mt-1">{campus?.label} · {student.className} · Section {student.section}</div>
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          <span className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs flex items-center gap-1.5">
            <i className="ti ti-id-badge-2"></i> {student.id}
          </span>
          <span className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs flex items-center gap-1.5">
            <i className="ti ti-hash"></i> Roll: {student.rollNo}
          </span>
          <span className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs flex items-center gap-1.5">
            <i className="ti ti-gender-male-female"></i> {student.gender === 'M' ? 'Male' : 'Female'}
          </span>
        </div>
      </div>

      <div className="bg-[#e6f1fb] text-[#0c447c] rounded-lg p-3.5 text-xs md:text-sm flex items-center gap-2 mb-4">
        <i className="ti ti-lock text-lg"></i> Personal details are read-only. Monthly tuition fees can be logged directly on cash receipt.
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-white border border-[#c5d8ef] rounded-lg p-1.5 mb-[16px] flex-wrap">
        {[
          ['info', 'Personal Info'],
          ['guardian', 'Guardian'],
          ['fees', 'My Fees']
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-[10px] text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer min-w-[110px] ${activeTab === tab
              ? 'bg-[#185fa5] text-white'
              : 'bg-white text-[#185fa5] border border-[#185fa5] hover:bg-[#e6f1fb]'
              }`}
          >
            <i className={`ti ti-${tab === 'info' ? 'id-badge-2' : tab === 'guardian' ? 'users' : 'coin'}`}></i>
            {label}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
          <div className="py-3 px-4 bg-[#f0f5fb] border-b border-[#c5d8ef] font-bold text-xs md:text-sm flex items-center gap-2">
            <i className="ti ti-user text-[#185fa5]"></i> Personal Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              ['Student ID', student.id],
              ['Full Name', student.name],
              ['Roll No', student.rollNo],
              ['Campus', campus?.label],
              ['Class', student.className],
              ['Section', student.section],
              ['Date of Birth', student.dob || '—'],
              ['Blood Group', student.bloodGroup || '—'],
              ['B-Form', student.bForm || '—'],
              ['Email', student.email || '—'],
              ['Admission Date', student.admissionDate || '—'],
              ['Address', student.address || '—']
            ].map(([label, value]) => (
              <div key={label} className="py-3 px-4 border-b border-[#eef3f9]">
                <div className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-xs md:text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guardian Info Tab */}
      {activeTab === 'guardian' && (
        <div className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
          <div className="py-3 px-4 bg-[#f0f5fb] border-b border-[#c5d8ef] font-bold text-xs md:text-sm flex items-center gap-2">
            <i className="ti ti-users text-[#185fa5]"></i> Guardian Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              ['Father Name', student.fatherName || '—'],
              ['Father Phone', student.fatherPhone || '—'],
              ['Home Address', student.address || '—']
            ].map(([label, value]) => (
              <div key={label} className="py-3 px-4 border-b border-[#eef3f9]">
                <div className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-xs md:text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && feeData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#e1f5ee] text-[#0f6e56]"><i className="ti ti-coin"></i></div>
              <div><div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</div><div className="text-[11px] text-[#4a5568]">Collected</div></div>
            </div>
            <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#fcebeb] text-[#a32d2d]"><i className="ti ti-alert-circle"></i></div>
              <div><div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</div><div className="text-[11px] text-[#4a5568]">Outstanding</div></div>
            </div>
            <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#e6f1fb] text-[#185fa5]"><i className="ti ti-calendar"></i></div>
              <div><div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(student.monthlyFee)}</div><div className="text-[11px] text-[#4a5568]">Monthly</div></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
            <div className="py-3 px-4 bg-[#f0f5fb] border-b border-[#c5d8ef] font-bold text-xs md:text-sm flex items-center gap-2">
              <i className="ti ti-list-check text-[#185fa5]"></i> Monthly Tuition Records 2026
            </div>
            {FEE_MONTHS.map((month) => {
              const record = feeData.monthlyRecords?.[month] || { status: 'Unpaid', amount: student.monthlyFee };
              const isPayable = record.status === 'Unpaid' || record.status === 'Partial';

              return (
                <div key={month} className="flex items-center gap-3 py-3 px-4 border-b border-[#eef3f9] last:border-none flex-wrap">
                  <div className="min-w-[100px] font-semibold text-xs md:text-sm text-gray-900">{month} 2026</div>
                  <div className="text-xs md:text-sm text-[#4a5568]">{formatCurrency(record.amount)}</div>
                  {record.status === 'Partial' && (
                    <div className="text-[11px] text-[#ba7517] font-semibold">Paid: {formatCurrency(record.paidAmount)}</div>
                  )}
                  <span className={`inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadgeClass(record.status)}`}>
                    {record.status}
                  </span>
                  <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                    {isPayable && (
                      <button
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowPayModal(true);
                        }}
                        className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#0f6e56] hover:bg-emerald-800 text-white inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <i className="ti ti-cash"></i> Pay Fee
                      </button>
                    )}
                    <button
                      onClick={() => handlePrintChallan(month)}
                      className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#e1f5ee] text-[#0f6e56] hover:bg-emerald-100 inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <i className="ti ti-printer"></i> Print Challan
                    </button>
                    {record.paidDate && (
                      <span className="text-xs text-[#4a5568]">{record.paidDate}</span>
                    )}
                    {record.receipt && (
                      <span className="text-[10px] text-[#4a5568]">#{record.receipt}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Payment Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Tuition Fee Payment">
        <PaymentForm
          student={student}
          month={selectedMonth}
          onPay={handlePayFee}
          onCancel={() => setShowPayModal(false)}
        />
      </Modal>
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ student, month, onPay, onCancel }) => {
  const record = student?.feeRecords?.[`${month}_2026`] || { amount: student?.monthlyFee || 2000 };
  const amountDue = record.status === 'Partial'
    ? record.amount - (record.paidAmount || 0)
    : record.amount;

  const [amount, setAmount] = useState(amountDue);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [receipt, setReceipt] = useState(`RCP${Math.floor(10000 + Math.random() * 89999)}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    onPay(month, amount, paymentDate, receipt);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-[#e1f5ee] text-[#0c447c] p-4 rounded-lg mb-[18px] text-xs md:text-sm leading-relaxed shadow-sm">
        <strong>Student:</strong> {student?.name} ({student?.id})<br />
        <strong>Class / Section:</strong> {student?.className} - {student?.section}<br />
        <strong>Billing Month:</strong> {month} 2026<br />
        <strong>Net Amount Due:</strong> <strong>{formatCurrency(amountDue)}</strong>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Amount Received (Rs) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            required
            className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Payment Date *</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#4a5568] uppercase tracking-wider">Receipt Number *</label>
          <input
            type="text"
            value={receipt}
            onChange={(e) => setReceipt(e.target.value)}
            required
            className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-5">
        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-white text-[#185fa5] border border-[#185fa5]">
          Cancel
        </button>
        <button type="submit" className="py-2 px-4 rounded-[10px] text-sm font-semibold bg-[#0f6e56] text-white hover:bg-emerald-800">
          Confirm Payment
        </button>
      </div>
    </form>
  );
};

export default StudentPortal;