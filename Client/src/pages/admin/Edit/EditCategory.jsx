import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../../utils/store";
import Loader from "../../../components/Loader/loader";
import { useToast } from "../../../context/ToastContext";
const fetchCategoryById = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/category/${id}/`);
    console.log("Fetched category data:", res.data);
    return res.data;
};

const fetchPublications = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/publications/`);
    return res.data.data;
};

const saveCategory = async ({ id, data }) => {
    if (id) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/category/${id}/`, data);
        console.log("Category updated successfully:", res.data);
        return res.data;
    } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/category/create/`, data);
        return res.data;
    }
};

export default function EditCategory() {
    const { categoryId } = useParams();
    const userId = useAuthStore((state) => state.userId)
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        display_name: "",
        publication: "",
        status: "Active",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: categoryData, isLoading } = useQuery({
        queryKey: ["category", categoryId],
        queryFn: () => fetchCategoryById(categoryId),
        enabled: !!categoryId,
    });

    const { data: publications, isLoading: isLoadingPublications } = useQuery({
        queryKey: ["publications"],
        queryFn: fetchPublications,
    });

    const mutation = useMutation({
        mutationFn: saveCategory,
        onSuccess: () => {
            showToast(categoryId ? "Category updated successfully!" : "Category created successfully!", "success");
            navigate("/admin/categories-management");
        },
        onError: (error) => {
            showToast(`Error ${categoryId ? "updating" : "creating"} category: ${error.response?.data || error.message}`, "error");
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    useEffect(() => {
        if (categoryId && categoryData) {
            setFormData({
                name: categoryData.name || "",
                display_name: categoryData.display_name || "",
                publication: categoryData.publication || "",
                status: categoryData.status || "Active",
            });
        }
    }, [categoryId, categoryData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.display_name.trim()) newErrors.display_name = "Display name is required.";
        if (!formData.publication) newErrors.publication = "Publication is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if there are any changes from the original category data
    const hasChanges = () => {
        if (!categoryData) return true; // If no original data, consider it a change
        
        const original = categoryData;
        const current = formData;
        
        return (
            original.name !== current.name ||
            original.display_name !== current.display_name ||
            String(original.publication) !== String(current.publication) ||
            original.status !== current.status
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Check if there are any changes before proceeding
        if (categoryId && !hasChanges()) {
            showToast("No changes detected. Category not updated.", "info");
            return;
        }

        setIsSubmitting(true);

        const updatedData = {
            ...formData,
        };

        mutation.mutate({ id: categoryId, data: updatedData });
    };

    if (isLoading || isLoadingPublications) return <Loader />;

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins color-primary text-center mx-auto w-fit">
                        Admin Dashboard
                    </h1>
                </div>

                {/* Edit Category Section */}
                <div className="bg-white">
                    <div className="border-t-[3px] border-[#DF1600] py-4">
                        <h2 className="font-poppins font-medium text-[24px] leading-[100%] tracking-[-0.03em] uppercase color-primary">
                            {categoryId ? 'Edit Category' : 'Create Category'}
                        </h2>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="md:w-[90%] flex flex-col md:space-y-8 space-y-4">
                            {/* Form Fields Grid 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Category Name */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="trending-english"
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
                                        placeholder="Trending English"
                                        name="display_name"
                                        value={formData.display_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border color-border rounded-md font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                    />
                                    {errors.display_name && <p className="text-red-600 text-xs mt-1">{errors.display_name}</p>}
                                </div>
                            </div>

                            {/* Form Fields Grid 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Publication */}
                                <div>
                                    <label className="block color-gray mb-2 font-montserrat font-semibold text-[14px] leading-[100%] tracking-normal align-middle">
                                        Publication
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="publication"
                                            value={formData.publication}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border color-border rounded-md appearance-none bg-white font-montserrat align-middlefont-montserrat font-normal text-[12px] leading-[18px] tracking-normal text-[#0F0F0F] align-middle"
                                        >
                                            <option value="">Select Publication</option>
                                            {publications?.map((publication) => (
                                                <option key={publication.id} value={publication.id}>
                                                    {publication.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    {errors.publication && <p className="text-red-600 text-xs mt-1">{errors.publication}</p>}
                                </div>

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
                                onClick={() => navigate('/admin/categories-management')}
                                className="bg-gray-500 text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] hover:bg-gray-600"
                            >
                                Back to Categories
                            </button>
                            
                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-primary text-white px-6 sm:px-8 py-2 transition-colors font-poppins font-bold text-lg sm:text-[20px] leading-[100%] tracking-[-0.01em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
                            >
                                {isSubmitting ? (categoryId ? "Updating..." : "Creating...") : (categoryId ? "Update Category" : "Create Category")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
