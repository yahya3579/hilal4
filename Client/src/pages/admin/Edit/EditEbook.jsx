import { Upload, ChevronDown } from "lucide-react"
import UploadIcon from "../../../assets/UploadIcon.jpg"
import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { uploadEbookCover, uploadEbookDocument, getEbookCoverUrl, getEbookDocumentUrl } from "../../../utils/localUpload";
import useAuthStore from "../../../utils/store";
import Loader from "../../../components/Loader/loader";
import { useToast } from "../../../context/ToastContext";
const fetchEbookById = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ebook/${id}/`);
    console.log("Fetched ebook data:", res.data);
    return res.data;
};

const saveEbook = async ({ id, data }) => {
    if (id) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/ebook/update/${id}/`, data);
        console.log("Ebook updated successfully:", res.data);
        return res.data;
    } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ebook/create/`, data);
        console.log("Ebook created successfully:", res.data);
        return res.data;
    }
};

export default function EditEbook() {
    const { ebookId } = useParams();
    const userId = useAuthStore((state) => state.userId)
    const fileInputRef = useRef(null);
    const fileInputRefPDF = useRef(null);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        title: "",
        publish_date: "",
        language: "",
        direction: "",
        status: "Active",
        cover_image: null,
        doc_url: null, // Added doc_url field
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedPDF, setSelectedPDF] = useState(null); // State for PDF file
    const [isDragActive, setIsDragActive] = useState(false);




    const { data: ebookData, isLoading } = useQuery({
        queryKey: ["ebook", ebookId],
        queryFn: () => fetchEbookById(ebookId),
        enabled: !!ebookId,
        onSuccess: (data) => {
            setFormData({
                title: data.title || "",
                publish_date: data.publish_date || "",
                language: data.language || "",
                direction: data.direction || "",
                status: data.status || "Active",
                cover_image: data.cover_image || null,
                doc_url: data.doc_url || null, // Populate doc_url
                description: data.description || "",
            });
        },
    });

    const mutation = useMutation({
        mutationFn: saveEbook,
        onSuccess: () => {
            showToast(ebookId ? "Ebook updated successfully!" : "Ebook created successfully!", "success");
            navigate("/admin/ebooks-management");
        },
        onError: (error) => {
            showToast(`Error ${ebookId ? "updating" : "creating"} ebook: ${error.response?.data || error.message}`, "error");
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };


    useEffect(() => {
        if (ebookId && ebookData) { // ✅ Only run when data exists
            setFormData({
                title: ebookData.title || "",
                publish_date: ebookData.publish_date ? ebookData.publish_date.split("T")[0] : "",
                language: ebookData.language || "",
                direction: ebookData.direction || "",
                status: ebookData.status || "Active",
                cover_image: ebookData.cover_image || null,
                doc_url: ebookData.doc_url || null, // Populate doc_url
                description: ebookData.description || "",
            });
        }
    }, [ebookId, ebookData]);

    const handleBrowseClick = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
        if (fileInputRefPDF.current) {
            fileInputRefPDF.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length === 1) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setSelectedPDF(file); // Set PDF file
                setFormData((prev) => ({ ...prev, doc_url: file })); // Update formData for PDF
                setErrors((prev) => ({ ...prev, doc_url: "" })); // Clear error for PDF
            } else if (file.type.startsWith("image/")) {
                setSelectedFile(file); // Set image file
                setFormData((prev) => ({ ...prev, cover_image: file })); // Update formData for image
                setErrors((prev) => ({ ...prev, cover_image: "" })); // Clear error for image
            } else {
                setErrors((prev) => ({ ...prev, doc_url: "Only PDF files are allowed for documents." }));
            }
        } else {
            setErrors((prev) => ({ ...prev, doc_url: "Only one file is allowed." }));
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
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required.";
        if (!formData.publish_date.trim()) {
            newErrors.publish_date = "Publish date is required.";
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.publish_date)) {
            newErrors.publish_date = "Publish date must be in yyyy-mm-dd format.";
        }
        if (!formData.language.trim()) newErrors.language = "Language is required.";
        if (!formData.direction.trim()) newErrors.direction = "Direction is required.";
        if (!formData.cover_image) newErrors.cover_image = "Cover image is required.";
        if (!formData.doc_url) newErrors.doc_url = "PDF document is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        let imageUrl = formData.cover_image;
        let pdfUrl = formData.doc_url;

        // Handle image upload if a new file is selected
        if (selectedFile) {
            try {
                imageUrl = await uploadEbookCover(selectedFile);
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

        // Handle PDF upload if a new file is selected
        if (selectedPDF) {
            try {
                pdfUrl = await uploadEbookDocument(selectedPDF);
                if (!pdfUrl) {
                    setErrors((prev) => ({ ...prev, doc_url: "PDF upload failed." }));
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                setErrors((prev) => ({ ...prev, doc_url: "Error uploading PDF." }));
                setIsSubmitting(false);
                return;
            }
        }

        const updatedData = {
            ...formData,
            cover_image: imageUrl,
            doc_url: pdfUrl, // Use the uploaded PDF URL
        };

        mutation.mutate({ id: ebookId, data: updatedData });
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

                {/* Edit Magazine Section */}
                <div className="bg-white">
                    <div className="border-t-[3px] border-[#DF1600] py-4">
                        <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">
                            Ebook Article
                        </h2>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Ebook Cover Upload */}
                        <div>
                            <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal text-left align-middle">
                                Ebook Cover
                            </label>
                            <div
                                className={`border-[1px] border-dashed border-[#DF1600] rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${isDragActive ? 'bg-red-50 border-red-400' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {/* <img src={UploadIcon} alt="Upload Icon" className="mx-auto h-12 w-14 sm:h-[59px] sm:w-[69px] color-primary mb-4" /> */}
                                {formData.cover_image && typeof formData.cover_image === "string" ? (
                                    <img
                                        src={getEbookCoverUrl(formData.cover_image)}
                                        alt="Ebook Cover"
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

                        {/* PDF Upload */}
                        <div>
                            <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal text-left align-middle">
                                Upload PDF
                            </label>
                            <div className="border-[1px] border-dashed border-[#DF1600] rounded-lg p-4 sm:p-6 md:p-8 text-center">
                                {formData.doc_url && typeof formData.doc_url === "string" ? (
                                    <a
                                        href={getEbookDocumentUrl(formData.doc_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-sm"
                                    >
                                        View Existing PDF
                                    </a>
                                ) : null}
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    ref={fileInputRefPDF}
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
                                {selectedPDF && (
                                    <p className="text-green-600 font-montserrat text-xs sm:text-[12px] mt-2">
                                        Selected: {selectedPDF.name}
                                    </p>
                                )}
                                <p className="font-montserrat font-normal text-xs sm:text-[12px] leading-[18px] tracking-normal text-center align-middle color-gray">
                                    Supported format: PDF
                                </p>
                            </div>
                            {errors.doc_url && <p className="text-red-600 text-xs mt-1">{errors.doc_url}</p>}
                        </div>

                        <div className="md:w-[90%] flex flex-col md:space-y-8 space-y-4">
                            {/* Form Fields Grid 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                                {/* Magazine Title */}
                                <div className="col-span-3">
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Ebook Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="What we have given to Pakistan"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                    />
                                    {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                                </div>

                                {/* Direction */}
                                <div className="col-span-1">
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Direction
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="direction"
                                            value={formData.direction}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                        >
                                            <option value="">Direction</option>
                                            <option value="LTR">LTR</option>
                                            <option value="RTL">RTL</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    {errors.direction && <p className="text-red-600 text-xs mt-1">{errors.direction}</p>}
                                </div>
                            </div>

                            {/* Form Fields Grid 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Language */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Language
                                    </label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                    >
                                        <option value="">Select Language</option>
                                        <option value="English">English</option>
                                        <option value="Urdu">Urdu</option>
                                    </select>
                                    {errors.language && <p className="text-red-600 text-xs mt-1">{errors.language}</p>}
                                </div>

                                {/* Publish Date */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="publish_date"
                                        value={formData.publish_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F]"
                                    />
                                    {errors.publish_date && <p className="text-red-600 text-xs mt-1">{errors.publish_date}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Enter ebook description..."
                                    className="w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] resize-y"
                                />
                            </div>


                        </div>

                        {/* Submit Button */}
                        <div className="text-center mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-primary text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
                            >
                                {isSubmitting ? (ebookId ? "Updating..." : "Creating...") : (ebookId ? "Update Ebook" : "Create Ebook")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


