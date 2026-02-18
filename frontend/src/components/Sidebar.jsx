import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FileBarChart,
  NotebookPen,
  UserPlus,
  Edit,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  ClipboardList
} from "lucide-react";

const menuItems = (role) => [
  { label: "Dashboard", icon: FileBarChart, path: "/", show: true },
  {
    label: "Create Report",
    icon: NotebookPen,
    path: "/createreport",
    show: role === "user" || role === "manager"
  },
  {
    label: "Register",
    icon: FilePlus,
    path: "/createregistration",
    show: role === "user" || role === "manager"
  },
  { label: "Registrations", icon: ClipboardList, path: "/getregistration", show: true },
  { label: "Register User", icon: UserPlus, path: "/register", show: role === "admin" },
  { label: "Edit Users", icon: Edit, path: "/editUsers", show: role === "admin" },
  { label: "Profile", icon: User, path: "/profile", show: true }
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserRole(user.role || null);
      } catch {
        console.error("Invalid user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile open button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="
            fixed top-4 left-4 z-[60]
            lg:hidden
            h-10 w-10
            flex items-center justify-center
            rounded-xl
            bg-[#0b0b0d]
            text-white/80 hover:text-white
            border border-white/10
            shadow-xl
          "
        >
          <ChevronRight size={20} />
        </button>
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-[#0b0b0d]
          border-r border-white/5
          transition-all duration-300 ease-out

          ${
            isExpanded
              ? "w-[260px]"
              : "w-0 lg:w-[74px]"
          }

          overflow-hidden lg:overflow-visible
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <span
            className={`
              text-white font-semibold tracking-wide
              transition-all duration-300
              ${isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
            `}
          >
            ROF
          </span>

          {/* Desktop toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              hidden lg:flex
              h-9 w-9 items-center justify-center
              rounded-lg
              text-white/70 hover:text-white
              hover:bg-white/10
              transition
            "
          >
            {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setIsExpanded(false)}
            className="
              lg:hidden
              h-9 w-9 flex items-center justify-center
              rounded-lg
              text-white/70 hover:text-white
              hover:bg-white/10
            "
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-4 flex flex-col h-[calc(100%-64px)]">
          {menuItems(userRole)
            .filter(item => item.show)
            .map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link key={item.label} to={item.path} className="group relative ">
                  <div
                    className={`
                      flex items-center rounded-xl
                      transition-all duration-200
                      ${
                        isExpanded
                          ? "gap-4  px-4 py-3 mx-2"
                          : "h-10 w-10 mb-3 mx-auto justify-center"
                      }
                      ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={22} />
                    <span
                      className={`
                        transition-all
                        ${isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
                      `}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Tooltip */}
                  {!isExpanded && (
                    <div
                      className="
                        absolute left-[84px] top-1/2 -translate-y-1/2
                        bg-[#141417]/90 backdrop-blur
                        text-white text-xs px-3 py-1.5 rounded-lg
                        opacity-0 group-hover:opacity-100
                        pointer-events-none
                        transition
                        border border-white/10 shadow-xl
                      "
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}

          <div className="flex-1" />

          {/* Logout */}
          <button onClick={handleLogout} className="group mb-8 ">
            <div
              className={`
                flex items-center rounded-xl
                transition-all duration-200
                ${
                  isExpanded
                    ? "gap-4 px-4 py-3 mx-2"
                    : "h-10 w-10 mx-auto justify-center"
                }
                text-white/60 hover:text-red-400 hover:bg-red-500/10
              `}
            >
              <LogOut size={22} />
              <span className={`${isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                Logout
              </span>
            </div>
          </button>
        </nav>
      </aside>
    </>
  );
}
