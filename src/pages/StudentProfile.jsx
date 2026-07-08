import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoPeopleOutline,
  IoWalletOutline,
  IoCashOutline,
  IoPencil,
  IoPrintOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { studentsAPI } from '../api/students';
import { feesAPI } from '../api/fees';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import {
  getInitials,
  getCampusColor,
  getStatusBadgeClass,
  formatCurrency,
  getLocalDateString,
  formatDisplayDate,
  getCurrentMonthName,
  getAcademicYearStart,
  getAcademicYearLabel,
  getFeeYearForMonth,
  findFeeRecord,
  buildMonthlyRecordsMap,
  getDefaultFeeRecord,
  resolveStudentFeeStartMonth,
  isMonthBeforeFeeStart,
} from '../utils/helpers';
import { FEE_MONTHS, CAMPUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [payingMonth, setPayingMonth] = useState(null);

  const academicStartYear = getAcademicYearStart();
  const academicYearLabel = getAcademicYearLabel(academicStartYear);
  const currentMonth = getCurrentMonthName();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const studentRes = await studentsAPI.getById(id);
      const studentData = studentRes.data?.data || studentRes.data;
      if (!studentData) {
        throw new Error('Student not found');
      }
      setStudent(studentData);

      try {
        const feeRes = await feesAPI.getStudentSummary(id);
        setFeeData(feeRes.data?.data || feeRes.data);
      } catch {
        setFeeData(null);
      }
    } catch (error) {
      toast.error('Failed to load student data');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeUpdate = async (month, data) => {
    try {
      const year = getFeeYearForMonth(month, academicStartYear);
      await feesAPI.updateFee(id, month, year, data);
      toast.success('Fee updated successfully');
      setShowFeeModal(false);
      fetchStudent();
    } catch (error) {
      toast.error('Failed to update fee');
    }
  };

  const openChallanPdf = async (month, year, targetWindow) => {
    // Use the PDF endpoint directly because it needs the auth header.
    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const pdfUrl = `${apiBase}/fees/student/${id}/challan/${month}/${year}/pdf`;
    const res = await fetch(pdfUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('PDF generation failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  };

  const handlePrintChallan = async (month) => {
    try {
      const year = getFeeYearForMonth(month, academicStartYear);
      await openChallanPdf(month, year);
    } catch (error) {
      toast.error('Failed to generate challan');
    }
  };

  const handlePayFee = async (month, record) => {
    const year = getFeeYearForMonth(month, academicStartYear);
    const amount = record?.amount || student.monthlyFee || 0;
    const receipt = record?.receipt || `RCP${Date.now()}`;
    const paidWindow = window.open('', '_blank');

    setPayingMonth(month);
    try {
      await feesAPI.updateFee(id, month, year, {
        status: 'Paid',
        amount,
        paidAmount: amount,
        paidDate: getLocalDateString(),
        receipt,
      });
      toast.success('Fee paid successfully');
      await fetchStudent();
      await openChallanPdf(month, year, paidWindow);
    } catch (error) {
      if (paidWindow && !paidWindow.closed) paidWindow.close();
      toast.error(error.response?.data?.message || 'Failed to pay fee');
    } finally {
      setPayingMonth(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!student) return <div className="text-center py-8">Student not found</div>;

  const campus = CAMPUSES.find((c) => c.id === student.campusId);
  const monthlyRecords =
    feeData?.monthlyRecords ||
    buildMonthlyRecordsMap(student.feeRecords, academicStartYear);
  const currentRecord =
    monthlyRecords[currentMonth] ||
    findFeeRecord(student.feeRecords, currentMonth, academicStartYear) ||
    getDefaultFeeRecord(student.monthlyFee);

  const totalPaid = feeData?.totalPaid ?? 0;
  const outstanding = feeData?.outstanding ?? 0;
  const feeStartMonth = feeData?.feeStartMonth || resolveStudentFeeStartMonth(student);

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: IoPersonOutline },
    { id: 'guardian', label: 'Guardian', icon: IoPeopleOutline },
    { id: 'fees', label: 'Fees', icon: IoWalletOutline },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/students')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185fa5] hover:underline"
      >
        <IoArrowBackOutline size={16} />
        Back to Students
      </button>

      {/* Profile Hero */}
      <div
        className="rounded-xl p-5 md:p-6 text-white flex flex-col sm:flex-row sm:items-center gap-4 md:gap-5 mb-[18px]"
        style={{
          background: `linear-gradient(to bottom right, #042c53, ${getCampusColor(student.campusId)})`,
        }}
      >
        <div className="w-16 h-16 rounded-full border-4 border-white/40 flex items-center justify-center text-2xl font-bold bg-white/15 shrink-0">
          {getInitials(student.name)}
        </div>
        <div className="flex-1">
          <div className="text-lg md:text-xl font-bold">{student.name}</div>
          <div className="text-xs opacity-80 mt-1">
            {campus?.label} · {student.className || student.classId} · Section {student.section} · {student.id}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span className="bg-white/15 rounded-full px-2.5 py-0.5 text-[10px] md:text-xs">
              {student.gender === 'M' ? 'Male' : 'Female'}
            </span>
            {student.rollNo && (
              <span className="bg-white/15 rounded-full px-2.5 py-0.5 text-[10px] md:text-xs">
                Roll: {student.rollNo}
              </span>
            )}
            {student.bloodGroup && (
              <span className="bg-white/15 rounded-full px-2.5 py-0.5 text-[10px] md:text-xs">
                {student.bloodGroup}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-white border border-[#c5d8ef] rounded-lg p-1.5 mb-[16px] flex-wrap">
        {tabs.map(({ id: tab, label, icon: Icon }) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-[10px] text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
              activeTab === tab
                ? 'bg-[#185fa5] text-white'
                : 'bg-white text-[#185fa5] border border-[#185fa5] hover:bg-[#e6f1fb]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
          <div className="py-3 px-4 bg-[#f0f5fb] border-b border-[#c5d8ef] font-bold text-xs md:text-sm flex items-center gap-2">
            <IoPersonOutline className="text-[#185fa5]" /> Personal Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              ['Student ID', student.id],
              ['Full Name', student.name],
              ['Roll No', student.rollNo || '—'],
              ['Gender', student.gender === 'M' ? 'Male' : 'Female'],
              ['Date of Birth', formatDisplayDate(student.dob)],
              ['Blood Group', student.bloodGroup || '—'],
              ['B-Form', student.bForm || '—'],
              ['Email', student.email || '—'],
              ['Campus', campus?.label || student.campusId],
              ['Class', student.className || student.classId],
              ['Section', student.section],
              ['Monthly Fee', formatCurrency(student.monthlyFee || 0)],
              ['Fee Start Month', feeStartMonth],
              ['Admission', formatDisplayDate(student.admissionDate)],
              ['Address', student.address || '—'],
            ].map(([label, value]) => (
              <div key={label} className="py-3 px-4 border-b border-[#eef3f9]">
                <div className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase tracking-wider mb-0.5">
                  {label}
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'guardian' && (
        <div className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
          <div className="py-3 px-4 bg-[#f0f5fb] border-b border-[#c5d8ef] font-bold text-xs md:text-sm flex items-center gap-2">
            <IoPeopleOutline className="text-[#185fa5]" /> Guardian Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              ['Father Name', student.fatherName || '—'],
              ['Father Phone', student.fatherPhone || '—'],
              ['Home Address', student.address || '—'],
            ].map(([label, value]) => (
              <div key={label} className="py-3 px-4 border-b border-[#eef3f9]">
                <div className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase tracking-wider mb-0.5">
                  {label}
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <>
          <div className="bg-[#e6f1fb] border border-[#185fa5] rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-[#185fa5] uppercase tracking-wider">Current Month</div>
              <div className="text-base md:text-lg font-bold text-gray-900">
                {currentMonth} {getFeeYearForMonth(currentMonth, academicStartYear)}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-[#4a5568]">{formatCurrency(currentRecord.amount || student.monthlyFee)}</span>
              <span className={`inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadgeClass(currentRecord.status)}`}>
                {currentRecord.status || 'Unpaid'}
              </span>
              {(currentRecord.status === 'Unpaid' || currentRecord.status === 'Partial') && (
                <button
                  type="button"
                  onClick={() => handlePayFee(currentMonth, currentRecord)}
                  disabled={payingMonth === currentMonth}
                  className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#0f6e56] hover:bg-emerald-800 text-white inline-flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <IoCashOutline size={14} /> {payingMonth === currentMonth ? 'Paying...' : 'Pay Fee'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0 bg-[#e1f5ee] text-[#0f6e56]">
                <IoCheckmarkCircleOutline size={20} />
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</div>
                <div className="text-[11px] text-[#4a5568]">Collected</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0 bg-[#fcebeb] text-[#a32d2d]">
                <IoAlertCircleOutline size={20} />
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(outstanding)}</div>
                <div className="text-[11px] text-[#4a5568]">Outstanding</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0 bg-[#e6f1fb] text-[#185fa5]">
                <IoCalendarOutline size={20} />
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(student.monthlyFee || 0)}</div>
                <div className="text-[11px] text-[#4a5568]">Monthly</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#c5d8ef] overflow-hidden shadow-sm">
            <div className="py-3 px-4 bg-[#f0f5fb] border-b border-[#c5d8ef] font-bold text-xs md:text-sm flex items-center gap-2">
              <IoWalletOutline className="text-[#185fa5]" /> Monthly Tuition Records {academicYearLabel}
            </div>
            {FEE_MONTHS.map((month) => {
              const beforeFeeStart = isMonthBeforeFeeStart(student, month);
              const record =
                monthlyRecords[month] ||
                findFeeRecord(student.feeRecords, month, academicStartYear) ||
                getDefaultFeeRecord(student.monthlyFee);
              const isCurrentMonth = month === currentMonth;
              const feeYear = getFeeYearForMonth(month, academicStartYear);

              return (
                <div
                  key={month}
                  className={`flex items-center gap-3 py-3 px-4 border-b border-[#eef3f9] last:border-none flex-wrap ${
                    isCurrentMonth && !beforeFeeStart ? 'bg-[#f8fbff] ring-1 ring-inset ring-[#185fa5]/20' : ''
                  } ${beforeFeeStart ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  <div className="min-w-[120px]">
                    <div className="font-semibold text-xs md:text-sm text-gray-900">
                      {month} {feeYear}
                      {isCurrentMonth && !beforeFeeStart && (
                        <span className="ml-1.5 text-[10px] font-bold text-[#185fa5] uppercase">Current</span>
                      )}
                    </div>
                  </div>
                  {beforeFeeStart ? (
                    <>
                      <div className="text-xs md:text-sm text-[#4a5568]">—</div>
                      <span className="inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-gray-100 text-gray-500">
                        N/A
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="text-xs md:text-sm text-[#4a5568]">{formatCurrency(record.amount || student.monthlyFee)}</div>
                      {record.status === 'Partial' && (
                        <div className="text-[11px] text-[#ba7517] font-semibold">
                          Paid: {formatCurrency(record.paidAmount || 0)}
                        </div>
                      )}
                      <span className={`inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadgeClass(record.status)}`}>
                        {record.status || 'Unpaid'}
                      </span>
                      <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMonth(month);
                            setShowFeeModal(true);
                          }}
                          className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#faeeda] text-[#ba7517] hover:bg-[#f3dfbe] inline-flex items-center gap-1"
                        >
                          <IoPencil size={14} /> Update
                        </button>
                        {(record.status === 'Unpaid' || record.status === 'Partial') && (
                          <button
                            type="button"
                            onClick={() => handlePayFee(month, record)}
                            disabled={payingMonth === month}
                            className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#0f6e56] hover:bg-emerald-800 text-white inline-flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <IoCashOutline size={14} /> {payingMonth === month ? 'Paying...' : 'Pay Fee'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePrintChallan(month)}
                          className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#e1f5ee] text-[#0f6e56] hover:bg-emerald-100 inline-flex items-center gap-1"
                        >
                          <IoPrintOutline size={14} /> Challan
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        title={`Update Fee - ${selectedMonth} ${getFeeYearForMonth(selectedMonth, academicStartYear)}`}
      >
        <FeeForm
          student={student}
          month={selectedMonth}
          academicStartYear={academicStartYear}
          onSave={handleFeeUpdate}
          onCancel={() => setShowFeeModal(false)}
        />
      </Modal>
    </div>
  );
};

const FeeForm = ({ student, month, academicStartYear, onSave, onCancel }) => {
  const existing =
    findFeeRecord(student.feeRecords, month, academicStartYear) ||
    getDefaultFeeRecord(student.monthlyFee);

  const [status, setStatus] = useState(existing.status || 'Unpaid');
  const [amount, setAmount] = useState(existing.amount || student.monthlyFee);
  const [paidAmount, setPaidAmount] = useState(existing.paidAmount || '');
  const [paidDate, setPaidDate] = useState(
    existing.paidDate ? String(existing.paidDate).slice(0, 10) : getLocalDateString(),
  );
  const [receipt, setReceipt] = useState(existing.receipt || `RCP${Math.floor(10000 + Math.random() * 89999)}`);

  const handleSubmit = () => {
    const data = { status, amount, paidDate, receipt };
    if (status === 'Paid') data.paidAmount = amount;
    else if (status === 'Partial') data.paidAmount = paidAmount;
    onSave(month, data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm">
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase">Full Amount (Rs)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      {status === 'Partial' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase">Paid Amount (Rs)</label>
          <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(parseInt(e.target.value, 10) || 0)} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase">Payment Date</label>
        <input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[10px] md:text-[11px] font-bold text-[#4a5568] uppercase">Receipt No</label>
        <input type="text" value={receipt} onChange={(e) => setReceipt(e.target.value)} className="py-2 px-3 border border-[#c5d8ef] rounded-lg text-sm" />
      </div>
      <div className="md:col-span-2 flex gap-2 justify-end mt-2">
        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-lg text-sm font-semibold bg-white text-[#185fa5] border border-[#185fa5]">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} className="py-2 px-4 rounded-lg text-sm font-semibold bg-[#185fa5] text-white">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;
