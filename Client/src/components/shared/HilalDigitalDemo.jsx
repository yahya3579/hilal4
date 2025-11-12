import React from "react";
import HilalDigitalList from './HilalDigitalList';
import HilalDigitalGrid from './HilalDigitalGrid';

/**
 * Demo component showing all possible configurations of the unified HilalDigital components
 * This can be used for testing and documentation purposes
 */
const HilalDigitalDemo = () => {
    return (
        <div className="space-y-8 p-4">
            <h1 className="text-2xl font-bold text-center mb-8">HilalDigital Components Demo</h1>
            
            {/* English List Layout */}
            <div>
                <h2 className="text-lg font-semibold mb-4">English List Layout (3 videos max)</h2>
                <HilalDigitalList 
                    language="english" 
                    maxVideos={3}
                />
            </div>

            {/* Urdu List Layout */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Urdu List Layout (all videos)</h2>
                <HilalDigitalList 
                    language="urdu" 
                    className="overflow-y-auto h-[560px]"
                />
            </div>

            {/* Grid Layout (shows all videos) */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Grid Layout (All Videos)</h2>
                <HilalDigitalGrid 
                    language="english"
                />
            </div>

            {/* Grid Layout with Urdu styling */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Grid Layout (Urdu Styling)</h2>
                <HilalDigitalGrid 
                    language="urdu"
                />
            </div>
        </div>
    );
};

export default HilalDigitalDemo;
