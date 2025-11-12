import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import HilalKidsUrdu from "../../assets/hilal-kids-urdu.jpeg";
import HilalUrdu from "../../assets/hilal-urdu.jpeg";
import HilalHer from "../../assets/hilal-her.jpeg";
import HilalKidsEnglish from "../../assets/hilal-kids-english.jpeg";
import HilalEnglish from "../../assets/hilal-english.jpeg";
import Loader from "../Loader/loader";
import CommonCard8Urdu from "../shared/urdu/CommonCard8Urdu";
import { getCurrentMonthYearUrdu } from "../../utils/dateUtils";
import AdSlider from "../shared/AdSlider";

const fetchBillboardsByLocation = async (location) => {
  try {
    // Use the new API endpoint that fetches ALL billboards by location
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/billboards/location/${location}/`
    );
    const billboards = res.data.data || [];

    console.log(
      `ArmedForcesNewsUrdu - Location ${location}: Found ${billboards.length} billboards`
    );
    return billboards;
  } catch (error) {
    console.error("Error fetching billboards:", error);
    return [];
  }
};

const ArmedForcesNewsUrdu = () => {
  const {
    data: articles,
    isLoading: articlesLoading,
    error: articlesError,
  } = useQuery({
    queryKey: ["articles", "armed-forces-news-urdu", "Hilal Urdu"],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("publication", "Hilal Urdu");
      params.append("category_id", "20"); // armed-forces-news-urdu category for Hilal Urdu
      params.append("count", "6");

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/articles/filtered/?${params.toString()}`
      );
      return res.data.data || [];
    },
  });

  const {
    data: billboards = [],
    isLoading: billboardLoading,
    error: billboardError,
  } = useQuery({
    queryKey: ["billboards-urdu", "location-1"],
    queryFn: () => fetchBillboardsByLocation(1),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (articlesLoading) return <Loader />;
  if (articlesError) return <p>Error fetching articles</p>;

  // Sort articles by date (newest first)
  const sortedArticles = articles
    ? [...articles].sort(
        (a, b) => new Date(b.publish_date) - new Date(a.publish_date)
      )
    : [];

  return (
    <>
      <div className="px-4 pb-3">
        <div className="flex max-md:flex-wrap gap-2 py-3 justify-center">
          <Link to={`/hilal-english-kids`} className="relative group">
            <img
              src={HilalKidsEnglish}
              alt={`hilal kids english`}
              className="w-20 h-28 object-cover flex-shrink-0 transition-opacity duration-300 group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
              <span className="text-white  text-xs urdu-text font-bold text-center px-1">
                ہلال کڈز انگلش
              </span>
            </div>
          </Link>
          <Link to={`/hilal-english`} className="relative group">
            <img
              src={HilalEnglish}
              alt={`hilal english`}
              className="w-20 h-28 object-cover flex-shrink-0 transition-opacity duration-300 group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
              <span className="text-white  text-xs urdu-text font-bold text-center px-1">
                ہلال انگلش
              </span>
            </div>
          </Link>
          <Link to={`/hilal-her`} className="relative group">
            <img
              src={HilalHer}
              alt={`hilal her`}
              className="w-20 h-28 object-cover flex-shrink-0 transition-opacity duration-300 group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
              <span className="text-white text-xs urdu-text font-bold text-center px-1">
                ہلال ہر
              </span>
            </div>
          </Link>
          <Link to={`/hilal-urdu-kids/`} className="relative group">
            <img
              src={HilalKidsUrdu}
              alt={`hilal kids urdu`}
              className="w-20 h-28 object-cover flex-shrink-0 transition-opacity duration-300 group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
              <span className="text-white text-xs urdu-text font-bold text-center px-1">
                ہلال کڈز اردو
              </span>
            </div>
          </Link>
          <Link to={`/hilal-urdu/`} className="relative group">
            <img
              src={HilalUrdu}
              alt={`hilal urdu`}
              className="w-20 h-28 object-cover flex-shrink-0 transition-opacity duration-300 group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
              <span className="text-white text-xs urdu-text font-bold text-center px-1">
                ہلال اردو
              </span>
            </div>
          </Link>
        </div>

        <div className="border-gray-200 relative py-6 outline-none">
          {/* Header */}
          <div className="text-center py-1 mb-2 outline-none">
            <span className="bg-red-600 text-white px-8 py-2 font-bold text-sm outline-none w-full flex justify-between items-center">
              <span className="text-xs font-normal font-urdu-nastaliq-sm1">
                {getCurrentMonthYearUrdu()}
              </span>
              <span className="font-urdu-nastaliq-sm1">
                مسلح افواج کی خبریں
              </span>
            </span>
          </div>

          <div className="pb-2 mt-5 outline-none">
            {/* News Items - Continuous Scrolling Animation */}
            <div className="news-ticker-container outline-none">
              <div className="news-ticker-content">
                {/* Original articles */}
                {sortedArticles.map((article) => (
                  <div
                    key={`original-${article.id}`}
                    className="news-ticker-item"
                  >
                    <CommonCard8Urdu article={article} />
                  </div>
                ))}
                {/* Duplicate articles for seamless loop */}
                {sortedArticles.map((article) => (
                  <div
                    key={`duplicate-${article.id}`}
                    className="news-ticker-item"
                  >
                    <CommonCard8Urdu article={article} />
                  </div>
                ))}
              </div>
            </div>

            {/* Advertisement Banner Slider */}
            {/* <div className="mt-6 relative outline-none">
                            <AdSlider 
                                ads={billboards}
                                imageClassName="w-full h-[100px] object-fill rounded outline-none"
                                autoSlide={true}
                                autoSlideInterval={5000}
                                showDots={billboards.length > 1}
                                showArrows={billboards.length > 1}
                            />
                        </div> */}
            <div className="mt-6 relative outline-none">
              <AdSlider
                ads={billboards}
                imageClassName="w-full h-[400px] object-fill rounded outline-none"
                autoSlide={true}
                autoSlideInterval={5000}
                showDots={billboards.length > 1}
                showArrows={billboards.length > 1}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArmedForcesNewsUrdu;
