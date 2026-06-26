import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goldGradient = "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)";

  return (
    <nav
      className="w-full px-8 py-4 flex items-center justify-between"
      style={{ background: "#1c1c1c", borderBottom: "1px solid #8a7a5a" }}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="ResIQ" className="w-8 h-8 object-contain" />
        <span
          className="text-xl font-bold tracking-wide"
          style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          ResIQ
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/history")}
          className="text-sm font-medium transition hover:opacity-80"
          style={{ color: "#a89070" }}
        >
          History
        </button>

        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(90deg, #c9a84c, #a8956e)", color: "#1a1a1a" }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm" style={{ color: "#e8d5a3" }}>
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm font-medium px-4 py-2 rounded-lg transition hover:opacity-80"
          style={{ border: "1px solid #8a7a5a", color: "#c9a84c" }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;