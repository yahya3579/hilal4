import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard5English = ({ article }) => {
    return (
        <>
            <div key={article.id} className="bg-white overflow-hidden">
                <Link to={`/article/${article.id}`}>
                    <img
                        src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                        alt={article.title || article.article_title}
                        loading="lazy"
                        className="h-[120px] w-full object-cover border-2 border-solid"
                        style={{ borderColor: '#df1600' }}
                    />
                </Link>
                <div className="py-3">
                    <p className="text-xs text-gray-400 mb-1">{article.author_name}</p>
                    <h4 className="text-xs font-semibold line-clamp-1 text-black leading-[1.8]">
                        {article.title || article.article_title}
                    </h4>
                    {/* Description (2 lines only) */}
                        <div className="text-xs text-gray-600 line-clamp-2 mt-2 mb-2">
                            {article.description?.replace(/<[^>]*>/g, '') || ''}
                        </div>
                    <Link
                        to={`/article/${article.id}`}
                        className="text-xs text-red-600 font-bold hover:underline"
                    >
                        Read More
                    </Link>
                </div>
            </div>
        </>
    )
}

export default CommonCard5English