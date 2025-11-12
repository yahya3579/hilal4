import { Upload, ChevronDown } from "lucide-react"
import UploadIcon from "../../../assets/UploadIcon.jpg"
import { useRef, useState, useEffect, useCallback } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"; // Import React Query
import axios from "axios"; // Import Axios for API calls
import { uploadArticleImage, getFileUrl } from "../../../utils/localUpload";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import useAuthStore from "../../../utils/store";
import Loader from "../../../components/Loader/loader";
import { useTranslation } from 'react-i18next';
import i18n from '../../../utils/i18n';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../../assets/css/quill-editor.css';
import { fetchCategories } from "../../../utils/fetchCategories";
import { fetchPublications } from "../../../utils/fetchPublications";
import { useToast } from "../../../context/ToastContext";

const fetchArticleById = async (id) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/article/${id}/`);
        return res.data;
    } catch (error) {
        console.error("Error fetching article:", error);
        throw error;
    }
};

const fetchAuthors = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/authors/`);
        return res.data.data || [];
    } catch (error) {
        console.error("Error fetching authors:", error);
        return [];
    }
};

const fetchMagazines = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/magazines/`);
        return res.data.data || [];
    } catch (error) {
        console.error("Error fetching magazines:", error);
        return [];
    }
};

export default function EditArticle() {
    const { t } = useTranslation();
    const { articleId } = useParams(); // Get articleId from URL
    const navigate = useNavigate(); // For navigation
    const { showToast } = useToast(); // For toast notifications
    const { isRTL, setLanguage } = useAuthStore();
    
    // Get dynamic data from store
    const categories = useAuthStore((state) => state.categories);
    const publications = useAuthStore((state) => state.publications);
    const loadingCategories = useAuthStore((state) => state.loadingCategories);
    const loadingPublications = useAuthStore((state) => state.loadingPublications);
    
    const { data: articleData, isLoading: isFetching, error: fetchError } = useQuery({
        queryKey: ["article", articleId],
        queryFn: () => fetchArticleById(articleId),
        enabled: !!articleId, // Only fetch if articleId exists
    });
    const { data: authors, isLoading: isAuthorsLoading, error: authorsError } = useQuery({
        queryKey: ["authors"],
        queryFn: fetchAuthors,
    });

    const { data: magazines, isLoading: isMagazinesLoading, error: magazinesError } = useQuery({
        queryKey: ["magazines"],
        queryFn: fetchMagazines,
    });

    // Fetch dynamic data on component mount
    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
        if (publications.length === 0) {
            fetchPublications();
        }
    }, [categories.length, publications.length]);

    // Quill Editor Configuration - MS Word-like toolbar
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': ['Arial', 'Times New Roman', 'Calibri', 'Georgia', 'Verdana', 'Montserrat'] }],
            [{ 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': ['', 'center', 'right', 'justify'] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean'],
            ['undo', 'redo']
        ],
        clipboard: {
            matchVisual: false,
        },
        history: {
            delay: 1000,
            maxStack: 500,
            userOnly: true
        }
    };

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'script',
        'list', 'bullet', 'check', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        writer: "",
        description: "",
        category: "",
        publication: "",
        magazine: "",
        publish_date: "",
        publish_date_year: "",
        publish_date_month: "",
        cover_image: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Function to extract year and month from publish_date
    const extractDateFields = (dateString) => {
        if (!dateString) return { year: "", month: "" };
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return { year: "", month: "" };
            
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            
            return { year, month };
        } catch (error) {
            console.error("Error extracting date fields:", error);
            return { year: "", month: "" };
        }
    };

    useEffect(() => {
        if (articleData) {
            const publishDate = articleData.article.publish_date ? articleData.article.publish_date.split("T")[0] : "";
            const { year, month } = extractDateFields(publishDate);
            
            setFormData({
                title: articleData.article.title || "",
                author: articleData.article.author || "",
                description: articleData.article.description || "",
                category: articleData.article.category || "",
                publication: articleData.article.publication || "",
                magazine: articleData.article.magazine || "",
                publish_date: publishDate,
                publish_date_year: year,
                publish_date_month: month,
                cover_image: articleData.article.cover_image || null, // Populate existing image
            });
        }
    }, [articleData]);

    // Handle RTL for Urdu categories dynamically
    useEffect(() => {
        if (formData.category && categories.length > 0) {
            const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category));
            if (selectedCategory) {
                const isUrduCategory = selectedCategory.name.toLowerCase().includes('urdu');
                if (isUrduCategory) {
                    setLanguage('ur');
                    i18n.changeLanguage('ur');
                } else {
                    setLanguage('en');
                    i18n.changeLanguage('en');
                }
            }
        }
    }, [formData.category, categories, setLanguage]);

    // Filter categories based on selected publication
    const getFilteredCategories = useCallback(() => {
        if (!formData.publication) {
            return categories; // Show all categories if no publication selected
        }
        return categories.filter(category => category.publication === parseInt(formData.publication));
    }, [formData.publication, categories]);

    // Filter magazines based on selected publication
    const getFilteredMagazines = useCallback(() => {
        if (!formData.publication) {
            return magazines || []; // Show all magazines if no publication selected
        }
        return (magazines || []).filter(magazine => magazine.publication === parseInt(formData.publication));
    }, [formData.publication, magazines]);

    // Validate category when publication changes (for existing articles)
    useEffect(() => {
        if (formData.publication && formData.category && categories.length > 0) {
            const filteredCategories = getFilteredCategories();
            const currentCategoryExists = filteredCategories.some(cat => cat.id === parseInt(formData.category));
            
            if (!currentCategoryExists) {
                // Clear category if it doesn't belong to the selected publication
                setFormData(prev => ({ ...prev, category: "" }));
            }
        }
    }, [formData.publication, formData.category, categories, getFilteredCategories]);

    const handleBrowseClick = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // If publish_date is being changed, extract year and month
        if (name === 'publish_date') {
            const { year, month } = extractDateFields(value);
            setFormData((prev) => ({ 
                ...prev, 
                [name]: value,
                publish_date_year: year,
                publish_date_month: month
            }));
        } else if (name === 'publication') {
            // When publication changes, clear category and magazine to avoid invalid selections
            setFormData((prev) => ({ 
                ...prev, 
                [name]: value,
                category: "", // Clear category
                magazine: ""  // Clear magazine
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        
        setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for the field

        // Check if category is selected and if it's Urdu-related dynamically
        if (name === 'category' && categories.length > 0) {
            const selectedCategory = categories.find(cat => cat.id === parseInt(value));
            if (selectedCategory) {
                const isUrduCategory = selectedCategory.name.toLowerCase().includes('urdu');
                if (isUrduCategory) {
                    setLanguage('ur');
                    i18n.changeLanguage('ur');
                } else {
                    setLanguage('en');
                    i18n.changeLanguage('en');
                }
            }
        }
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, description: content }));
        setErrors(prev => ({ ...prev, description: "" }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length === 1) {
            setSelectedFile(e.target.files[0]);
            setFormData((prev) => ({ ...prev, cover_image: e.target.files[0] }));
            setErrors((prev) => ({ ...prev, cover_image: "" })); // Clear error for the file
        } else {
            setErrors((prev) => ({ ...prev, cover_image: "Only one image is allowed." }));
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
            setFormData((prev) => ({ ...prev, cover_image: e.dataTransfer.files[0] }));
            setErrors((prev) => ({ ...prev, cover_image: "" })); // Clear error for the file
        } else {
            setErrors((prev) => ({ ...prev, cover_image: "Only one image is allowed." }));
        }
    };

    // Helper function to safely convert values to strings and check if they're not empty
    const isNotEmpty = (value) => {
        if (value === null || value === undefined) return false;
        const stringValue = String(value).trim();
        return stringValue !== "" && stringValue !== "0";
    };

    // Check if there are any changes from the original article data
    const hasChanges = () => {
        if (!articleData?.article) return true; // If no original data, consider it a change
        
        const original = articleData.article;
        const current = formData;
        
        return (
            original.title !== current.title ||
            String(original.author) !== String(current.author) ||
            original.description !== current.description ||
            String(original.category) !== String(current.category) ||
            String(original.publication) !== String(current.publication) ||
            String(original.magazine || '') !== String(current.magazine || '') ||
            original.publish_date?.split('T')[0] !== current.publish_date ||
            (current.cover_image && typeof current.cover_image !== 'string')
        );
    };

    const uploadArticle = async (formData) => {
        // Check if there are any changes before proceeding
        if (articleId && !hasChanges()) {
            showToast("No changes detected. Article not updated.", "info");
            return { message: "No changes detected" };
        }

        let imageUrl = null;

        if (formData.cover_image && typeof formData.cover_image !== 'string') {
            console.log("Uploading cover image:", formData.cover_image);
            imageUrl = await uploadArticleImage(formData.cover_image, articleId || 'new');
            console.log("Uploaded cover image URL:", imageUrl);

            if (!imageUrl) {
                throw new Error("Image upload failed");
            }
        }

        // Clean HTML content if it's empty or just contains <p><br></p>
        let cleanDescription = formData.description;
        if (cleanDescription === '<p><br></p>' || cleanDescription === '<p></p>' || cleanDescription === '') {
            cleanDescription = '';
        }

        const data = new FormData();
        data.append("cover_image", imageUrl || articleData?.article?.cover_image); // Use existing image if not updated
        data.append("title", formData.title);
        data.append("author", formData.author);
        data.append("description", cleanDescription);
        
        // Convert values to integers for foreign key fields - handle both string and number types
        if (isNotEmpty(formData.category)) {
            const categoryId = parseInt(String(formData.category));
            if (!isNaN(categoryId)) {
                data.append("category", categoryId);
            }
        }
        if (isNotEmpty(formData.publication)) {
            const publicationId = parseInt(String(formData.publication));
            if (!isNaN(publicationId)) {
                data.append("publication", publicationId);
            }
        }
        if (isNotEmpty(formData.magazine)) {
            const magazineId = parseInt(String(formData.magazine));
            if (!isNaN(magazineId)) {
                data.append("magazine", magazineId);
            }
        }
        
        const isoDate = new Date(formData.publish_date).toISOString();
        data.append("publish_date", isoDate);
        data.append("publish_date_year", formData.publish_date_year);
        data.append("publish_date_month", formData.publish_date_month);
        data.append("visits", articleData?.article?.visits || 0);
        data.append("issue_new", articleData?.article?.issue_new || "Yes");
        data.append("status", articleData?.article?.status || "Active");

        if (articleId) {
            // Update existing article
            console.log("Updating article with ID:", articleId);
            console.log("Form data being sent:", Object.fromEntries(data.entries()));
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/article/${articleId}/`, data);
            console.log("Article updated successfully:", response.data);
            return response.data;
        } else {
            // Create new article
            console.log("Creating new article");
            console.log("Form data being sent:", Object.fromEntries(data.entries()));
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/create-article/`, data);
            return response.data;
        }
    };

    const mutation = useMutation({ mutationFn: uploadArticle });

    const validateForm = () => {
        const newErrors = {};
        
        // Validate title
        if (!String(formData.title).trim()) newErrors.title = "Title is required.";
        
        // Validate writer
        if (!String(formData.author).trim()) newErrors.author = "Author is required.";

        // Enhanced description validation for rich text
        const cleanDescription = String(formData.description).replace(/<[^>]*>/g, '').trim();
        if (!cleanDescription) {
            newErrors.description = "Article content is required.";
        } else if (cleanDescription.length < 50) {
            newErrors.description = "Article content must be at least 50 characters long.";
        }

        // Validate category - handle both string and number types
        if (!isNotEmpty(formData.category)) newErrors.category = "Category is required.";
        
        // Validate publish date
        if (!String(formData.publish_date).trim()) {
            newErrors.publish_date = "Publish date is required.";
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(formData.publish_date))) {
            newErrors.publish_date = "Publish date must be in yyyy-mm-dd format.";
        }
        
        // Validate cover image
        if (!formData.cover_image && !articleData?.article?.cover_image) {
            newErrors.cover_image = "Cover image is required.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        mutation.mutate(formData, {
            onSuccess: (data) => {
                if (data?.message === "No changes detected") {
                    // Don't show success message for no changes
                } else {
                    showToast(
                        articleId ? "Article updated successfully!" : "Article uploaded successfully!", 
                        "success"
                    );
                    
                    // Navigate back to article management page after successful update
                    if (articleId) {
                        navigate('/admin/articles-management'); // Navigate to article management page
                        return; // Exit early to prevent form reset
                    }
                }
                
                // Only reset form for new articles, not for updates
                if (!articleId) {
                    setFormData({
                        title: "",
                        author: "",
                        description: "",
                        category: "",
                        publication: "",
                        magazine: "",
                        publish_date: "",
                        publish_date_year: "",
                        publish_date_month: "",
                        cover_image: null,
                    });
                    setSelectedFile(null);
                }
                setErrors({});
                setIsSubmitting(false);
            },
            onError: (error) => {
                console.error("Article upload/update error:", error);
                console.error("Error response:", error.response?.data);
                console.error("Error status:", error.response?.status);
                
                let errorMessage = `Error ${articleId ? "updating" : "uploading"} article: `;
                if (error.response?.data) {
                    if (typeof error.response.data === 'object') {
                        errorMessage += JSON.stringify(error.response.data, null, 2);
                    } else {
                        errorMessage += error.response.data;
                    }
                } else {
                    errorMessage += error.message;
                }
                
                showToast(errorMessage, "error");
                setIsSubmitting(false);
            },
        });
    };

    // Show loading state while fetching data
    if (isFetching || loadingCategories || loadingPublications) return <Loader />;
    if (fetchError) return <p className="p-4 text-red-500">Error fetching article: {fetchError.message}</p>;

    return (
        <div className={`min-h-screen bg-white p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="">
                {/* Header */}
                <div className=" mb-6">
                    <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins color-primary text-center mx-auto w-fit">
                        {t('adminDashboard')}
                    </h1>
                </div>

                {/* Edit Article Section */}
                <div className="bg-white">
                    <div className="border-t-[3px] border-[#DF1600] py-4">
                        <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">{t('editArticle')}</h2>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Article Cover Upload */}
                        <div>
                            <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>{t('articleCover')}</label>
                            <div
                                className={`border-[1px] border-dashed border-[#DF1600] rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${isDragActive ? 'bg-red-50 border-red-400' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {formData.cover_image && typeof formData.cover_image === "string" ? (
                                    <img
                                        src={getFileUrl(formData.cover_image, 'articles')}
                                        alt="Article Cover"
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
                                    <span className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle">{t('dragDropFiles')}</span>
                                    <button onClick={handleBrowseClick} className="font-montserrat font-semibold text-base sm:text-[16px] leading-[24px] tracking-normal text-center align-middle color-primary underline">{t('browse')}</button>
                                </p>
                                {selectedFile && (
                                    <p className="text-green-600 font-montserrat text-xs sm:text-[12px] mt-2">Selected: {selectedFile.name}</p>
                                )}
                                <p className="font-montserrat font-normal text-xs sm:text-[12px] leading-[18px] tracking-normal text-center align-middle color-gray">{t('supportedFormats')}</p>
                            </div>
                            {errors.cover_image && <p className="text-red-600 text-xs mt-1">{errors.cover_image}</p>}
                        </div>

                        <div className="md:w-[90%] flex flex-col md:space-y-8 space-y-4">

                            {/* Form Fields Grid 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                                {/* Article Title */}
                                <div className="col-span-2">
                                    <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>{t('articleTitle')}</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder={t('titlePlaceholder')}
                                        className={`w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle ${isRTL ? 'text-right' : 'text-left'}`}
                                    />
                                    {errors.title && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.title}</p>}
                                </div>

                                {/* Publication - Dynamic (First Priority) */}
                                <div className="col-span-1">
                                    <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>Publication</label>
                                    <div className="relative">
                                        <select
                                            name="publication"
                                            value={formData.publication}
                                            onChange={handleInputChange}
                                            disabled={loadingPublications}
                                            className={`w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle ${isRTL ? 'text-right' : 'text-left'} ${loadingPublications ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{loadingPublications ? t('loading') : 'Select Publication'}</option>
                                            {publications.map((publication) => (
                                                <option key={publication.id} value={publication.id}>
                                                    {publication.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none`} />
                                    </div>
                                    {errors.publication && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.publication}</p>}
                                </div>

                                {/* Category - Dynamic (Filtered by Publication) */}
                                <div className="col-span-1">
                                    <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>{t('category')}</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            disabled={loadingCategories || !formData.publication}
                                            className={`w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle ${isRTL ? 'text-right' : 'text-left'} ${loadingCategories || !formData.publication ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">
                                                {loadingCategories ? t('loading') : 
                                                 !formData.publication ? 'Select Publication First' : 
                                                 t('selectCategory')}
                                            </option>
                                            {getFilteredCategories().map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none`} />
                                    </div>
                                    {!formData.publication && (
                                        <p className="text-blue-600 text-xs mt-1">
                                            💡 Select a publication first to see available categories
                                        </p>
                                    )}
                                    {errors.category && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.category}</p>}
                                </div>
                            </div>

                            {/* Form Fields Grid 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Writer - Dynamic */}
                                <div>
                                    <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>{t('writer')}</label>
                                    <div className="relative">
                                        <select
                                            name="author"
                                            value={formData.author}
                                            onChange={handleInputChange}
                                            disabled={isAuthorsLoading}
                                            className={`w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle ${isRTL ? 'text-right' : 'text-left'} ${isAuthorsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{isAuthorsLoading ? t('loading') : t('selectWriter')}</option>
                                            {authorsError ? (
                                                <option disabled>{t('errorFetchingAuthors')}</option>
                                            ) : (
                                                authors?.map((author) => (
                                                    <option key={author.id} value={author.id}>
                                                        {author.author_name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <ChevronDown className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none`} />
                                    </div>
                                    {errors.author && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.author}</p>}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>{t('date')}</label>
                                    <input
                                        type="date"
                                        name="publish_date"
                                        value={formData.publish_date}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border color-border rounded-md font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle ${isRTL ? 'text-right' : 'text-left'}`}
                                    />
                                    {errors.publish_date && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.publish_date}</p>}
                                </div>
                            </div>

                            {/* Form Fields Grid 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Magazine - Dynamic (Filtered by Publication) */}
                                <div>
                                    <label className={`block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal ${isRTL ? 'text-right' : 'text-left'} align-middle`}>Magazine</label>
                                    <div className="relative">
                                        <select
                                            name="magazine"
                                            value={formData.magazine}
                                            onChange={handleInputChange}
                                            disabled={isMagazinesLoading || !formData.publication}
                                            className={`w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle ${isRTL ? 'text-right' : 'text-left'} ${isMagazinesLoading || !formData.publication ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">
                                                {isMagazinesLoading ? t('loading') : 
                                                 !formData.publication ? 'Select Publication First' : 
                                                 'Select Magazine (Optional)'}
                                            </option>
                                            {magazinesError ? (
                                                <option disabled>Error loading magazines</option>
                                            ) : (
                                                getFilteredMagazines().map((magazine) => (
                                                    <option key={magazine.id} value={magazine.id}>
                                                        {magazine.title} - {magazine.year} {magazine.month}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <ChevronDown className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none`} />
                                    </div>
                                    {!formData.publication && (
                                        <p className="text-blue-600 text-xs mt-1">
                                            💡 Select a publication first to see available magazines
                                        </p>
                                    )}
                                    {errors.magazine && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.magazine}</p>}
                                </div>

                                {/* Empty div for spacing */}
                                <div></div>
                            </div>

                            {/* Article Content */}
                            <div>
                                <label className={`block color-gray mb-2 font-montserrat font-semibold text-sm sm:text-[14px] leading-[100%] tracking-normal align-middle ${isRTL ? 'text-right' : 'text-left'}`}>{t('articleContent')}</label>

                                <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={handleContentChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder={t('writeArticleHere')}
                                        style={{
                                            height: '300px',
                                            fontFamily: 'Montserrat, sans-serif',
                                            fontSize: '14px'
                                        }}
                                        className={`${isRTL ? 'rtl' : 'ltr'}`}
                                    />
                                </div>
                                {errors.description && <p className={`text-red-600 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.description}</p>}

                                {/* Character and Word Count */}
                                <div className={`flex justify-between text-xs text-gray-500 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <span>
                                        Characters: {formData.description.replace(/<[^>]*>/g, '').length}
                                    </span>
                                    <span>
                                        Words: {formData.description.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-4">
                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={() => navigate('/admin/articles-management')}
                                className="bg-gray-500 text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] hover:bg-gray-600"
                            >
                                Back to Articles
                            </button>
                            
                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-primary text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
                            >
                                {isSubmitting ? t('uploading') : t('uploadArticle')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}