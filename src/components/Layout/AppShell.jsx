// src/components/Layout/AppShell.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const AppShell = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Sidebar />
      <div className="flex-1 py-5 px-3 md:px-6 max-w-[1200px] w-full mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AppShell;