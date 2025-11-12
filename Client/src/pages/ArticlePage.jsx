import React, { useState, useEffect } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { ExternalLink, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "../utils/store";
import Loader from "../components/Loader/loader";
import hilalLogoImage from "../assets/hilal-logo.svg";
import { processDescription } from "../utils/processDescription";

const fetchArticle = async (id) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/article/${id}`);
  console.log(res.data)
  return res.data;
};

// Helper function to check if a string contains Urdu characters
const containsUrduCharacters = (str) => {
  if (!str) return false;
  // Urdu Unicode range: U+0600 to U+06FF (Arabic script)
  const urduRegex = /[\u0600-\u06FF]/;
  return urduRegex.test(str);
};

// Helper function to determine if article is in Urdu based on multiple criteria
const isUrduArticle = (article, categoryName, categoryDisplayName, publication) => {
  // Check publication_id (1 = Hilal Urdu, 4 = Hilal Urdu Kids)
  if (publication && publication.id) {
    if (publication.id === 1 || publication.id === 4) {
      return true;
    }
  }
  
  // Check publication name
  if (publication && publication.name) {
    const pubName = publication.name.toLowerCase();
    if (pubName.includes('urdu') || pubName === 'hilal-urdu' || pubName === 'hilal-urdu-kids') {
      return true;
    }
  }
  
  // Check publication display_name for Urdu characters
  if (publication && publication.display_name) {
    if (containsUrduCharacters(publication.display_name)) {
      return true;
    }
  }
  
  // Check article publication_name if available
  if (article && article.publication_name) {
    const pubName = article.publication_name.toLowerCase();
    if (pubName.includes('urdu') || pubName === 'hilal-urdu' || pubName === 'hilal-urdu-kids') {
      return true;
    }
  }
  
  // Check category display_name for Urdu characters
  if (categoryDisplayName && containsUrduCharacters(categoryDisplayName)) {
    return true;
  }
  
  // Check category name patterns
  if (categoryName) {
    const categoryLower = categoryName.toLowerCase();
    
    // Known Urdu category patterns
    const urduCategoryPatterns = [
      'urdu',
      'hilal-urdu',
      'in-focus-urdu',
      'trending-urdu',
      'national-international-news-urdu',
      'armed-forces-news-urdu',
      'in-focus-urdu-kids',
      'trending-urdu-kids',
      'national-international-news-urdu-kids',
      'علم',
      'قومی',
      'بین',
      'دفاع',
      'یوم',
      'رپورٹ',
      'اداریہ',
      'ہلال',
      'بچوں',
      'نیوز',
      'خبریں',
      'مسلح',
      'افواج',
      'خصوصی',
      'ٹرینڈنگ',
      'فوکس'
    ];
    
    // Check if category name contains any Urdu pattern
    for (const pattern of urduCategoryPatterns) {
      if (categoryLower.includes(pattern)) {
        return true;
      }
    }
    
    // Check if category name itself contains Urdu characters
    if (containsUrduCharacters(categoryName)) {
      return true;
    }
  }
  
  return false;
};


// Function to get proper category display name
const getCategoryDisplayName = (category) => {
  const categoryMap = {
    // Hilal English
    "trending-english-1": "Trending English",
    "trending-english-2": "Trending English",
    "in-focus": "In Focus",
    "war-on-terror": "War on Terror",
    "special-reports": "Special Reports",
    "national-international-news": "National Interasdsnational News",
    "armed-forces-news": "Armed Forces News",
    "misc": "Misc",

    // Hilal Urdu
    "in-focus-urdu": "ان فوکس",
    "trending-urdu": "ٹرینڈنگ اردو",
    "national-international-news-urdu": "قومی و بین الاقوامی خبریں",
    "armed-forces-news-urdu": "مسلح افواج کی خبریں",

    // Hilal Urdu Kids
    "in-focus-urdu-kids": "ان فوکس - بچوں کے لیے",
    "trending-urdu-kids": "ٹرینڈنگ - بچوں کے لیے",
    "national-international-news-urdu-kids": "قومی و بین الاقوامی خبریں - بچوں کے لیے",

    // Hilal Her
    "in-focus-her": "In Focus - Her",
    "trending1-her": "Trending - Her",
    "hilal-her": "Hilal Her",

    // Hilal Kids
    "hilal-kids-english": "Hilal for Kids - English",
    "in-focus-kids": "In Focus - Kids",
    "trending-kids": "Trending - Kids",

    // Digital
    "digital": "Digital"
  };

  return categoryMap[category] || category;
};

// Function to remove cover image from article content and return info about remaining images
const processArticleContent = (content, coverImageUrl) => {
  if (!content) return { processedContent: content, hasOtherImages: false, coverImageInContent: false };
  
  // Process the description to replace environment variables
  const processedContent = processDescription(content, { replaceEnvVars: true });
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = processedContent;
  
  // Find all img elements
  const images = tempDiv.querySelectorAll('img');
  let hasOtherImages = false;
  let coverImageInContent = false;
  
  images.forEach(img => {
    const imgSrc = img.getAttribute('src') || img.src;
    
    // Check if this is the cover image
    if (coverImageUrl && (imgSrc === coverImageUrl || imgSrc.includes(coverImageUrl) || coverImageUrl.includes(imgSrc))) {
      console.log('Removing cover image from content:', imgSrc);
      coverImageInContent = true;
      img.remove();
    } else {
      // This is another image, keep it
      hasOtherImages = true;
      console.log('Keeping other image in content:', imgSrc);
      // Ensure inline images are horizontally centered and responsive
      img.style.display = 'block';
      img.style.marginLeft = 'auto';
      img.style.marginRight = 'auto';
      img.style.marginTop = '12px';
      img.style.marginBottom = '12px';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
  });
  
  // Style horizontal rules to be light gray and subtle
  const horizontalRules = tempDiv.querySelectorAll('hr');
  horizontalRules.forEach(hr => {
    hr.style.border = '0';
    hr.style.borderTop = '1px solid #e5e7eb';
    hr.style.marginTop = '12px';
    hr.style.marginBottom = '12px';
  });
  
  return {
    processedContent: tempDiv.innerHTML,
    hasOtherImages: hasOtherImages,
    coverImageInContent: coverImageInContent
  };
};

export default function ArticlePage() {
  const userId = useAuthStore((state) => state.userId);
  const { articleId } = useParams();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUrdu, setIsUrdu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthorized = useAuthStore((state) => state.isAuthorized);


  const { data: articleData, isLoading: isArticleLoading, error: articleError } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => fetchArticle(articleId),
    enabled: !!articleId,
  });
  console.log(articleData)

  // Extract data from the API response
  const article = articleData?.article;
  const author = articleData?.author;
  const recentArticles = articleData?.recent_articles || [];
  const categoryDisplayName = articleData?.category_display_name;
  const publication = articleData?.publication;

  // Update isUrdu state when article data changes
  useEffect(() => {
    if (article) {
      const currentArticleIsUrdu = isUrduArticle(
        article, 
        article.category_name, 
        categoryDisplayName, 
        publication
      );
      console.log('Article Data:', {
        category_name: article.category_name,
        category_display_name: categoryDisplayName,
        publication: publication,
        publication_name: article.publication_name,
        isUrdu: currentArticleIsUrdu
      });
      setIsUrdu(currentArticleIsUrdu);
    }
  }, [article, categoryDisplayName, publication]);

  // Process article content to handle cover image
  const contentInfo = article ? processArticleContent(article.description, article.cover_image) : 
    { processedContent: '', hasOtherImages: false, coverImageInContent: false };

  const handleSubmitComment = async () => {
    if (!rating) {
      alert("Rating is required.");
      return;
    }
    if (!comment.trim()) {
      alert("Comment is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/create-comment/`, {
        comment,
        user: userId, // Replace with the actual user ID
        article: article?.id,
        rating,
      });
      setSuccessMessage("Comment and rating submitted successfully!");
      setComment("");
      setRating(0);
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isArticleLoading) return <Loader />;
  if (articleError) return <p>Error fetching article</p>;

  return (
    <div className={`w-full min-h-screen bg-white `}>
      {/* Main layout with sidebar starting from top */}
      <div className="flex flex-col lg:flex-row min-h-screen " dir={isUrdu ? 'rtl' : 'ltr'}>
        {/* Left Sidebar - 25% width on desktop, full width on mobile */}
        <div className="w-full lg:w-1/4 flex flex-col">
          {/* Profile and content section */}
          <div className="py-4 lg:py-6 flex-1 flex flex-col items-center px-4 lg:px-0">
            {/* Profile Image */}
            <div className="w-full max-w-[280px] h-[200px] sm:h-[250px] lg:h-[291px] overflow-hidden rounded-lg">
              <img
                src={`${import.meta.env.VITE_API_URL}/media/uploads/authors/${author?.author_image}`}
                alt="Author Profile"
                className="w-full h-full object-fit"
                onError={(e) => {
                  // fallback in case image fails to load
                  e.target.onerror = null;
                  e.target.src = hilalLogoImage;
                }}
              />
            </div>
            {/* Content container with responsive width */}
            <div className="w-full max-w-[280px] lg:w-[280px] mt-4 lg:mt-0">
              {/* Author Name */}
              <h2 className={`text-[#DF1600] font-extrabold text-[18px] sm:text-[20px] lg:text-[24px] leading-tight text-center mt-2 mb-2 break-words px-2 ${isUrdu ? 'font-urdu-nastaliq-sm' : 'font-poppins'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                {author?.author_name || "Author Name"}
              </h2>

              {/* Bio */}
              <p 
                className={`text-black mb-4 font-medium text-xs sm:text-sm leading-[150%] tracking-[-0.03em] px-2 text-justify ${isUrdu ? 'font-urdu-nastaliq-sm' : ''}`}
                dir={isUrdu ? 'rtl' : 'ltr'}
              >
                {author?.introduction || "No introduction available"}
              </p>

              {/* Contact */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 lg:mb-6 border-b-2 border-black pb-2 px-2">
                <EnvelopeIcon className="w-5 h-5 lg:w-6 lg:h-6 text-black flex-shrink-0" />
                <a
                  href={`mailto:${author?.email || "hello@website.com"}`}
                  className="text-black text-xs sm:text-sm italic hover:text-red-600 transition-colors text-center lg:text-left"
                >
                  {author?.email || "Email not available"}
                </a>
              </div>

              {/* Recent Articles */}
              <div className="px-2">
                <h3 className={`text-lg sm:text-xl font-extrabold text-black mb-3 uppercase text-center lg:text-left ${isUrdu ? 'font-urdu-nastaliq-sm lg:text-right' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                  {isUrdu ? 'حالیہ مضامین' : 'Recent Articles'}
                </h3>
                {isArticleLoading ? (
                  <Loader />
                ) : recentArticles.length === 0 ? (
                  <p className={`text-gray-500 text-sm text-center lg:text-left ${isUrdu ? 'font-urdu-nastaliq-sm lg:text-right' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                    {isUrdu ? 'کوئی حالیہ مضمون دستیاب نہیں' : 'No recent articles available'}
                  </p>
                ) : (
                  <ul className="space-y-2 lg:space-y-3">
                    {recentArticles.slice(0, 5).map((recentArticle) => (
                      <li key={recentArticle.id} className="flex items-start gap-2">
                        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-black flex items-center justify-center mt-1 flex-shrink-0">
                          <ExternalLink className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white" />
                        </div>
                        <Link
                          to={`/article/${recentArticle.id}`}
                          className={`font-light text-xs sm:text-sm leading-[150%] tracking-[-0.03em] capitalize ${isUrdu ? 'no-underline' : 'underline'} hover:text-red-600 transition-colors text-center lg:text-left ${isUrdu ? 'font-urdu-nastaliq-sm lg:text-right' : 'font-poppins'}`}
                          dir={isUrdu ? 'rtl' : 'ltr'}
                        >
                          {recentArticle.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area - 75% width on desktop, full width on mobile */}
        <div className="w-full lg:w-3/4 flex  flex-col">
          {/* Top header bar */}
          <div className="bg-white shadow-md mb-2  relative">
            {/* Title & Heading */}
            <div className="relative px-4 lg:px-6 pt-6 lg:pt-6 pb-4">
              {/* Title and Heading */}
              <div className={` font-light text-[16px] sm:text-[18px] lg:text-[32px] leading-[120%] tracking-[-0.03em] uppercase mb-3 lg:mb-2 text-center lg:text-left ${isUrdu ? 'font-urdu-nastaliq-sm  lg:text-right' : 'font-poppins'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                {categoryDisplayName || getCategoryDisplayName(article?.category_name)}
              </div>

              {/* Heading and Date Section */}
              <div className="space-y-2">
                {/* Article Title */}
                <h1 className={`text-black w-full font-medium ${isUrdu ? '' : 'line-clamp-3 lg:line-clamp-2'} text-[18px] sm:text-[20px] lg:text-[32px] ${isUrdu ? 'leading-[160%] lg:leading-[150%]' : 'leading-[120%] lg:leading-[110%]'} tracking-[-0.03em] uppercase text-center lg:text-left ${isUrdu ? 'font-urdu-nastaliq-sm lg:text-right' : 'font-poppins'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                  {article?.title || "Article Title"}
                </h1>

                {/* Date positioned below the title */}
                <div className={`flex ${isUrdu ? 'justify-start lg:justify-end' : 'justify-center lg:justify-start'}`}>
                  <span className="text-black font-poppins font-light text-[10px] sm:text-[12px] lg:text-[16px] leading-[100%] tracking-[-0.03em] uppercase">
                    {article?.publish_date ? new Date(article.publish_date).toLocaleDateString("en-GB") : "Publish Date"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 px-4 lg:px-6 relative border-l-[1px] border-black">
            <div className=" py-4 lg:py-6">
              {/* Only show cover image if there are other images in content OR cover image is not in content */}
              {/* {(contentInfo.hasOtherImages || !contentInfo.coverImageInContent) && (
                <img
                  src={article.article.cover_image}
                  alt="Article"
                  className="w-full h-[400px] mb-4 rounded-lg"
                />
              )} */}
              <div 
                dangerouslySetInnerHTML={{ __html: contentInfo.processedContent }} 
                className={`text-black text-sm sm:text-base [letter-spacing:-0.03em] capitalize text-justify ${isUrdu ? 'font-urdu-nastaliq-sm' : 'leading-relaxed'}`}
                dir={isUrdu ? 'rtl' : 'ltr'}
                style={isUrdu ? { lineHeight: '2.4' } : {}}
              />
                {/* Social Sharing Section */}
                <div className="mt-6 mb-6 flex flex-col items-center">
                  <p className="font-poppins font-semibold text-[14px] lg:text-[18px] mb-2 text-black">:Share this article</p>
                  <div className="flex gap-4 justify-center">
                    {/* Facebook */}
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" title="Share on Facebook" className="hover:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F3"><path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0"/></svg>
                    </a>
                    {/* X (Twitter) */}
                    <a href={`https://x.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(article?.title || '')}`} target="_blank" rel="noopener noreferrer" title="Share on X" className="hover:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    {/* WhatsApp */}
                    <a href={`https://wa.me/?text=${encodeURIComponent((article?.title || '') + '\n' + window.location.href)}`} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="hover:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.348.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                    </a>
                    {/* LinkedIn */}
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${encodeURIComponent(article?.title || '')}`} target="_blank" rel="noopener noreferrer" title="Share on LinkedIn" className="hover:scale-110 transition-transform">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#0077B5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.156 1.459-2.156 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.599 2.001 3.599 4.601v5.595z"/></svg>
                    </a>
                    {/* Copy Link */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      title="Copy Link"
                      className="hover:scale-110 transition-transform bg-gray-100 rounded-full p-1 cursor-pointer relative"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#333"><path d="M3.9,12.5c0,2.5,2,4.5,4.5,4.5h3c2.5,0,4.5-2,4.5-4.5s-2-4.5-4.5-4.5h-1c-0.6,0-1,0.4-1,1s0.4,1,1,1h1c1.4,0,2.5,1.1,2.5,2.5s-1.1,2.5-2.5,2.5h-3c-1.4,0-2.5-1.1-2.5-2.5c0-0.6-0.4-1-1-1S3.9,11.9,3.9,12.5z M8.4,13.5h-1c-0.6,0-1-0.4-1-1s0.4-1,1-1h1c0.6,0,1,0.4,1,1S9,13.5,8.4,13.5z"/></svg>
                      {copied && (
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-green-500 text-white text-xs rounded shadow">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>
              {isAuthorized == true && (
                <div className="mt-6 lg:mt-8" dir="ltr">
                  {/* Rate this article section */}
                  <div className="w-full flex justify-center mb-4">
                    <p className="font-poppins font-medium text-[12px] sm:text-[14px] lg:text-[16px] leading-[150%] tracking-[-0.03em] text-center capitalize text-black">
                      ( Rate This Article )
                    </p>
                  </div>
                  {/* Stars */}
                  <div className="flex justify-center mb-4 gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <svg
                        key={idx}
                        onClick={() => !isSubmitting && setRating(idx + 1)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-12 lg:h-12 transition-all duration-200 ${isSubmitting
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:scale-110'
                          } ${rating > idx ? "fill-yellow-500" : "fill-gray-300"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4-6.3-4.6-6.3 4.6 2.4-7.4-6.3-4.6h7.8z" />
                      </svg>
                    ))}
                  </div>
                  {/* Write a comment heading */}
                  <p className="font-poppins font-bold text-[12px] sm:text-[14px] lg:text-[16px] leading-[150%] tracking-[-0.03em] uppercase text-black text-center lg:text-left mb-4">
                    WRITE A COMMENT TO EXPRESS YOUR THOUGHTS
                  </p>
                  {/* Comment input */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    className={`border w-full h-[60px] sm:h-[80px] lg:h-[111px] p-2 text-sm transition-all duration-200 ${isSubmitting
                      ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'border-black bg-white hover:border-red-500 focus:border-red-500 focus:outline-none'
                      }`}
                    style={{
                      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                      textAlign: 'left',
                      direction: 'ltr'
                    }}
                    placeholder={isSubmitting ? "Submitting comment..." : "Write your comment here..."}
                  />
                  {/* Submit button */}
                  <button
                    onClick={handleSubmitComment}
                    disabled={isSubmitting}
                    className={`mt-4 px-4 py-2 rounded text-sm w-full sm:w-auto transition-all duration-200 ${isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                  {/* Success message */}
                  {successMessage && (
                    <p className="mt-4 text-green-600 font-medium text-center lg:text-left">{successMessage}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}