import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    BookOpen,
    Archive,
    Book,
    Users,
    MessageSquare,
    Video,
} from "lucide-react"

// API function to fetch dashboard stats
const fetchDashboardStats = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats/`);
        console.log("Dashboard stats response:", res.data);
        return res.data.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error.response?.data || error.message);
        throw error;
    }
};

const AdminDashboard = () => {
    const { data: dashboardStats, isLoading, error } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: fetchDashboardStats,
    });

    // Define the stats configuration with placeholders
    const statsConfig = [
        {
            title: "TOTAL ARTICLES",
            dataKey: "total_articles",
            icon: BookOpen,
            bgColor: "bg-gradient-to-br from-red-500 to-red-600",
            iconBg: "bg-red-400/30",
        },
        {
            title: "TOTAL ARCHIVE MAGAZINES",
            dataKey: "total_archived_magazines",
            icon: Archive,
            bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
            iconBg: "bg-blue-400/30",
        },
        {
            title: "TOTAL E-BOOKS",
            dataKey: "total_ebooks",
            icon: Book,
            bgColor: "bg-gradient-to-br from-green-500 to-green-600",
            iconBg: "bg-green-400/30",
        },
        {
            title: "TOTAL AUTHORS",
            dataKey: "total_authors",
            icon: Users,
            bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
            iconBg: "bg-purple-400/30",
        },
        {
            title: "TOTAL COMMENTS",
            dataKey: "total_comments",
            icon: MessageSquare,
            bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
            iconBg: "bg-orange-400/30",
        },
        {
            title: "TOTAL VIDEOS",
            dataKey: "total_videos",
            icon: Video,
            bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
            iconBg: "bg-pink-400/30",
        },
    ];

    // Create stats array with real data
    const stats = statsConfig.map(config => ({
        ...config,
        value: isLoading ? "..." : (dashboardStats?.[config.dataKey]?.toLocaleString() || "0")
    }));

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#DEE1E6] p-6 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600">Unable to fetch dashboard statistics. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DEE1E6] p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-red-600 mb-2">WELCOME TO HILAL DIGITAL WORLD</h1>
                <div className="w-full h-px bg-red-600"></div>
                <div className="w-px h-8 bg-blue-400 mx-auto mt-2"></div>
            </div>

            {/* Stats Grid - Updated for 6 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mx-auto max-w-8xl">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div
                            key={index}
                            className={`${stat.bgColor} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden`}
                        >
                            {/* Background Icon - Better positioning */}
                            <div className={`absolute top-3 right-3 ${stat.iconBg} rounded-full p-2.5 shadow-sm`}>
                                <IconComponent className="w-6 h-6 text-white" />
                            </div>

                            {/* Content - Better spacing and alignment */}
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="text-xs font-semibold mb-3 opacity-95 uppercase tracking-wide">{stat.title}</div>
                                <div className="text-3xl font-bold mb-auto">{stat.value}</div>
                                <button className="bg-black/20 hover:bg-black/30 text-white text-xs font-medium px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 mt-4 self-start">
                                    View Detail
                                    <span className="bg-white/25 rounded-full w-4 h-4 flex items-center justify-center">
                                        <span className="text-xs leading-none">→</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="text-left mt-12 text-sm text-gray-600">
                <p>
                    © Copyright 2025 Hilal ISPR. All rights reserved. Hilal Back Office Developed by{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        Media Sniffers
                    </a>
                </p>
            </div>
        </div>
    )
}

export default AdminDashboard
