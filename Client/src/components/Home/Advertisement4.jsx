import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import AdSlider from '../shared/AdSlider';

const fetchBillboardsByLocation = async (location) => {
    try {
        // Use the new API endpoint that fetches billboards by location
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billboards/location/${location}/`);
        const billboards = res.data.data || [];
        
        console.log(`Advertisement4 - Location ${location}: Found ${billboards.length} billboards`);
        return billboards;
    } catch (error) {
        console.error('Error fetching billboards:', error);
        return [];
    }
};

const Advertisement4 = () => {
    const { data: billboards = [], isLoading, error } = useQuery({
        queryKey: ['billboards', 'location-4'],
        queryFn: () => fetchBillboardsByLocation(4),
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="w-[80%] mx-auto my-6">
                <div className="mx-auto w-full h-[90px] bg-gray-200 animate-pulse flex items-center justify-center rounded">
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[80%] mx-auto my-6">
            <AdSlider 
                ads={billboards}
                imageClassName="mx-auto w-full h-[90px] object-fill"
                autoSlide={true}
                autoSlideInterval={6000}
                showDots={billboards.length > 1}
                showArrows={billboards.length > 1}
                className="mx-auto"
            />
        </div>
    );
};

export default Advertisement4;
