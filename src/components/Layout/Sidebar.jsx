import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IoGridOutline, IoPeopleOutline, IoCashOutline,
  IoReceiptOutline, IoSchoolOutline, IoSettingsOutline, IoCardOutline
} from 'react-icons/io5';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: IoGridOutline },
    { path: '/students', label: 'All Students', icon: IoPeopleOutline },
    { path: '/fees', label: 'Fee System', icon: IoCashOutline },
    { path: '/expenses', label: 'Ledger / Expenses', icon: IoReceiptOutline },
    { path: '/classes', label: 'Manage Classes', icon: IoSchoolOutline },
    { path: '/settings', label: 'Settings', icon: IoSettingsOutline },
  ];

  const studentNavItems = [
    { path: '/portal', label: 'My Profile', icon: IoCardOutline },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;
  const baseTabClass = "navtab py-3 px-4 text-xs md:text-sm font-semibold transition-all duration-150 border-b-2 hover:text-[#185fa5] whitespace-nowrap flex items-center gap-1.5 cursor-pointer";

  return (
    <div className="bg-white border-b-2 border-[#c5d8ef] flex px-5 gap-0.5 shrink-0 overflow-x-auto no-scrollbar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`${baseTabClass} ${isActive
                ? 'border-[#185fa5] text-[#185fa5]'
                : 'border-transparent text-[#4a5568]'
              }`}
          >
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;