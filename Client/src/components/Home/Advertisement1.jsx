import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import AdSlider from '../shared/AdSlider';

const fetchBillboardsByLocation = async (location) => {
    try {
        // Use the new API endpoint that fetches billboards by location
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billboards/location/${location}/`);
        const billboards = res.data.data || [];
        
        console.log(`Advertisement1 - Location ${location}: Found ${billboards.length} billboards`);
        return billboards;
    } catch (error) {
        console.error('Error fetching billboards:', error);
        return [];
    }
};

const Advertisement1 = () => {
    const { data: billboards = [], isLoading, error } = useQuery({
        queryKey: ['billboards', 'location-2'],
        queryFn: () => fetchBillboardsByLocation(2),
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="relative mb-12 px-2">
                <div className="w-[430px] h-[250px] bg-gray-200 animate-pulse flex items-center justify-center rounded">
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative mb-12 px-2">
            <AdSlider 
                ads={billboards}
                imageClassName="w-[430px] h-[250px] object-fill"
                autoSlide={true}
                autoSlideInterval={4000}
                showDots={billboards.length > 1}
                showArrows={billboards.length > 1}
            />
        </div>
    );
};

export default Advertisement1;