import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../Loader/loader';
import CommonCard8English from '../shared/english/CommonCard8English';
import { getCurrentMonthYear } from "../../utils/dateUtils";
import AdSlider from '../shared/AdSlider';
import useAuthStore from '../../utils/store';

const fetchBillboardsByLocation = async (location) => {
  try {
    // Use the new API endpoint that fetches ALL billboards by location
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/billboards/location/${location}/`);
    const billboards = res.data.data || [];
    
    console.log(`ArmedForcesNews - Location ${location}: Found ${billboards.length} billboards`);
    return billboards;
  } catch (error) {
    console.error('Error fetching billboards:', error);
    return [];
  }
};

const ArmedForcesNews = () => {
  // Get publications from store instead of API call
  const publications = useAuthStore((state) => state.publications);
  const loadingPublications = useAuthStore((state) => state.loadingPublications);

  // Find the Hilal English publication dynamically
  const hilalEnglishPub = publications.find(pub => 
    pub.name === 'hilal-english' || 
    pub.id === 2
  );

  console.log('ArmedForcesNews Debug:', {
    publications: publications.length,
    hilalEnglishPub: hilalEnglishPub?.name,
    hilalEnglishPubId: hilalEnglishPub?.id
  });

  const { data: articles, isLoading: articlesLoading, error: articlesError } = useQuery({
    queryKey: ['articles', 'news', hilalEnglishPub?.name || 'hilal-english'],
    queryFn: async () => {
      if (!hilalEnglishPub) {
        console.warn('Hilal English publication not found');
        return [];
      }

      const params = new URLSearchParams();
      params.append('publication', hilalEnglishPub.name);
      params.append('category', 'news'); // Use category name "news"
      params.append('count', '6');
      
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles/filtered/?${params.toString()}`);
      console.log('ArmedForcesNews API Response:', res.data);
      return res.data.data || [];
    },
    enabled: !!hilalEnglishPub, // Only run query if publication is found
  });

  const { data: billboards = [] } = useQuery({
    queryKey: ['billboards', 'location-1'],
    queryFn: () => fetchBillboardsByLocation(1),
    retry: false, // Don't retry on failures
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  if (articlesLoading || loadingPublications) return <Loader />;
  if (articlesError) return <p>Error fetching articles</p>;

  // Sort articles by date (newest first) and limit to 6 articles
  const sortedArticles = articles ? [...articles].sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date)).slice(0, 6) : [];
  
  console.log('ArmedForcesNews Articles:', {
    articlesCount: articles?.length || 0,
    sortedArticlesCount: sortedArticles.length,
    articles: sortedArticles.map(a => ({ id: a.id, title: a.title }))
  });

  // Filter publications that have cover images and are active
  const publicationsWithCovers = publications.filter(pub => 
    pub.status === 'Active' && pub.cover_image
  );

  return (
    <>
      <div className='px-4 pb-3'>
        <div className="flex max-md:flex-wrap gap-2 py-3 justify-center">
          {publicationsWithCovers.length > 0 ? (
            publicationsWithCovers.map((publication) => (
              <Link 
                key={publication.id} 
                to={`/${publication.name}`} 
                className="relative group"
              >
                <img
                  src={`${publication.cover_image}`}
                  alt={publication.display_name}
                  className="w-20 h-28 object-cover flex-shrink-0 transition-opacity duration-300 group-hover:opacity-75"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
                  <span className="text-white text-xs font-bold text-center px-1">
                    {publication.display_name}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No publications available</p>
            </div>
          )}
        </div>

        <div className="border-gray-200 relative py-2 outline-none">
          {/* Header */}
          <div className="text-center py-1 mb-2 outline-none">
            <span className="bg-red-600 text-white px-8 py-2 font-bold text-sm outline-none w-full flex justify-between items-center">
              <span>Armed Forces News</span>
              <span className="text-xs font-normal">{getCurrentMonthYear()}</span>
            </span>
          </div>

          <div className="pb-2 mt-5 outline-none">
            {/* News Items - Continuous Scrolling Animation */}
            <div className="news-ticker-container outline-none">
              <div className="news-ticker-content">
                {sortedArticles.length > 0 ? (
                  <>
                    {/* Original articles */}
                    {sortedArticles.map((article) => (
                      <div key={`original-${article.id}`} className="news-ticker-item">
                        <CommonCard8English article={article} />
                      </div>
                    ))}
                    {/* Duplicate articles for seamless loop */}
                    {sortedArticles.map((article) => (
                      <div key={`duplicate-${article.id}`} className="news-ticker-item">
                        <CommonCard8English article={article} />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="news-ticker-item">
                    <div className="text-center py-8">
                      <p className="text-gray-500">No news articles available at the moment.</p>
                      <p className="text-sm text-gray-400 mt-2">Please check back later.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advertisement Banner Slider */}
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

export default ArmedForcesNews;
