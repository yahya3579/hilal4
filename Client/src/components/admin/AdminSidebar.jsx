import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../utils/store";

const AdminSidebar = () => {
    const location = useLocation();
    const userRole = useAuthStore((state) => state.userRole);
    const isDashboardActive =
        location.pathname === "/admin" || location.pathname === "/admin/dashboard";

    const menuItems = [
        { label: "Bill-Boards", path: "bill-boards-management" },
        { label: "Article Gallery", path: "articles-management" },
        { label: "Magazines", path: "magazine-management" },
        { label: "Article Comments", path: "comment-management" },
        { label: "E-Books", path: "ebooks-management" },
        { label: "Videos", path: "videos-management" },
        { label: "Packages", path: "packages-management" },
        { label: "Authors", path: "authors-management" },
        { label: "Publications", path: "publications-management" },
        { label: "Categories", path: "categories-management" },
    ];

    const filteredMenuItems =
        userRole === "author"
            ? menuItems.filter(
                (item) =>
                    item.label === "Article Gallery" || item.label === "Article Comments"
            )
            : menuItems;

    return (
        <div className="w-64 h-full bg-gray-300 p-4 overflow-y-auto">
            {/* Dashboard Header Link */}
            {userRole === "admin" && (
                <Link to={`/admin/dashboard`}>
                    <h1
                        className={`w-[95%] mx-auto mb-3 mt-4 font-poppins font-bold text-[24px] leading-[100%] tracking-[-0.03em] capitalize transition-colors duration-200 ${isDashboardActive ? "text-[#DF1600]" : "text-[#292D32] hover:text-gray-600"
                            }`}
                    >
                        Dashboard
                    </h1>
                </Link>
            )}
            {/* Sidebar Menu Items */}
            <nav>
                <ul className="space-y-4 w-[95%] mx-auto">
                    {filteredMenuItems.map((item, index) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <li key={index}>
                                <Link
                                    to={`/admin/${item.path}`}
                                    className={`block py-3 px-2 border-b border-black font-poppins font-medium text-[19.32px] leading-[100%] tracking-[-0.03em] capitalize transition-colors duration-200 ${isActive ? "text-[#DF1600]" : "text-[#292D32] hover:text-gray-600"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;
