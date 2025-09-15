import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen flex bg-purple-950">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300  ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
        
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
