import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

export default function AdminContentEditor({
    title = "Edit Content",
    onSubmit,
    initialData = {},
    imageConfig = {},
    fields = [],
}) {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleBrowseClick = (e) => {
        e.preventDefault();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <h1 className="text-center text-[32px] text-[#DF1600] uppercase font-poppins font-medium mb-6">
                {title}
            </h1>

            {/* Image Upload */}
            {imageConfig?.show && (
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold font-montserrat text-gray-600 text-center">
                        {imageConfig.label || "Upload Image"}
                    </label>
                    <div
                        className={`border border-dashed rounded-lg p-6 text-center transition ${isDragActive ? "bg-red-50 border-red-400" : "border-[#DF1600]"}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
                        onDrop={handleDrop}
                    >
                        <img
                            src={imageConfig.icon || "/default-icon.png"}
                            alt="Upload"
                            className="mx-auto mb-4 w-16 h-16"
                        />
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            ref={fileInputRef}
                            hidden
                            onChange={handleFileChange}
                        />
                        <p>
                            Drag & drop or{" "}
                            <button className="underline text-[#DF1600]" onClick={handleBrowseClick}>
                                Browse
                            </button>
                        </p>
                        {selectedFile && (
                            <p className="text-green-600 text-sm mt-2">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit({ ...initialData, file: selectedFile });
                }}
                className="space-y-6"
            >
                {fields.map((field, index) => {
                    const value = initialData[field.name] || "";
                    if (field.type === "textarea") {
                        return (
                            <div key={index}>
                                <label className="block mb-2 font-semibold font-montserrat text-sm">
                                    {field.label}
                                </label>
                                <textarea
                                    rows={field.rows || 4}
                                    placeholder={field.placeholder}
                                    className="w-full p-2 border rounded font-montserrat text-sm"
                                    defaultValue={value}
                                />
                            </div>
                        );
                    }

                    if (field.type === "select") {
                        return (
                            <div key={index} className="relative">
                                <label className="block mb-2 font-semibold font-montserrat text-sm">
                                    {field.label}
                                </label>
                                <select
                                    defaultValue={value}
                                    className="w-full px-3 py-2 border rounded appearance-none font-montserrat text-sm"
                                >
                                    <option value="">{field.placeholder || "Select option"}</option>
                                    {field.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-9 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        );
                    }

                    return (
                        <div key={index}>
                            <label className="block mb-2 font-semibold font-montserrat text-sm">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border rounded font-montserrat text-sm"
                                defaultValue={value}
                            />
                        </div>
                    );
                })}

                <div className="text-center mt-4">
                    <button
                        type="submit"
                        className="bg-[#DF1600] hover:bg-red-700 text-white px-6 py-2 rounded font-bold text-lg font-poppins"
                    >
                        {imageConfig?.buttonLabel || "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
}
