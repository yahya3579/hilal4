import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import AdSlider from '../shared/AdSlider';

const fetchBillboardsByLocation = async (location) => {
    try {
        // Use the new API endpoint that fetches ALL billboards by location
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billboards/location/${location}/`);
        const billboards = res.data.data || [];
        
        console.log(`Advertisement2Urdu - Location ${location}: Found ${billboards.length} billboards`);
        return billboards;
    } catch (error) {
        console.error('Error fetching billboards:', error);
        return [];
    }
};

const Advertisement2Urdu = () => {
    const { data: billboards = [], isLoading, error } = useQuery({
        queryKey: ['billboards-urdu', 'location-3'],
        queryFn: () => fetchBillboardsByLocation(3),
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="border-t-[3px] mx-4 border-red-600 mt-10">
                <div className="">
                    <h3 className="heading-text-primary">اشتہار</h3>
                </div>
                <div className="relative mt-6">
                    <div className="w-[300px] h-[250px] bg-gray-200 animate-pulse flex items-center justify-center rounded">
                        <p className="text-gray-500 font-medium">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t-[3px] mx-4 border-red-600 mt-10">
            <div className="flex justify-between items-center">
                <h3 className="heading-text-primary">اشتہار</h3>
                {billboards.length > 1 && (
                    <span className="text-xs text-gray-600">{billboards.length} اشتہارات</span>
                )}
            </div>
            <div className="relative mt-6">
                <AdSlider 
                    ads={billboards}
                    imageClassName="w-[300px] h-[250px] object-fill"
                    autoSlide={true}
                    autoSlideInterval={5000}
                    showDots={billboards.length > 1}
                    showArrows={billboards.length > 1}
                />
            </div>
        </div>
    );
};

export default Advertisement2Urdu;