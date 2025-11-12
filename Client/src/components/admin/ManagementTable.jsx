import React from "react";
import { Link, Links } from "react-router-dom";

const ManagementTable = ({ title, columns, data = [], route, onAddNew }) => {
    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="relative mb-6">
                <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins text-[#DF1600] text-center mx-auto w-fit">
                    {title}
                </h1>

                {/* Filter section aligned to the right */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm text-[#1E1E1E] font-medium leading-[100%] tracking-[-0.01em] font-poppins">
                        Content filter
                    </span>
                    <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                        <option value="">Select filter</option>
                    </select>
                </div>
            </div>


            {/* Table */}
            <div className="overflow-x-auto">
                {/* <div className="border-t-[3px] border-[#DF1600] py-4">
                    <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">EDIT Author</h2>
                </div> */}
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins">No</th>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="text-left py-3 px-4 text-[#DF1600] font-medium text-[15px] capitalize font-poppins"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b-[0.5px] border-[#292D32] hover:bg-gray-50"
                            >
                                <td className="py-4 px-4 text-gray-700">{index + 1}</td>
                                {columns.map((col, idx) => (
                                    <td key={idx} className="py-4 px-4 text-gray-700">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* New Item Button */}
            {(title != "Comment management" && title != "Subscription Package  management") && <div className="flex justify-center mt-8">

                <Link to={route}>
                    <button
                        onClick={onAddNew}
                        className="bg-[#DF0404] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors font-bold text-[16.1px] leading-[100%] tracking-[-0.01em] font-poppins"
                    >
                        New {title?.split(" ")[0] ?? "Item"}
                    </button></Link>
            </div>}
        </div>
    );
};

export default ManagementTable;
