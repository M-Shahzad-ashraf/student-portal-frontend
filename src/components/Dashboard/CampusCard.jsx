import React from 'react';

const CampusCard = ({ campus, stats, onClick }) => {
  const getGradient = () => {
    switch (campus.id) {
      case 'girls': return 'from-[#72243e] to-[#993556]';
      case 'kids': return 'from-[#633806] to-[#854f0b]';
      default: return 'from-[#0c447c] to-[#185fa5]';
    }
  };

  return (
    <div
      onClick={() => onClick(campus.id)}  // ✅ Pass campus.id, not the whole object
      className={`rounded-2xl p-7 relative overflow-hidden text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer bg-gradient-to-br ${getGradient()}`}
    >
      <span className="text-4xl mb-3 block">{campus.icon}</span>
      <h2 className="font-amiri text-2xl font-bold">{campus.label}</h2>
      <p className="text-[13px] opacity-80 mt-1">{stats?.classes || 0} classes · {stats?.students || 0} students</p>
      <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
        <div className="text-center">
          <div className="text-lg font-bold">{stats?.students || 0}</div>
          <div className="text-[10px] opacity-75 uppercase tracking-wide">Students</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{stats?.classes || 0}</div>
          <div className="text-[10px] opacity-75 uppercase tracking-wide">Classes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{stats?.paidStudents || 0}</div>
          <div className="text-[10px] opacity-75 uppercase tracking-wide">Fee Paid</div>
        </div>
      </div>
      <i className="ti ti-arrow-right absolute bottom-5 right-5 opacity-50 text-2xl"></i>
    </div>
  );
};

export default CampusCard;