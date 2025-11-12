import { Upload } from "lucide-react"
import UploadIcon from "../../../assets/UploadIcon.jpg"
import { useRef, useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { uploadPublicationImage, getFileUrl } from "../../../utils/localUpload";
import useAuthStore from "../../../utils/store";
import Loader from "../../../components/Loader/loader";
import { useToast } from "../../../context/ToastContext";
const fetchPublicationById = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/publication/${id}/`);
    console.log("Fetched publication data:", res.data);
    return res.data;
};

const savePublication = async ({ id, data }) => {
    if (id) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/publication/${id}/`, data);
        console.log("Publication updated successfully:", res.data);
        return res.data;
    } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/publication/create/`, data);
        return res.data;
    }
};

export default function EditPublication() {
    const { publicationId } = useParams();
    const userId = useAuthStore((state) => state.userId)
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        display_name: "",
        description: "",
        status: "Active",
        cover_image: null,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const { data: publicationData, isLoading } = useQuery({
        queryKey: ["publication", publicationId],
        queryFn: () => fetchPublicationById(publicationId),
        enabled: !!publicationId,
    });

    const mutation = useMutation({
        mutationFn: savePublication,
        onSuccess: () => {
            showToast(publicationId ? "Publication updated successfully!" : "Publication created successfully!", "success");
            navigate("/admin/publications-management");
        },
        onError: (error) => {
            showToast(`Error ${publicationId ? "updating" : "creating"} publication: ${error.response?.data || error.message}`, "error");
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    useEffect(() => {
        if (publicationId && publicationData) {
            setFormData({
                name: publicationData.name || "",
                display_name: publicationData.display_name || "",
                description: publicationData.description || "",
                status: publicationData.status || "Active",
                cover_image: publicationData.cover_image || null,
            });
        }
    }, [publicationId, publicationData]);

    const handleBrowseClick = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setFormData((prev) => ({ ...prev, cover_image: e.target.files[0] }));
            setErrors((prev) => ({ ...prev, cover_image: "" }));
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
            setFormData((prev) => ({ ...prev, cover_image: e.dataTransfer.files[0] }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.display_name.trim()) newErrors.display_name = "Display name is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if there are any changes from the original publication data
    const hasChanges = () => {
        if (!publicationData) return true; // If no original data, consider it a change
        
        const original = publicationData;
        const current = formData;
        
        return (
            original.name !== current.name ||
            original.display_name !== current.display_name ||
            original.description !== current.description ||
            original.status !== current.status ||
            selectedFile !== null
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Check if there are any changes before proceeding
        if (publicationId && !hasChanges()) {
            showToast("No changes detected. Publication not updated.", "info");
            return;
        }

        setIsSubmitting(true);

        let imageUrl = formData.cover_image;

        // Handle image upload if a new file is selected
        if (selectedFile) {
            try {
                imageUrl = await uploadPublicationImage(selectedFile, publicationId || 'new');
                if (!imageUrl) {
                    setErrors((prev) => ({ ...prev, cover_image: "Image upload failed." }));
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                setErrors((prev) => ({ ...prev, cover_image: "Error uploading image." }));
                setIsSubmitting(false);
                return;
            }
        }

        const updatedData = {
            ...formData,
            cover_image: imageUrl,
        };

        mutation.mutate({ id: publicationId, data: updatedData });
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

                {/* Edit Publication Section */}
                <div className="bg-white">
                    <div className="border-t-[3px] border-[#DF1600] py-4">
                        <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">
                            {publicationId ? 'Edit Publication' : 'Create Publication'}
                        </h2>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Publication Cover Upload */}
                        <div>
                            <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal text-left align-middle">
                                Publication Cover
                            </label>
                            <div
                                className={`border-[1px] border-dashed border-[#DF1600] rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${isDragActive ? 'bg-red-50 border-red-400' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {formData.cover_image && typeof formData.cover_image === "string" ? (
                                    <img
                                        src={getFileUrl(formData.cover_image, 'publications')}
                                        alt="Publication Cover"
                                        className="mx-auto h-12 w-14 sm:h-[59px] sm:w-[69px] mb-4 object-cover"
                                    />
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
                                    <span className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle">
                                        Drag & drop files or
                                    </span>
                                    <button
                                        onClick={handleBrowseClick}
                                        className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle color-primary underline"
                                    >
                                        Browse
                                    </button>
                                </p>
                                {selectedFile && (
                                    <p className="text-green-600 font-montserrat text-xs sm:text-[12px] mt-2">
                                        Selected: {selectedFile.name}
                                    </p>
                                )}
                                <p className="font-montserrat font-normal text-xs sm:text-[12px] leading-[18px] tracking-normal text-center align-middle color-gray">
                                    Supported formats: PNG, JPG
                                </p>
                            </div>
                            {errors.cover_image && <p className="text-red-600 text-xs mt-1">{errors.cover_image}</p>}
                        </div>

                        <div className="md:w-[90%] flex flex-col md:space-y-8 space-y-4">
                            {/* Form Fields Grid 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Publication Name */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Publication Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="hilal-english"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                    />
                                    {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Hilal English"
                                        name="display_name"
                                        value={formData.display_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                    />
                                    {errors.display_name && <p className="text-red-600 text-xs mt-1">{errors.display_name}</p>}
                                </div>
                            </div>

                            {/* Form Fields Grid 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6">
                                {/* Description */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Description of the publication"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                    />
                                    {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
                                </div>
                            </div>

                            {/* Form Fields Grid 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6">
                                {/* Status */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-4">
                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={() => navigate('/admin/publications-management')}
                                className="bg-gray-500 text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] hover:bg-gray-600"
                            >
                                Back to Publications
                            </button>
                            
                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-primary text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
                            >
                                {isSubmitting ? (publicationId ? "Updating..." : "Creating...") : (publicationId ? "Update Publication" : "Create Publication")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
