import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-3 border-[#185fa5] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;