import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content with left padding to avoid overlap */}
      <div className="pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="p-6 bg-[#f9fafb] dark:bg-slate-800 flex-1 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
