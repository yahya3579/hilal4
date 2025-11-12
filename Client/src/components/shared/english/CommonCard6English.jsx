import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard6English = ({ article }) => {
    return (
        <>

            <Link to={`/article/${article.id}`} key={article.id} className="bg-white flex gap-x-3 overflow-hidden">
                <img
                    src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                    alt={article.title}
                    loading="lazy"
                    className="min-w-[150px] h-[60px] object-cover border-2 border-solid"
                    style={{ borderColor: '#df1600' }}
                />
                <div>
                    <p className="text-xs text-gray-400 mb-1">{article.author_name}</p>
                    <h4 className="text-xs font-semibold line-clamp-2 text-black leading-[1.8]">
                        {article.title}
                    </h4>
                </div>
            </Link>

        </>
    )
}

export default CommonCard6English