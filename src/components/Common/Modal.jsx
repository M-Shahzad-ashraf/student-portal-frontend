import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        <div className="p-4 px-5 border-b border-[#c5d8ef] flex items-center justify-between sticky top-0 bg-white z-10">
          <span className="font-bold text-sm md:text-base text-gray-900">{title}</span>
          <button
            onClick={onClose}
            className="py-1 px-2.5 rounded-lg text-xs font-semibold border border-[#185fa5] bg-white text-[#185fa5] hover:bg-[#e6f1fb] inline-flex items-center gap-1 transition-all"
          >
            <IoCloseOutline size={16} />
          </button>
        </div>
        <div className="p-5 md:p-6 flex-1">{children}</div>
        {footer && (
          <div className="p-3.5 px-5 border-t border-[#c5d8ef] flex gap-2.5 justify-end sticky bottom-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;