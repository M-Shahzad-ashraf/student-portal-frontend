// src/components/Students/StudentTable.jsx
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoPencil, IoTrashOutline } from 'react-icons/io5';
import { getInitials, getCampusColor, getStatusBadgeClass, getCurrentMonthName, findFeeRecord } from '../../utils/helpers';
import { CAMPUSES } from '../../utils/constants';

const currentMonthLabel = getCurrentMonthName();

const getCurrentMonthFeeStatus = (student) =>
  findFeeRecord(student?.feeRecords, currentMonthLabel)?.status || 'Unpaid';

const getGenderLabel = (gender) => {
  if (gender === 'M') return 'Male';
  if (gender === 'F') return 'Female';
  return '';
};

const StudentTable = ({ students = [], onEdit, onDelete }) => {
  const navigate = useNavigate();

  // ✅ Safe check
  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-xs md:text-sm min-w-[900px]">
          <thead className="bg-[#f0f5fb] text-[#4a5568] text-[11px] font-bold uppercase tracking-wider text-left border-b border-[#c5d8ef]">
            <tr>
              <th className="py-3 px-3.5">Student ID</th>
              <th className="py-3 px-3.5">Student</th>
              <th className="py-3 px-3.5">Campus</th>
              <th className="py-3 px-3.5">Class/Section</th>
              <th className="py-3 px-3.5">Father</th>
              <th className="py-3 px-3.5">{currentMonthLabel} Fee</th>
              <th className="py-3 px-3.5 min-w-[220px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="text-center text-[#4a5568] py-8">No students found</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-xs md:text-sm min-w-[900px]">
        <thead className="bg-[#f0f5fb] text-[#4a5568] text-[11px] font-bold uppercase tracking-wider text-left border-b border-[#c5d8ef]">
          <tr>
            <th className="py-3 px-3.5">Student ID</th>
            <th className="py-3 px-3.5">Student</th>
            <th className="py-3 px-3.5">Campus</th>
            <th className="py-3 px-3.5">Class/Section</th>
            <th className="py-3 px-3.5">Father</th>
            <th className="py-3 px-3.5">{currentMonthLabel} Fee</th>
            <th className="py-3 px-3.5 min-w-[220px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const campus = CAMPUSES.find(c => c.id === student?.campusId);
            const feeStatus = getCurrentMonthFeeStatus(student);
            const genderLabel = getGenderLabel(student?.gender);
            const studentId = student?.id || '-';
            const classSection = [student?.className || student?.classId, student?.section].filter(Boolean).join(' / ') || '-';

            return (
              <tr key={student?.id || index} className="hover:bg-[#f8fbff]">
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle font-semibold text-[#185fa5]">{studentId}</td>
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/students/${student?.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/students/${student?.id}`)}
                  >
                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: getCampusColor(student?.campusId), color: '#fff' }}>
                      {getInitials(student?.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{student?.name || '-'}</div>
                      <div className="text-[11px] text-[#4a5568]">{genderLabel || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">
                  <span className="inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-[#e6f1fb] text-[#185fa5]">
                    {campus?.label || student?.campusId || '-'}
                  </span>
                </td>
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{classSection}</td>
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">{student?.fatherName || '-'}</td>
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">
                  <span className={`inline-block py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadgeClass(feeStatus)}`}>
                    {feeStatus}
                  </span>
                </td>
                <td className="py-3 px-3.5 border-b border-[#eef3f9] align-middle">
                  <div className="flex gap-1.5 flex-nowrap">
                    <button
                      type="button"
                      title="View student profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/students/${student?.id}`);
                      }}
                      className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <IoEyeOutline size={14} />
                      View
                    </button>
                    <button
                      type="button"
                      title="Edit student"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(student);
                      }}
                      className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#faeeda] text-[#ba7517] hover:bg-[#f3dfbe] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <IoPencil size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      title="Delete student"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(student?.id);
                      }}
                      className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-[#fcebeb] text-[#a32d2d] hover:bg-red-100 inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <IoTrashOutline size={14} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
