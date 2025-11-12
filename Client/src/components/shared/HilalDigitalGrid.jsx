import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from '../Loader/loader';
// No longer need video filters since we show all videos

/**
 * Unified HilalDigital Grid component that shows all videos (English and Urdu)
 * Replaces Hillal_Digital_2.jsx and HilalDigital2Urdu.jsx
 * 
 * @param {Object} props
 * @param {string} props.language - 'english' or 'urdu' (for styling only)
 * @param {string} props.className - Additional CSS classes
 */
const HilalDigitalGrid = ({ 
    language = 'english', 
    className = '' 
}) => {
    const [playingVideo, setPlayingVideo] = useState(null);

    const fetchHilalDigitalData = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/hilal-digital/`);
        const data = res.data.data;
        
        if (!data) return null;
        
        // Show all videos regardless of language
        return {
            featured_video: data.featured_video,
            other_videos: data.other_videos || []
        };
    };

    const { data: videoData, isLoading, error } = useQuery({
        queryKey: ['hilal-digital-grid'],
        queryFn: fetchHilalDigitalData,
    });

    const handleVideoClick = (videoId) => {
        setPlayingVideo(videoId);
    };

    // Language-specific configurations
    const config = {
        english: {
            title: 'Hilal Digital',
            titleClass: 'heading-text-primary',
            noVideosMessage: 'No English videos available',
            direction: 'ltr',
            showLanguageLabel: true,
            featuredVideoPosition: 'left'
        },
        urdu: {
            title: 'ہلال ڈیجیٹل',
            titleClass: 'heading-text-primary font-urdu-nastaliq-sm1',
            noVideosMessage: 'کوئی اردو ویڈیوز دستیاب نہیں',
            direction: 'rtl',
            showLanguageLabel: false,
            featuredVideoPosition: 'right'
        }
    };

    const currentConfig = config[language];

    if (isLoading) return <Loader />;
    if (error) return <p>Error loading videos</p>;
    if (!videoData) return <p>No videos available</p>;

    const { featured_video, other_videos } = videoData;
    
    // If no videos found, don't render the component
    if (!featured_video && (!other_videos || other_videos.length === 0)) {
        return (
            <div className={`bg-white font-poppins px-4 py-2 ${className}`}>
                <div className="border-t-[3px] border-red-600">
                    <div className={`py-2 mb-2 flex items-center ${language === 'urdu' ? 'justify-end' : 'justify-between'}`}>
                        <h2 className={currentConfig.titleClass} dir={currentConfig.direction}>
                            {currentConfig.title}
                        </h2>
                        {currentConfig.showLanguageLabel && (
                            <span className="text-sm text-gray-600 font-medium">English</span>
                        )}
                    </div>
                    <p className="text-gray-500 text-center py-4">No videos available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white font-poppins px-4 py-2 ${className}`}>
            {/* Header */}
            <div className="border-t-[3px] border-red-600">
                <div className={`py-2 mb-2 flex items-center ${language === 'urdu' ? 'justify-end' : 'justify-between'}`}>
                    <h2 className={currentConfig.titleClass} dir={currentConfig.direction}>
                        {currentConfig.title}
                    </h2>
                    {currentConfig.showLanguageLabel && (
                        <span className="text-sm text-gray-600 font-medium">English</span>
                    )}
                </div>

                {/* Main Content */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-x-2 max-lg:gap-y-3 lg:gap-x-8`} dir="ltr">
                    
                    {/* Featured Video */}
                    <div className={`lg:col-span-1 ${language === 'urdu' ? 'w-full' : ''}`} dir={language === 'urdu' ? 'rtl' : 'ltr'}>
                        {playingVideo ? (
                            <div className="overflow-hidden">
                                <div className="aspect-video h-[350px] w-full bg-gray-900 relative">
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1&controls=1`}
                                        title="Playing Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        ) : featured_video ? (
                            <div className="overflow-hidden">
                                <div
                                    className="aspect-video h-[350px] w-full bg-gray-900 relative cursor-pointer"
                                    onClick={() => handleVideoClick(featured_video.video_id)}
                                >
                                    <img
                                        src={featured_video.thumbnail_url}
                                        alt={featured_video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-red-600 rounded-lg p-2 shadow-md">
                                            <svg className="text-white w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video h-[350px] w-full bg-gray-200 flex items-center justify-center">
                                <p className="text-gray-500">No featured video available</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Videos */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {other_videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                                    onClick={() => handleVideoClick(video.video_id)}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-full h-28 bg-gray-200">
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {playingVideo === video.video_id ? (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="bg-red-600 rounded-full p-1">
                                                    <svg
                                                        className="text-white w-3 h-3 fill-current"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <div className="bg-black bg-opacity-70 rounded-full p-1">
                                                    <svg
                                                        className="text-white w-3 h-3 fill-current"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="p-2">
                                        <h3 className="text-xs font-semibold line-clamp-2 text-black leading-snug">
                                            {video.title}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HilalDigitalGrid;
