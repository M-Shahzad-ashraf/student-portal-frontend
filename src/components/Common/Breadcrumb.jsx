import React from 'react';

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center gap-2 text-xs md:text-sm text-[#4a5568] mb-[18px] flex-wrap">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index < items.length - 1 ? (
            <>
              <span
                className="cursor-pointer text-[#185fa5] hover:underline"
                onClick={item.onClick}
              >
                {item.label}
              </span>
              <span className="text-gray-300">/</span>
            </>
          ) : (
            <span className="font-semibold text-gray-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;