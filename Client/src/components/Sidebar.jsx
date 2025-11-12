// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { FaHome, FaInfoCircle, FaEnvelope } from "react-icons/fa";

const Sidebar = () => {
    return (
        <div className="w-64 h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white p-5 fixed shadow-lg">
            <h2 className="text-2xl font-bold mb-8 text-center border-b border-blue-600 pb-4">Hilal Portal</h2>
            <nav className="flex flex-col space-y-5">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                            ? "bg-blue-700 text-white shadow-md"
                            : "hover:bg-blue-800/50"
                        }`
                    }
                >
                    <FaHome className="text-lg" />
                    <span>Home</span>
                </NavLink>
                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                            ? "bg-blue-700 text-white shadow-md"
                            : "hover:bg-blue-800/50"
                        }`
                    }
                >
                    <FaInfoCircle className="text-lg" />
                    <span>About</span>
                </NavLink>
                <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                            ? "bg-blue-700 text-white shadow-md"
                            : "hover:bg-blue-800/50"
                        }`
                    }
                >
                    <FaEnvelope className="text-lg" />
                    <span>Contact</span>
                </NavLink>
            </nav>
            <div className="absolute bottom-4 left-0 w-full px-5 text-center text-sm text-gray-400">
                <p>© 2023 Hilal Portal</p>
            </div>
        </div>
    );
};

export default Sidebar;
