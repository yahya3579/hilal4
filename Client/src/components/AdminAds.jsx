import React from "react";

export default function AdminDashboard() {
  const adsData = [
    {
      id: "AD # 001",
      advertisement: "/placeholder.svg",
      dimensions: "522*100",
      hasImage: true,
    },
    {
      id: "AD # 002",
      advertisement: null,
      dimensions: "300*250",
      hasImage: false,
    },
    {
      id: "AD # 003",
      advertisement: null,
      dimensions: "522*100",
      hasImage: false,
    },
    {
      id: "AD # 004",
      advertisement: "/placeholder.svg",
      dimensions: "522*100",
      hasImage: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-red-600 text-center mb-2">ADMIN DASHBOARD</h1>
        <div className="w-full h-px bg-red-600 mb-6"></div>
        <h2 className="text-lg font-semibold text-red-600 mb-6">HILAL PUBLICATIONS</h2>
      </div>

      {/* All Ads Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-black mb-6">All Ads</h3>

        {/* Table */}
        <div className="border border-gray-300">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-300">
            <div className="p-4 text-sm font-medium text-gray-600">Ad #</div>
            <div className="p-4 text-sm font-medium text-gray-600">Advertisement</div>
            <div className="p-4 text-sm font-medium text-gray-600">Dimensions</div>
            <div className="p-4 text-sm font-medium text-gray-600">Action</div>
          </div>

          {/* Table Rows */}
          {adsData.map((ad, index) => (
            <div
              key={ad.id}
              className={`grid grid-cols-4 border-b border-gray-300 ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
            >
              <div className="p-4 text-sm font-medium text-black">{ad.id}</div>
              <div className="p-4 flex items-center">
                {ad.hasImage ? (
                  <img
                    src={ad.advertisement || "/placeholder.svg"}
                    alt="Advertisement"
                    width={100}
                    height={60}
                    className="object-cover border border-gray-200"
                  />
                ) : (
                  <span className="text-sm text-gray-500">--</span>
                )}
              </div>
              <div className="p-4 text-sm text-black">{ad.dimensions}</div>
              <div className="p-4 flex gap-2">
                <button className="text-xs px-3 py-1 border border-gray-300 text-black hover:bg-gray-50 rounded">
                  Upload
                </button>
                {ad.hasImage && (
                  <button className="text-xs px-3 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Articles Button */}
      <div className="flex justify-center">
        <button className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded">
          Manage Articles
        </button>
      </div>
    </div>
  );
}
