// src/layouts/MainLayout.jsx
import Footer from "../components/Footer";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="overflow-x-hidden max-w-full w-full">
            {/* <Header /> */}
            <Navbar />
            <div className="py-4 w-full max-w-full">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
