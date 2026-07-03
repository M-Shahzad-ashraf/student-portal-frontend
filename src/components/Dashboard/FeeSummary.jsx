import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/helpers';

const FeeSummary = ({ feeData }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Measure container width after mount
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const data = [
    { name: 'Paid', value: feeData?.paidAmount || 0, color: '#0f6e56' },
    { name: 'Partial', value: feeData?.partialAmount || 0, color: '#ba7517' },
    { name: 'Unpaid', value: feeData?.unpaidAmount || 0, color: '#a32d2d' },
  ];

  // Filter out zero values
  const filteredData = data.filter(item => item.value > 0);

  // If all values are zero, show placeholder
  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#c5d8ef] p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3 text-gray-800">Fee Collection Summary</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No fee data available
        </div>
      </div>
    );
  }

  // For small screens, don't show chart
  if (containerWidth < 300) {
    return (
      <div className="bg-white rounded-lg border border-[#c5d8ef] p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3 text-gray-800">Fee Collection Summary</h3>
        <div className="space-y-3">
          {filteredData.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{item.name}</span>
              <span className="font-bold" style={{ color: item.color }}>
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#c5d8ef] p-4 shadow-sm" ref={containerRef}>
      <h3 className="font-bold text-sm mb-3 text-gray-800">Fee Collection Summary</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={true}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeeSummary;