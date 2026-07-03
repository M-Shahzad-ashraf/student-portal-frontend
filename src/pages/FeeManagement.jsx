import React, { useState, useEffect } from 'react';
import { feesAPI } from '../api/fees';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';
import { CAMPUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const getCurrentMonth = () => MONTHS[new Date().getMonth()];
const getCurrentYear  = () => new Date().getFullYear();

const FeeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Dynamic month/year — default to current
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear]   = useState(getCurrentYear());

  // Year options: last 2 years up to next year
  const yearOptions = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const overviewRes = await feesAPI.getOverview({ month: selectedMonth, year: selectedYear });
      setOverview(overviewRes.data?.data || overviewRes.data);

      const reportRes = await feesAPI.getMonthlyReport(selectedMonth, selectedYear);
      // Build defaulters list from report
      const reportData = reportRes.data?.data || [];
      const defs = reportData
        .filter(r => r.feeStatus === 'Unpaid' || r.feeStatus === 'Partial')
        .map(r => ({
          id: r.studentId,
          name: r.studentName,
          campus: r.campusId,
          className: r.classId,
          section: r.section,
          fatherPhone: r.fatherPhone,
          unpaidMonths: r.feeStatus,
          outstanding: r.monthlyFee - (r.paidAmount || 0),
        }));
      setDefaulters(defs);
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.response?.data?.message || 'Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Support both API response shapes
  const ovData = overview?.data || overview;

  return (
    <div>
      {/* Header with month/year selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-lg md:text-xl font-bold text-gray-900">
          Fee Overview — {selectedMonth} {selectedYear}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer"
          >
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#e1f5ee] text-[#0f6e56]"><i className="ti ti-check-circle"></i></div>
          <div><div className="text-lg md:text-xl font-bold text-gray-900">{ovData?.paid || 0}</div><div className="text-[11px] text-[#4a5568]">Paid</div></div>
        </div>
        <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#fcebeb] text-[#a32d2d]"><i className="ti ti-x"></i></div>
          <div><div className="text-lg md:text-xl font-bold text-gray-900">{ovData?.unpaid || 0}</div><div className="text-[11px] text-[#4a5568]">Unpaid</div></div>
        </div>
        <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#faeeda] text-[#ba7517]"><i className="ti ti-coins"></i></div>
          <div><div className="text-lg md:text-xl font-bold text-gray-900">{ovData?.partial || 0}</div><div className="text-[11px] text-[#4a5568]">Partial</div></div>
        </div>
        <div className="bg-white rounded-lg border border-[#c5d8ef] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-lg shrink-0 bg-[#e6f1fb] text-[#185fa5]"><i className="ti ti-coin"></i></div>
          <div><div className="text-lg md:text-xl font-bold text-gray-900">{formatCurrency(ovData?.totalCollected || ovData?.collected || 0)}</div><div className="text-[11px] text-[#4a5568]">Collected</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('overview')} className={`py-1.5 px-4 rounded-lg text-xs md:text-sm font-semibold cursor-pointer ${activeTab === 'overview' ? 'bg-[#185fa5] text-white' : 'bg-white text-[#185fa5] border border-[#185fa5]'}`}>
          Monthly Campus Grid
        </button>
        <button onClick={() => setActiveTab('defaulters')} className={`py-1.5 px-4 rounded-lg text-xs md:text-sm font-semibold cursor-pointer ${activeTab === 'defaulters' ? 'bg-[#185fa5] text-white' : 'bg-white text-[#185fa5] border border-[#185fa5]'}`}>
          Outstanding Defaulters Register
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && ovData?.campusData && (
        <div>
          {CAMPUSES.map(campus => {
            const data = ovData.campusData[campus.id];
            if (!data) return null;
            return (
              <div key={campus.id} className="bg-white rounded-[10px] border border-[#c5d8ef] overflow-hidden mb-4 shadow-sm">
                <div className="p-3.5 flex items-center gap-2 border-b border-[#c5d8ef] flex-wrap">
                  <span className="font-bold text-sm md:text-base text-gray-900">{campus.icon} {campus.label}</span>
                  <span className="inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#e6f1fb] text-[#185fa5]">{data.totalStudents} students</span>
                  <span className="ml-auto text-xs md:text-sm text-[#4a5568]">{formatCurrency(data.collected)} collected</span>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-xs md:text-sm min-w-[600px]">
                    <thead className="bg-[#f0f5fb] text-[#4a5568] text-[11px] font-bold uppercase tracking-wider text-left border-b border-[#c5d8ef]">
                      <tr><th className="py-3 px-3.5">Class</th><th className="py-3 px-3.5">Students</th><th className="py-3 px-3.5">Paid</th><th className="py-3 px-3.5">Unpaid</th><th className="py-3 px-3.5">Partial</th><th className="py-3 px-3.5">Collection</th></tr>
                    </thead>
                    <tbody>
                      {data.classes?.map(cls => (
                        <tr key={cls.id} className="hover:bg-[#f8fbff]">
                          <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle font-semibold">{cls.name}</td>
                          <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{cls.totalStudents}</td>
                          <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><span className="inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold bg-[#e1f5ee] text-[#0f6e56]">{cls.paid}</span></td>
                          <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><span className="inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold bg-[#fcebeb] text-[#a32d2d]">{cls.unpaid}</span></td>
                          <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><span className="inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold bg-[#faeeda] text-[#ba7517]">{cls.partial}</span></td>
                          <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{formatCurrency(cls.collection)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div className="bg-white rounded-[10px] border border-[#c5d8ef] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#fcf9f2] border-b border-[#c5d8ef]">
            <span className="font-bold text-gray-800"><i className="ti ti-alert-triangle text-[#ba7517] mr-1"></i> Outstanding Defaulter Register — {selectedMonth} {selectedYear}</span>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm min-w-[700px]">
              <thead className="bg-[#f0f5fb] text-[#4a5568] text-[11px] font-bold uppercase tracking-wider text-left border-b border-[#c5d8ef]">
                <tr><th className="py-3 px-3.5">ID / Name</th><th className="py-3 px-3.5">Campus / Class</th><th className="py-3 px-3.5">Father Contact</th><th className="py-3 px-3.5">Status</th><th className="py-3 px-3.5 text-right">Outstanding</th><th className="py-3 px-3.5 text-center">Action</th></tr>
              </thead>
              <tbody>
                {defaulters.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-6 text-gray-500">No defaulters found for {selectedMonth} {selectedYear}</td></tr>
                ) : (
                  defaulters.map(def => (
                    <tr key={def.id} className="hover:bg-red-50/40">
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><div className="font-bold text-gray-900">{def.name}</div><div className="text-[10px] text-[#4a5568]">{def.id}</div></td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><div>{def.campus}</div><div className="text-xs text-gray-500">{def.className} ({def.section})</div></td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{def.fatherPhone || '—'}</td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-[#ba7517] font-semibold">{def.unpaidMonths}</td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-right font-bold text-red-600">{formatCurrency(def.outstanding)}</td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-center">
                        <button className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#0f6e56] text-white">Quick Pay</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;