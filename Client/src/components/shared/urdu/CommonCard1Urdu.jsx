import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard1Urdu = ({ article, publicationName }) => {
    // Determine badge text based on publication
    const getBadgeText = () => {
        if (publicationName) {
            const normalizedName = publicationName.toLowerCase().replace(/\s+/g, '-');
            if (normalizedName === "hilal-urdu-kids") {
                return "ہلال بچوں کے لیے";
            }
        }
        return article.category_display_name || 'Category';
    };

    const badgeText = getBadgeText();

    return (
        <>
            <div key={article.id} className="  transition-shadow cursor-pointer">
                {/* Image Section */}
                <Link to={`/article/${article.id}`}>
                    <div
                        className={`h-40 relative overflow-hidden border-2 border-solid`}
                        style={{
                            backgroundImage: `url(${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderColor: '#df1600'
                        }}
                    >
                        {/* Category Badge */}
                        <Link
                            to={`/category/${article.category_name || 'unknown'}`}
                            className="absolute top-3 left-3 bg-red-500/80 text-white text-xs font-urdu-nastaliq-sm font-medium px-2 py-1 rounded"
                            style={{ zIndex: 9 }}
                        >
                            {badgeText}
                        </Link>
                    </div>
                </Link>
                {/* Content Section */}
                <div className="p-4">
                    {/* Author and Date */}
                    <div className="text-xs text-gray-400 mb-1">
                        <span className="font-medium mr-2">{article.author_name}</span>
                        <span>{new Date(article.publish_date).toLocaleDateString("en-GB")}</span>
                    </div>
                    {/* Title */}
                    <Link to={`/article/${article.id}`}>
                        <h3 className="text-xs font-urdu-nastaliq-sm font-semibold  text-black h-max " dir='rtl'>
                            {/* {article.title} */}
                            {article.title}
                        </h3>
                    </Link>
                    {/* Description (2 lines only) */}
                        <div className="text-xs text-gray-600 line-clamp-2 mt-2 mb-2 font-urdu-nastaliq-sm leading-loose" dir='rtl' style={{ lineHeight: '2' }}>
                            {article.description?.replace(/<[^>]*>/g, '') || ''}
                        </div>
                </div>
            </div>
        </>
    )
}

export default CommonCard1Urdu