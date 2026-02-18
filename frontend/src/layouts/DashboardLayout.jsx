import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-[100dvh] flex bg-[#0b1220]">
      <Sidebar />

      <main
        className="
          flex-1
          overflow-y-auto
          transition-all duration-300
          ml-0
          lg:ml-[74px]
        "
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
