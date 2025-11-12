import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import Loader from '../../../components/Loader/loader';

const fetchVideo = async (id) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/video/${id}/`);
    return res.data;
};

const updateVideo = async ({ id, videoData }) => {
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/video/${id}/`, videoData);
    return res.data;
};

const EditVideo = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        youtube_url: '',
        description: '',
        status: 'Active',
        language: 'English',
        order: 0,
    });

    const { data: video, isLoading: isFetching, error: fetchError } = useQuery({
        queryKey: ['video', videoId],
        queryFn: () => fetchVideo(videoId),
        enabled: !!videoId,
    });

    const mutation = useMutation({
        mutationFn: updateVideo,
        onSuccess: () => {
            showToast("Video updated successfully!", "success");
            queryClient.invalidateQueries(['videos-management']);
            navigate('/admin/videos-management');
        },
        onError: (error) => {
            showToast(`Error updating video: ${error.response?.data || error.message}`, "error");
        },
    });

    useEffect(() => {
        if (video) {
            setFormData({
                title: video.title || '',
                youtube_url: video.youtube_url || '',
                description: video.description || '',
                status: video.status || 'Active',
                language: video.language || 'English',
                order: video.order || 0,
            });
        }
    }, [video]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ id: videoId, videoData: formData });
    };

    if (isFetching) return <Loader />;
    if (fetchError) return <p className="p-4 text-red-500">Error fetching video</p>;
    if (mutation.isPending) return <Loader />;

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="relative mb-6">
                <h1 className="font-medium text-[32.21px] leading-[100%] tracking-[-0.03em] uppercase font-poppins text-[#DF1600] text-center mx-auto w-fit">
                    Edit Video
                </h1>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins text-[14px] cursor-text"
                            placeholder="Enter video title"
                        />
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                            YouTube URL *
                        </label>
                        <input
                            type="url"
                            name="youtube_url"
                            value={formData.youtube_url}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins text-[14px] cursor-text"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p className="text-xs text-gray-500 mt-1 font-poppins">
                            Supports YouTube watch URLs, youtu.be links, and embed URLs
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins text-[14px] cursor-text resize-none"
                            placeholder="Enter video description (optional)"
                        />
                    </div>

                    {/* Language Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                            Language *
                        </label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins text-[14px] cursor-pointer bg-white"
                        >
                            <option value="English">English</option>
                            <option value="Urdu">Urdu</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1 font-poppins">
                            Urdu videos will appear in Hilal Urdu and Hilal Kids Urdu pages. English videos will appear in other sections.
                        </p>
                    </div>

                    {/* Status and Order */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins text-[14px] cursor-pointer bg-white"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                                Display Order
                            </label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins text-[14px] cursor-text"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/videos-management')}
                            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium text-[14px] font-poppins cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#DF0404] text-white px-6 py-2 rounded hover:bg-red-700 transition-colors font-bold text-[16.1px] leading-[100%] tracking-[-0.01em] font-poppins cursor-pointer"
                        >
                            Update Video
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVideo;
