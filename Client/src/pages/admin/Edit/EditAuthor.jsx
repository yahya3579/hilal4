import { ChevronDown } from "lucide-react";
import UploadIcon from "../../../assets/UploadIcon.jpg";
import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import useAuthStore from "../../../utils/store";
import { uploadAuthorImage, getFileUrl } from "../../../utils/localUpload";
import Loader from "../../../components/Loader/loader";
import { useToast } from "../../../context/ToastContext";

const fetchAuthorById = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/author/${id}/`);
    console.log("Fetched author data:", res.data);
    return res.data;
};


export default function EditAuthor() {

    const { authorId } = useParams(); // Get articleId from URL
    const { showToast } = useToast(); // For toast notifications
    const userId = useAuthStore((state) => state.userId)
    const { data: authorData, isLoading: isFetching, error: fetchError } = useQuery({
        queryKey: ["author", authorId],
        queryFn: () => fetchAuthorById(authorId),
        enabled: !!authorId, // Only fetch if authorId exists
    });

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [formData, setFormData] = useState({
        author_image: "",
        author_name: "",
        email: "",
        contact_no: "",
        category: "",
        introduction: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});




    useEffect(() => {
        if (authorData) {
            setFormData({
                author_image: authorData.author_image || "",
                author_name: authorData.author_name || "",
                email: authorData.email || "",
                contact_no: authorData.contact_no || "",
                category: authorData.category || "",
                introduction: authorData.introduction || "",
            });
        }
    }, [authorData]);



    const handleBrowseClick = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for the field
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length === 1) {
            setSelectedFile(e.target.files[0]);
            setFormData((prev) => ({ ...prev, author_image: e.target.files[0] }));
            setErrors((prev) => ({ ...prev, author_image: "" })); // Clear error for the file
        } else {
            setErrors((prev) => ({ ...prev, author_image: "Only one image is allowed." }));
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
        if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
            setSelectedFile(e.dataTransfer.files[0]);
            setFormData((prev) => ({ ...prev, author_image: e.dataTransfer.files[0] }));
            setErrors((prev) => ({ ...prev, author_image: "" })); // Clear error for the file
        } else {
            setErrors((prev) => ({ ...prev, author_image: "Only one image is allowed." }));
        }
    };
    const uploadAuthor = async (formData) => {
        let imageUrl = null;

        if (formData.author_image) {
            console.log("Uploading author image:", formData.author_image);

            imageUrl = await uploadAuthorImage(formData.author_image, authorId || 'new');
            console.log("Uploaded author image URL:", imageUrl);
            if (!imageUrl) {
                throw new Error("Image upload failed");
            }
        }

        const data = new FormData();
        data.append("user", userId);
        data.append("author_image", imageUrl || authorData?.author_image); // Use existing image if not updated
        data.append("author_name", formData.author_name);
        data.append("email", formData.email);
        data.append("contact_no", formData.contact_no);
        data.append("category", formData.category);
        data.append("introduction", formData.introduction);

        if (authorData) {
            console.log("Updating author:", authorData);
            // Update existing author
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/author/${authorData.id}/`, data);
            console.log("Author updated successfully:", response.data);
            return response.data;
        } else {
            // Create new author
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/author/create/`, data);
            console.log("Author created successfully:", response.data);
            return response.data;
        }
    };
    const mutation = useMutation({ mutationFn: uploadAuthor });






    const validateForm = () => {
        const newErrors = {};
        if (!formData.author_image) newErrors.author_image = "Author image is required.";
        if (!formData.author_name.trim()) newErrors.author_name = "Author name is required.";
        if (!formData.email.trim()) newErrors.email = "Email is required.";
        if (!formData.contact_no.trim()) newErrors.contact_no = "Contact number is required.";
        if (!formData.category.trim()) newErrors.category = "Category is required.";
        if (!formData.introduction.trim()) newErrors.introduction = "Introduction is required.";
        if (!formData.author_image) newErrors.author_image = "Author image is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        mutation.mutate(formData, {
            onSuccess: () => {
                showToast(
                    authorId ? "Author updated successfully!" : "Author uploaded successfully!", 
                    "success"
                );
                setFormData({
                    author_image: "",
                    author_name: "",
                    email: "",
                    contact_no: "",
                    category: "",
                    introduction: "",
                });
                setSelectedFile(null);
                setErrors({});
                setIsSubmitting(false);
            },
            onError: (error) => {
                showToast(
                    `Error ${authorId ? "updating" : "uploading"} author: ${error.response?.data || error.message}`, 
                    "error"
                );
                setIsSubmitting(false);
            },
        });
    };

    if (isFetching) return <Loader />;
    if (fetchError) return <p className="p-4 text-red-500">Error fetching author</p>;

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="">
                {/* Header */}


                <div className=" mb-6">
                    <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins color-primary text-center mx-auto w-fit">
                        Admin Dashboard
                    </h1>
                </div>


                {/* Edit Article Section */}
                <div className="bg-white">
                    <div className="border-t-[3px] border-[#DF1600] py-4">
                        <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">EDIT Author</h2>
                    </div>

                    <div className=" space-y-6 mt-6">
                        {/* Article Cover Upload */}
                        <div>
                            <label className="block  color-gray mb-2 font-montserrat  font-semibold text-[14px] leading-[100%] tracking-normal text-left align-middle">Author Image</label>
                            <div
                                className={`border-[1px] border-dashed border-[#DF1600] rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${isDragActive ? 'bg-red-50 border-red-400' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {formData.author_image && typeof formData.author_image === "string" ? (
                                    <img
                                        src={getFileUrl(formData.author_image, 'authors')}
                                        alt="Author Image"
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
                                    <span className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle">Drag & drop files or </span>
                                    <button onClick={handleBrowseClick} className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle color-primary underline">Browse</button>
                                </p>
                                {selectedFile && (
                                    <p className="text-green-600 font-montserrat text-xs sm:text-[12px] mt-2">Selected: {selectedFile.name}</p>
                                )}
                                <p className="font-montserrat font-normal text-xs sm:text-[12px] leading-[18px] tracking-normal text-center align-middle color-gray">Supported formats: PNG, JPG</p>
                            </div>
                        </div>

                        <div className="md:w-[90%] flex flex-col md:space-y-8 space-y-4">

                            {/* Form Fields Grid 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                                {/* Article Title */}
                                <div className="col-span-3">
                                    <label className="block  color-gray mb-2 font-montserrat  font-semibold text-[14px] leading-[100%] tracking-normal  align-middle">Author Name</label>
                                    <input
                                        type="text"
                                        name="author_name"
                                        value={formData.author_name}
                                        onChange={handleInputChange}
                                        placeholder="What we have given to Pakistan"
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle "
                                    />
                                    {errors.author_name && <p className="text-red-500 text-xs mt-1">{errors.author_name}</p>}
                                </div>

                                {/* Category */}
                                <div className="col-span-1">
                                    <label className="block  color-gray mb-2 font-montserrat  font-semibold text-[14px] leading-[100%] tracking-normal  align-middle">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                        >
                                            <option className="" value="">Select category</option>
                                            <option className="" value="Politics">Politics</option>
                                            <option className="" value="Sports">Sports</option>
                                            <option className="" value="Technology">Technology</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                </div>

                            </div>

                            {/* Form Fields Grid 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                                {/* Writer */}
                                <div>
                                    <label className="block  color-gray mb-2 font-montserrat  font-semibold text-[14px] leading-[100%] tracking-normal  align-middle">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                        className="w-full px-3 py-2 border color-border rounded-md  font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle placeholder:text-[#DF1600]"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block  color-gray mb-2 font-montserrat  font-semibold text-[14px] leading-[100%] tracking-normal  align-middle">Contact No.</label>
                                    <input
                                        type="tel"
                                        name="contact_no"
                                        value={formData.contact_no}
                                        onChange={handleInputChange}
                                        placeholder="xx-xxx-xxxxxx"
                                        className="w-full px-3 py-2 border color-border rounded-md  font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle placeholder:text-[#DF1600]"
                                    />
                                    {errors.contact_no && <p className="text-red-500 text-xs mt-1">{errors.contact_no}</p>}
                                </div>
                            </div>

                            {/* Article Content */}
                            <div>
                                <label className="block color-gray mb-2 font-montserrat font-semibold text-sm sm:text-[14px] leading-[100%] tracking-normal align-middle">Author Introduction</label>
                                <textarea
                                    name="introduction"
                                    value={formData.introduction}
                                    onChange={handleInputChange}
                                    rows={6}
                                    placeholder="Write Introduction here"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 color-border resize-vertical font-montserrat font-normal text-xs sm:text-[12px] leading-[18px] tracking-normal align-middle"
                                />
                                {errors.introduction && <p className="text-red-500 text-xs mt-1">{errors.introduction}</p>}
                            </div>

                        </div>

                        {/* Upload Button */}
                        <div className="text-center mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-primary text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
                            >
                                {isSubmitting ? (authorId ? "Updating..." : "Creating...") : (authorId ? "Update Author" : "Create Author")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


