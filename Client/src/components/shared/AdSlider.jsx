import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBillboardImageUrl } from '../../utils/fileManager';

const AdSlider = ({ 
    ads = [], 
    className = "", 
    imageClassName = "w-full h-[250px] object-fill",
    autoSlide = true,
    autoSlideInterval = 5000,
    showDots = true,
    showArrows = true 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide functionality
    useEffect(() => {
        if (!autoSlide || ads.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === ads.length - 1 ? 0 : prevIndex + 1
            );
        }, autoSlideInterval);

        return () => clearInterval(interval);
    }, [autoSlide, autoSlideInterval, ads.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? ads.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === ads.length - 1 ? 0 : currentIndex + 1);
    };

    // If no ads, show placeholder
    if (!ads || ads.length === 0) {
        return (
            <div className={`relative ${className}`}>
                <div className={`bg-gray-200 flex items-center justify-center rounded ${imageClassName}`}>
                    <p className="text-gray-500 font-medium">No Ads Available</p>
                </div>
            </div>
        );
    }

    // If only one ad, show without slider controls
    if (ads.length === 1) {
        return (
            <div className={`relative ${className}`}>
                <img
                    src={getBillboardImageUrl(ads[0].image)}
                    alt={ads[0].title || "Advertisement"}
                    className={imageClassName}
                />
            </div>
        );
    }

    return (
        <div className={`relative group ${className}`}>
            {/* Main Image */}
            <div className="relative overflow-hidden rounded">
                <img
                    src={getBillboardImageUrl(ads[currentIndex].image)}
                    alt={ads[currentIndex].title || "Advertisement"}
                    className={`transition-all duration-500 ease-in-out ${imageClassName}`}
                />
            </div>

            {/* Navigation Arrows */}
            {showArrows && ads.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Previous ad"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Next ad"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {showDots && ads.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex 
                                    ? 'bg-white' 
                                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                            aria-label={`Go to ad ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Ad Counter */}
            {ads.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {currentIndex + 1} / {ads.length}
                </div>
            )}
        </div>
    );
};

export default AdSlider;
