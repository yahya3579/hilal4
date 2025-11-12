import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard4English = ({ article }) => {
    return (
        <>
            <Link to={`/article/${article.id}`} className="block">
                <div key={article.id} className="relative h-[250px] overflow-hidden cursor-pointer">
                    <img
                        src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                        alt={article.title || article.article_title}
                        className="w-full h-full object-cover border-2 border-solid"
                        style={{ borderColor: '#df1600' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-2 left-4 right-4 text-white">
                        <p className="text-xs mb-2">{article.author_name}</p>
                        <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2">{article.title || article.article_title}</h3>
                        <span className="text-xs text-red-600 font-bold hover:underline">
                            Read More
                        </span>
                    </div>
                </div>
            </Link>
        </>
    )
}

export default CommonCard4English