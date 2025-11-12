import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AdSlider from './AdSlider';

const fetchBillboardsByLocation = async (location) => {
    try {
        // Use the new API endpoint that fetches ALL billboards by location
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billboards/location/${location}/`);
        const billboards = res.data.data || [];
        
        console.log(`ReaderOpinion - Location ${location}: Found ${billboards.length} billboards`);
        return billboards;
    } catch (error) {
        console.error('Error fetching billboards:', error);
        return [];
    }
};

const ReaderOpinion = ({ 
    isUrdu = false, 
    showAdSliders = false,
    className = "",
    billboardLocation1 = 5,
    billboardLocation2 = 6,
    queryKeyPrefix = "billboards"
}) => {
    const { data: billboards1 = [], isLoading: loading1, error: error1 } = useQuery({
        queryKey: [queryKeyPrefix, "location-5"],
        queryFn: () => fetchBillboardsByLocation(billboardLocation1),
        retry: false, // Don't retry on failures
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
    });

    const { data: billboards2 = [], isLoading: loading2, error: error2 } = useQuery({
        queryKey: [queryKeyPrefix, "location-6"],
        queryFn: () => fetchBillboardsByLocation(billboardLocation2),
        retry: false, // Don't retry on failures
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
    });

    // Sample reader opinions data - in a real app, this would come from an API
    const sampleOpinions = [
        {
            id: 1,
            text: "Long established fact that a reader will be distracted",
            author: "Nikunj2",
            date: "16 April 2017"
        },
        {
            id: 2,
            text: "Another reader opinion about the publication content",
            author: "Reader1",
            date: "15 April 2017"
        },
        {
            id: 3,
            text: "Third opinion from a loyal reader of the magazine",
            author: "Reader2",
            date: "14 April 2017"
        }
    ];

    const title = isUrdu ? "قارئین کی رائے" : "READERS OPINION";
    const titleClassName = isUrdu ? "heading-text-primary font-urdu-nastaliq-sm1" : "heading-text-primary";
    const titleDir = isUrdu ? "rtl" : "ltr";

    return (
        <div className={`font-poppins ${className}`}>
            {/* Advertisement Boxes Sliders - Only show if enabled */}
            {/* {showAdSliders && (
                <div className="space-y-2 max-lg:mt-2 justify-around flex mx-auto w-[90%] gap-x-6">
                    <div className="w-[120px]">
                        <AdSlider 
                            ads={billboards1}
                            imageClassName="w-[120px] h-[120px] object-fill"
                            autoSlide={true}
                            autoSlideInterval={4000}
                            showDots={billboards1.length > 1}
                            showArrows={false} // Hide arrows for small size
                        />
                    </div>

                    <div className="w-[120px]">
                        <AdSlider 
                            ads={billboards2}
                            imageClassName="w-[120px] h-[120px] object-fill"
                            autoSlide={true}
                            autoSlideInterval={4500}
                            showDots={billboards2.length > 1}
                            showArrows={false} // Hide arrows for small size
                        />
                    </div>
                </div>
            )} */}

            {/* Readers Opinion Section */}
            <div className="border-t-[3px] border-red-600">
                <div className="py-2 px-4">
                    <h2 className={titleClassName} dir={titleDir}>
                        {title}
                    </h2>
                </div>

                <div className="bg-gray-50 p-3 space-y-3">
                    {sampleOpinions.map((opinion) => (
                        <div
                            key={opinion.id}
                            className="flex gap-3 shadow-[6px_6px_10px_rgba(0,0,0,0.15)] py-3 px-2 items-start"
                        >
                            <div className="flex self-center">
                                <img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjDGMp734S91sDuUFqL51_xRTXS15iiRoHew&s"
                                    alt="Reader"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold line-clamp-2 text-black leading-[1.8]">
                                    &ldquo; {opinion.text}
                                </p>
                                <div className="text-xs text-gray-400 mt-1">
                                    By <span>{opinion.author}</span> - {opinion.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReaderOpinion;
