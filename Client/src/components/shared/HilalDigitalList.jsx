import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from '../Loader/loader';
import { isEnglishVideo, isUrduVideo } from '../../utils/videoFilters';

/**
 * Unified HilalDigital List component that supports both English and Urdu languages
 * Replaces HilalDigital.jsx and HilalDigitalUrdu.jsx
 * 
 * @param {Object} props
 * @param {string} props.language - 'english' or 'urdu'
 * @param {number} props.maxVideos - Maximum number of videos to show (default: null for all)
 * @param {string} props.className - Additional CSS classes
 */
const HilalDigitalList = ({ 
    language = 'english', 
    maxVideos = null,
    className = '' 
}) => {
    const [playingVideo, setPlayingVideo] = useState(null);
    const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
    const listRef = useRef(null);

    const fetchVideos = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/`);
        const allVideos = res.data.data || [];
        
        // Filter videos based on language
        const filterFunction = language === 'urdu' ? isUrduVideo : isEnglishVideo;
        const filteredVideos = allVideos.filter(filterFunction);
        
        // Apply maxVideos limit if specified
        const videosToReturn = maxVideos ? filteredVideos.slice(0, maxVideos) : filteredVideos;
        
        return videosToReturn;
    };

    const { data: videos = [], isLoading, error } = useQuery({
        queryKey: ['hilal-digital-list', language, maxVideos],
        queryFn: fetchVideos,
    });

    const handleVideoClick = (videoId, index) => {
        setPlayingVideo(videoId);
        setPlayingVideoIndex(index);
    };

    // Language-specific configurations
    const config = {
        english: {
            title: 'HILAL DIGITAL',
            titleClass: 'text-red-600 font-[500] text-[24px] mb-4 leading-[100%] uppercase font-poppins -mt-2',
            noVideosMessage: 'No English videos available',
            direction: 'ltr',
            showLanguageLabel: true
        },
        urdu: {
            title: 'ہلال ڈیجیٹل',
            titleClass: 'text-red-600 font-[500] text-[24px] leading-[100%] uppercase font-urdu-nastaliq-sm1 mb-2 -mt-2',
            noVideosMessage: 'کوئی اردو ویڈیوز دستیاب نہیں',
            direction: 'rtl',
            showLanguageLabel: false
        }
    };

    const currentConfig = config[language];

    if (isLoading) return <Loader />;
    if (error) return <p>Error loading videos</p>;

    // Handle no videos case
    if (!videos || videos.length === 0) {
        return (
            <div className={`bg-white relative max-lg:px-4 flex font-poppins flex-col ${className}`}>
                <div className="bg-white">
                    <div className="border-t-[3px] border-red-600 w-full mb-4 mt-2" />
                    <div className={`flex items-center ${language === 'urdu' ? 'justify-end' : 'justify-between'}`}>
                        <h2
                            className={currentConfig.titleClass}
                            style={{ letterSpacing: "-0.03em" }}
                            dir={currentConfig.direction}
                        >
                            {currentConfig.title}
                        </h2>
                        {currentConfig.showLanguageLabel && (
                            <span className="text-sm text-gray-600 font-medium">English</span>
                        )}
                    </div>
                </div>
                <p className="text-gray-500 text-center py-4">{currentConfig.noVideosMessage}</p>
            </div>
        );
    }

    return (
        <div className={`bg-white relative max-lg:px-4 flex font-poppins flex-col ${className}`}>
            {/* Header */}
            <div className="bg-white">
                <div className="border-t-[3px] border-red-600 w-full mb-4 mt-2" />
                <div className={`flex items-center ${language === 'urdu' ? 'justify-end' : 'justify-between'}`}>
                    <h2
                        className={currentConfig.titleClass}
                        style={{ letterSpacing: "-0.03em" }}
                        dir={currentConfig.direction}
                    >
                        {currentConfig.title}
                    </h2>
                    {currentConfig.showLanguageLabel && (
                        <span className="text-sm text-gray-600 font-medium">English</span>
                    )}
                </div>
            </div>

            {/* Video List */}
            <div
                ref={listRef}
                className=""
                style={{ scrollbarWidth: "none" }}
            >
                {videos.map((video, index) => (
                    <div key={video.id} className="relative border-b my-2 border-gray-200">
                        <div className="relative">
                            {playingVideo === video.video_id && playingVideoIndex === index ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1&controls=1`}
                                    className="w-full h-40"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div
                                    className="relative cursor-pointer"
                                    onClick={() => handleVideoClick(video.video_id, index)}
                                >
                                    <img
                                        src={video.thumbnail_url}
                                        alt="thumbnail"
                                        className="w-full h-36 object-cover transition-opacity duration-200"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-red-600 rounded-lg p-1.5 shadow-md">
                                            <svg className="text-white w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="bg-white py-2">
                                        <p 
                                            className={`text-xs font-semibold text-black leading-[1.8] ${language === 'urdu' ? 'line-clamp-2 text-right font-urdu-nastaliq-sm pb-2' : 'line-clamp-4'}`}
                                            dir={language === 'urdu' ? 'rtl' : 'ltr'}
                                        >
                                            {video.title}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HilalDigitalList;
