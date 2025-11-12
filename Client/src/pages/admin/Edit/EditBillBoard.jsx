import { Upload, ChevronDown } from "lucide-react";
import UploadIcon from "../../../assets/UploadIcon.jpg";
import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { handleFileUpload, getBillboardImageUrl } from "../../../utils/fileManager";
import useAuthStore from "../../../utils/store";
import Loader from "../../../components/Loader/loader";
import { useToast } from "../../../context/ToastContext";
const fetchBillboardById = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billboard/${id}/`);
    return res.data;
};

const saveBillboard = async ({ id, data }) => {
    console.log("saveBillboard called with:", { id, data });
    try {
        if (id) {
            console.log("Updating billboard with ID:", id);
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/billboard/${id}/`, data);
            console.log("Update response:", res.data);
            return res.data;
        } else {
            console.log("Creating new billboard");
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/create-billboard/`, data);
            console.log("Create response:", res.data);
            return res.data;
        }
    } catch (error) {
        console.error("API error:", error.response?.data || error.message);
        throw error;
    }
};

const locationOptions = [
    { value: "1", label: "Armed Forces Section" },
    { value: "2", label: "Advertisement 1" },
    { value: "3", label: "Advertisement 2" },
    { value: "4", label: "Trending Publication Section" },
    { value: "5", label: "Reader's Opinion 1" },
    { value: "6", label: "Reader's Opinion 2" },
];

export default function EditBillBoard() {
    const { showToast } = useToast();
    const userId = useAuthStore((state) => state.userId)
    console.log("User ID:", userId);
    const { billboardId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        status: "Active",
        category: "",
        date: "",
        image: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { data: billboardData, isLoading } = useQuery({
        queryKey: ["billboard", billboardId],
        queryFn: () => fetchBillboardById(billboardId),
        enabled: !!billboardId,
        onSuccess: (data) => {
            setFormData({
                title: data.title || "",
                location: data.location || "",
                status: data.status || "Active",
                category: data.issue_news || "",
                date: data.created ? data.created.split("T")[0] : "",
                image: data.image || null,
            });
        },
    });

    const mutation = useMutation({
        mutationFn: saveBillboard,
        onSuccess: () => {
            setIsSubmitting(false);
            showToast(billboardId ? "Billboard updated successfully!" : "Billboard created successfully!", "success");
            navigate("/admin/bill-boards-management");
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            setIsSubmitting(false);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "An unexpected error occurred.";
            showToast(`Error ${billboardId ? "updating" : "creating"} billboard: ${errorMessage}`, "error");
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    useEffect(() => {
        if (billboardData) {
            setFormData({
                title: billboardData.title || "",
                location: billboardData.location || "",
                status: billboardData.status || "Active",
                category: billboardData.issue_news || "",
                date: billboardData.created ? billboardData.created.split("T")[0] : "",
                image: billboardData.image || null,
            });
        }
    }, [billboardData]);



    const handleBrowseClick = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
            setErrors((prev) => ({ ...prev, image: "" }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
            setFormData((prev) => ({ ...prev, image: e.dataTransfer.files[0] }));
            setErrors((prev) => ({ ...prev, image: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required.";
        if (!formData.location.trim()) newErrors.location = "Location is required.";
        if (!formData.date.trim()) newErrors.date = "Date is required.";
        if (!userId) newErrors.user = "User authentication is required.";
        if (!formData.image && !billboardData?.image) newErrors.image = "Image is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        console.log("Form data:", formData);
        console.log("User ID:", userId);
        
        if (!validateForm()) {
            console.log("Form validation failed:", errors);
            return;
        }

        setIsSubmitting(true);
        let imageFilename = billboardData?.image;

        if (formData.image && typeof formData.image !== "string") {
            try {
                console.log("Uploading image to local media...");
                const entityId = billboardId || 'new';
                imageFilename = await handleFileUpload(formData.image, 'billboards', entityId);
                if (!imageFilename) {
                    showToast("Image upload failed", "info");
                    setIsSubmitting(false);
                    return;
                }
                console.log("Image uploaded successfully:", imageFilename);
            } catch (error) {
                console.error("Image upload error:", error);
                showToast("Error uploading image: " + error.message, "error");
                setIsSubmitting(false);
                return;
            }
        }

        const updatedData = {
            user: userId, // Add userId to the data
            title: formData.title,
            location: formData.location,
            status: formData.status,
            issue_news: "Yes",
            created: formData.date,
            image: imageFilename,
        };

        console.log("Submitting data:", updatedData);
        console.log("Billboard ID:", billboardId);
        
        mutation.mutate({ id: billboardId, data: updatedData });
    };

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins color-primary text-center mx-auto w-fit">
                        Admin Dashboard
                    </h1>
                </div>

                {/* Edit Billboard Section */}
                <div className="bg-white">
                    <div className="border-t-[3px] border-[#DF1600] py-4">
                        <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">
                            {billboardId ? "Edit Billboard" : "Create Billboard"}
                        </h2>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Billboard Image Upload */}
                        <div>
                            <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal text-left align-middle">Billboard Image</label>
                            <div
                                className={`border-[1px] border-dashed border-[#DF1600] rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${isDragActive ? 'bg-red-50 border-red-400' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {formData.image && typeof formData.image === "string" ? (
                                    <img src={getBillboardImageUrl(formData.image)} alt="Billboard" className="mx-auto h-12 w-14 sm:h-[59px] sm:w-[69px] mb-4" />
                                ) : (
                                    <img src={UploadIcon} alt="Upload Icon" className="mx-auto h-12 w-14 sm:h-[59px] sm:w-[69px] mb-4" />
                                )}
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <p className="text-gray-600 mb-2">
                                    <span className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle">Drag & drop files or </span>
                                    <button onClick={handleBrowseClick} className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle color-primary underline">Browse</button>
                                </p>
                                {selectedFile && (
                                    <p className="text-green-600 font-montserrat text-xs sm:text-[12px] mt-2">Selected: {selectedFile.name}</p>
                                )}
                                <p className="font-montserrat font-normal text-xs sm:text-[12px] leading-[18px] tracking-normal text-center align-middle color-gray">Supported formats: PNG, JPG</p>
                            </div>
                            {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                            {errors.user && <p className="text-red-600 text-xs mt-1">{errors.user}</p>}
                        </div>

                        {/* Form Fields */}
                        <div className="md:w-[90%] flex flex-col md:space-y-8 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                                {/* Billboard Title */}
                                <div className="col-span-3">
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">Billboard Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter Billboard Title"
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                    />
                                    {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                                </div>

                                {/* Location Dropdown */}
                                <div className="col-span-1">
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">Location</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                    >
                                        <option value="">Select location</option>
                                        {locationOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                />
                                {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
                            </div>

                            {/* Status Dropdown */}
                            <div>
                                <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border color-border rounded-md bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Disabled">Disabled</option>
                                </select>
                            </div>

                            {/* Category Dropdown */}
                            {/* <div>
                                <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border color-border rounded-md bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                >
                                    <option value="">Select category</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
                            </div> */}
                        </div>

                        {/* Submit Button */}
                        <div className="text-center mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-primary text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
                            >
                                {isSubmitting ? (billboardId ? "Updating..." : "Creating...") : (billboardId ? "Update Billboard" : "Create Billboard")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


