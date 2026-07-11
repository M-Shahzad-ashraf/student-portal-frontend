import { useState, useEffect } from 'react';
import { feesAPI } from '../api/fees';
import { classesAPI } from '../api/classes';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';
import { CAMPUSES, FEE_MONTHS } from '../utils/constants';
import toast from 'react-hot-toast';

const CALENDAR_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getCurrentMonth = () => CALENDAR_MONTHS[new Date().getMonth()];
const getCurrentYear = () => new Date().getFullYear();

const getAcademicStartYear = (month, year) =>
  month === 'January' || month === 'February' ? year - 1 : year;

const getFeeYearForMonth = (month, academicStartYear) =>
  month === 'January' || month === 'February' ? academicStartYear + 1 : academicStartYear;

const getMonthsToSelected = (month) => {
  const selectedIndex = FEE_MONTHS.indexOf(month);
  return selectedIndex === -1 ? [month] : FEE_MONTHS.slice(0, selectedIndex + 1);
};

const getCampusLabel = (campusId) =>
  CAMPUSES.find(campus => campus.id === campusId)?.label || campusId || '-';

const FeeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [campusFilter, setCampusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [classesList, setClassesList] = useState([]);
  const [minDueMonths, setMinDueMonths] = useState(1);

  const yearOptions = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];
  const academicStartYear = getAcademicStartYear(selectedMonth, selectedYear);
  const selectedMonths = getMonthsToSelected(selectedMonth);
  const selectedClass = classesList.find(cls => cls.id === classFilter);
  const availableSections = selectedClass?.sections || [];
  const visibleDefaulters = defaulters.filter(def => def.dueMonthCount >= minDueMonths);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, campusFilter, classFilter, sectionFilter]);

  useEffect(() => {
    fetchClasses();
  }, [campusFilter]);

  useEffect(() => {
    setSectionFilter('all');
  }, [classFilter]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll(campusFilter !== 'all' ? campusFilter : undefined);
      const list = campusFilter !== 'all'
        ? response.data
        : Object.values(response.data || {}).flat();
      setClassesList(Array.isArray(list) ? list : []);
      setClassFilter('all');
      setSectionFilter('all');
    } catch (error) {
      console.error('Failed to load classes:', error);
      setClassesList([]);
      setClassFilter('all');
      setSectionFilter('all');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(campusFilter !== 'all' ? { campusId: campusFilter } : {}),
        ...(classFilter !== 'all' ? { classId: classFilter } : {}),
        ...(sectionFilter !== 'all' ? { section: sectionFilter } : {}),
      };
      const overviewRes = await feesAPI.getOverview({
        month: selectedMonth,
        year: selectedYear,
        ...params,
      });
      setOverview(overviewRes.data?.data || overviewRes.data);

      const monthlyReports = await Promise.all(
        selectedMonths.map(async (month) => {
          const year = getFeeYearForMonth(month, academicStartYear);
          const reportRes = await feesAPI.getMonthlyReport(month, year, params);
          return {
            month,
            year,
            rows: reportRes.data?.data || [],
          };
        }),
      );

      const defaulterMap = new Map();
      monthlyReports.forEach(({ month, rows }) => {
        rows.forEach((row) => {
          if (row.feeStatus !== 'Unpaid' && row.feeStatus !== 'Partial') return;

          const amount = row.amount || row.monthlyFee || 0;
          const paidAmount = row.paidAmount || 0;
          const outstanding = Math.max(0, amount - paidAmount);
          if (outstanding <= 0) return;

          const existing = defaulterMap.get(row.studentId) || {
            id: row.studentId,
            name: row.studentName,
            campusId: row.campusId,
            campus: getCampusLabel(row.campusId),
            className: row.className || row.classId,
            section: row.section,
            fatherPhone: row.fatherPhone,
            dueMonths: [],
            outstanding: 0,
          };

          existing.dueMonths.push(`${month} (${row.feeStatus})`);
          existing.outstanding += outstanding;
          defaulterMap.set(row.studentId, existing);
        });
      });

      setDefaulters(
        Array.from(defaulterMap.values())
          .map(def => ({ ...def, dueMonthCount: def.dueMonths.length }))
          .sort((a, b) => b.dueMonthCount - a.dueMonthCount || b.outstanding - a.outstanding),
      );
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.response?.data?.message || 'Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDefaulters = () => {
    const title = `Outstanding Defaulters - ${selectedMonth} ${selectedYear}`;
    const campusText = campusFilter === 'all' ? 'All Campuses' : getCampusLabel(campusFilter);
    const classText = classFilter === 'all' ? 'All Classes' : selectedClass?.name || classFilter;
    const sectionText = sectionFilter === 'all' ? 'All Sections' : `Section ${sectionFilter}`;
    const rows = visibleDefaulters.map((def, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${def.id}</td>
        <td>${def.name || ''}</td>
        <td>${def.campus}</td>
        <td>${def.className || ''} ${def.section ? `(${def.section})` : ''}</td>
        <td>${def.fatherPhone || ''}</td>
        <td>${def.dueMonths.join(', ')}</td>
        <td>${def.outstanding.toLocaleString('en-PK')}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin: 0 0 6px; }
            .meta { font-size: 12px; color: #4b5563; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
            th { background: #e6f1fb; }
            td:last-child, th:last-child { text-align: right; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">${campusText} | ${classText} | ${sectionText} | ${minDueMonths}+ due month(s) | Total students: ${visibleDefaulters.length}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Name</th>
                <th>Campus</th>
                <th>Class</th>
                <th>Father Contact</th>
                <th>Due Months</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="8">No defaulters found</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) return <LoadingSpinner />;

  const ovData = overview?.data || overview;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-lg md:text-xl font-bold text-gray-900">
          Fee Overview - {selectedMonth} {selectedYear}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={campusFilter}
            onChange={e => {
              setCampusFilter(e.target.value);
              setClassFilter('all');
              setSectionFilter('all');
            }}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer"
          >
            <option value="all">All Campuses</option>
            {CAMPUSES.map(campus => (
              <option key={campus.id} value={campus.id}>{campus.label}</option>
            ))}
          </select>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer"
          >
            <option value="all">All Classes</option>
            {classesList.map(cls => (
              <option key={`${cls.campusId}-${cls.id}`} value={cls.id}>
                {campusFilter === 'all' ? `${getCampusLabel(cls.campusId)} - ` : ''}{cls.name}
              </option>
            ))}
          </select>
          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            disabled={classFilter === 'all'}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="all">All Sections</option>
            {availableSections.map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer"
          >
            {CALENDAR_MONTHS.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
            className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-[#fafcff] focus:border-[#185fa5] outline-none cursor-pointer"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

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

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setActiveTab('overview')} className={`py-1.5 px-4 rounded-lg text-xs md:text-sm font-semibold cursor-pointer ${activeTab === 'overview' ? 'bg-[#185fa5] text-white' : 'bg-white text-[#185fa5] border border-[#185fa5]'}`}>
          Monthly Campus Grid
        </button>
        <button onClick={() => setActiveTab('defaulters')} className={`py-1.5 px-4 rounded-lg text-xs md:text-sm font-semibold cursor-pointer ${activeTab === 'defaulters' ? 'bg-[#185fa5] text-white' : 'bg-white text-[#185fa5] border border-[#185fa5]'}`}>
          Outstanding Defaulters Register
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white rounded-[10px] border border-[#c5d8ef] p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-800">
            {campusFilter === 'all' ? 'All Campuses' : getCampusLabel(campusFilter)} summary for {selectedMonth} {selectedYear}
          </div>
          <div className="text-xs text-[#4a5568] mt-1">
            Expected: {formatCurrency(ovData?.expectedTotal || 0)} | Collection Rate: {ovData?.collectionRate || 0}%
          </div>
        </div>
      )}

      {activeTab === 'defaulters' && (
        <div className="bg-white rounded-[10px] border border-[#c5d8ef] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#fcf9f2] border-b border-[#c5d8ef] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="font-bold text-gray-800"><i className="ti ti-alert-triangle text-[#ba7517] mr-1"></i> Outstanding Defaulter Register - March to {selectedMonth} {selectedYear}</span>
              <div className="text-xs text-[#4a5568] mt-1">
                {campusFilter === 'all' ? 'All Campuses' : getCampusLabel(campusFilter)}
                {' | '}
                {classFilter === 'all' ? 'All Classes' : selectedClass?.name || classFilter}
                {' | '}
                {sectionFilter === 'all' ? 'All Sections' : `Section ${sectionFilter}`}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={minDueMonths}
                onChange={e => setMinDueMonths(parseInt(e.target.value, 10))}
                className="py-1.5 px-3 border border-[#c5d8ef] rounded-lg text-sm bg-white focus:border-[#185fa5] outline-none cursor-pointer"
              >
                <option value={1}>1+ due month</option>
                <option value={2}>2+ due months</option>
                <option value={3}>3+ due months</option>
              </select>
              <button
                type="button"
                onClick={handlePrintDefaulters}
                className="py-1.5 px-3 rounded-lg text-xs md:text-sm font-semibold bg-[#185fa5] text-white hover:bg-[#378add] inline-flex items-center gap-1"
              >
                <i className="ti ti-printer"></i> Print
              </button>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm min-w-[850px]">
              <thead className="bg-[#f0f5fb] text-[#4a5568] text-[11px] font-bold uppercase tracking-wider text-left border-b border-[#c5d8ef]">
                <tr>
                  <th className="py-3 px-3.5">ID / Name</th>
                  <th className="py-3 px-3.5">Campus / Class</th>
                  <th className="py-3 px-3.5">Father Contact</th>
                  <th className="py-3 px-3.5">Due Months</th>
                  <th className="py-3 px-3.5 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {visibleDefaulters.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-6 text-gray-500">No defaulters found for this filter</td></tr>
                ) : (
                  visibleDefaulters.map(def => (
                    <tr key={def.id} className="hover:bg-red-50/40">
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><div className="font-bold text-gray-900">{def.name}</div><div className="text-[10px] text-[#4a5568]">{def.id}</div></td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle"><div>{def.campus}</div><div className="text-xs text-gray-500">{def.className} ({def.section})</div></td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{def.fatherPhone || '-'}</td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-[#ba7517] font-semibold">
                        <div>{def.dueMonthCount} month(s)</div>
                        <div className="text-[11px] text-[#4a5568] font-normal">{def.dueMonths.join(', ')}</div>
                      </td>
                      <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle text-right font-bold text-red-600">{formatCurrency(def.outstanding)}</td>
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
