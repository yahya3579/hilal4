import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
    return (
        <>
            <Navbar />
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content – scroll only if overflow */}
                <div style={{ scrollbarWidth: "none" }} className="flex-1  overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default AdminLayout;
