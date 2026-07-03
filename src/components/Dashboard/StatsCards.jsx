import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: "👨‍🎓",
      color: "bg-[#e6f1fb] text-[#185fa5]"
    },
    {
      title: "Fee Collection (June)",
      value: formatCurrency(stats?.feeCollection || 0),
      icon: "💰",
      color: "bg-[#e1f5ee] text-[#0f6e56]"
    },
    {
      title: "Paid Students",
      value: stats?.paidStudents || 0,
      icon: "✅",
      color: "bg-[#e1f5ee] text-[#0f6e56]"
    },
    {
      title: "Pending Students",
      value: stats?.pendingStudents || 0,
      icon: "⏳",
      color: "bg-[#fcebeb] text-[#a32d2d]"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats?.totalExpenses || 0),
      icon: "📊",
      color: "bg-[#fcebeb] text-[#a32d2d]"
    },
    {
      title: "Net Balance",
      value: formatCurrency(stats?.netBalance || 0),
      icon: "🏦",
      color: stats?.netBalance >= 0 ? "bg-[#e1f5ee] text-[#0f6e56]" : "bg-[#fcebeb] text-[#a32d2d]"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg border border-[#c5d8ef] p-4 flex items-center gap-3.5 shadow-sm">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 ${card.color}`}>
            {card.icon}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568]">{card.title}</div>
            <div className="text-lg md:text-xl font-bold text-gray-900">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;