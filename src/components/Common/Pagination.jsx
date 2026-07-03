import React from 'react';

const Pagination = ({ total, pageSize, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex gap-1.5 p-2 bg-[#f8fbff] border-b border-[#c5d8ef] overflow-x-auto no-scrollbar">
      <button
        onClick={() => onPageChange('all')}
        className={`py-1 px-3 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-150 ${currentPage === 'all'
            ? 'text-white bg-[#185fa5] border-[#185fa5]'
            : 'text-[#4a5568] bg-white border border-[#c5d8ef] hover:text-[#185fa5] hover:bg-[#e6f1fb]'
          }`}
      >
        Show All ({total})
      </button>
      {getPageNumbers().map((page) => {
        const start = (page - 1) * pageSize + 1;
        const end = Math.min(page * pageSize, total);
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`py-1 px-3 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-150 ${currentPage === page
                ? 'text-white bg-[#185fa5] border-[#185fa5]'
                : 'text-[#4a5568] bg-white border border-[#c5d8ef] hover:text-[#185fa5] hover:bg-[#e6f1fb]'
              }`}
          >
            {start} - {end}
          </button>
        );
      })}
    </div>
  );
};

export default Pagination;