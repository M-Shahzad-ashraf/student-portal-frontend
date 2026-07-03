import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { IoCalendarOutline, IoPersonCircleOutline, IoLogOutOutline } from 'react-icons/io5';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-gradient-to-br from-[#042c53] via-[#0c447c] to-[#185fa5] text-white py-3 px-6 flex flex-col md:flex-row md:items-center gap-4 min-h-[66px] shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-[46px] h-[46px] rounded-full bg-white/15 flex items-center justify-center text-2xl border-2 border-white/35 shrink-0">
          🕌
        </div>
        <div>
          <h1 className="font-amiri text-lg md:text-xl font-bold">
            Muslim Model High School Pattoki
          </h1>
          <p className="text-[11px] opacity-70 mt-0.5">
            Student & Fee Management System — 2025–26
          </p>
        </div>
      </div>
      <div className="md:ml-auto w-full md:w-auto flex items-center justify-between md:justify-end gap-2.5">
        <div className="bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs flex items-center gap-1.5">
          <IoCalendarOutline size={14} />
          June 2026
        </div>
        <div
          className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs cursor-pointer hover:bg-white/20 transition-colors"
          onClick={logout}
        >
          <IoPersonCircleOutline size={16} />
          <span>{user?.name || (user?.role === 'admin' ? 'Admin' : 'Student')}</span>
          <IoLogOutOutline size={12} className="opacity-70" />
        </div>
      </div>
    </div>
  );
};

export default Header;