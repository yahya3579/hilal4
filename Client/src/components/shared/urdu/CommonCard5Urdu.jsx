import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard5Urdu = ({ article }) => {
    return (
        <>
            <div key={article.id} className="bg-white overflow-hidden">
                <Link to={`/article/${article.id}`}>
                    <img
                        src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                        alt={article.title}
                        loading="lazy"
                        className="h-[120px] w-full object-cover border-2 border-solid"
                        style={{ borderColor: '#df1600' }}
                    />
                </Link>
                <div className="py-3">
                    <p className="text-xs text-gray-400 mb-1" dir='rtl'>{article.author_name}</p>
                    <h4 className="text-xs font-semibold font-urdu-nastaliq-sm  text-black leading-[1.8]" dir='rtl'>
                        {/* {article.title} */}
                        {article.title}
                    </h4>
                    {/* Description (2 lines only) */}
                    <div className="text-xs text-gray-600 font-urdu-nastaliq-sm line-clamp-2 mt-2 mb-2" dir='rtl'>
                        {article.description?.replace(/<[^>]*>/g, '') || ''}
                    </div>
                    <Link
                        to={`/article/${article.id}`}
                        className="text-xs text-red-600 font-urdu-nastaliq-sm font-bold hover:underline" dir='rtl'
                    >
                        مزید پڑھیں
                    </Link>
                </div>
            </div>
        </>
    )
}

export default CommonCard5Urdu