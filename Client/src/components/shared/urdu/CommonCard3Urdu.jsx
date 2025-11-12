import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard3Urdu = ({ article }) => {
    return (
        <>

            <div key={article.id} className="overflow-hidden">
                <Link to={`/article/${article.id}`}>
                    <img
                        src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                        alt={article.title}
                        loading="lazy"
                        className="h-[120px] object-cover w-full border-2 border-solid"
                        style={{ borderColor: '#df1600' }}
                    />
                </Link>
                <div className="py-2">
                    <p className="text-xs line-clamp-1 text-gray-400 mb-1" dir='rtl'>{article.author_name}</p>
                    <h4 className="text-xs font-urdu-nastaliq-sm font-semibold text-black leading-[1.8]" dir='rtl'>
                        {article.title}
                    </h4>
                    {/* Description (2 lines only) */}
                    <div className="text-xs text-gray-600 line-clamp-2 mt-2 mb-2 font-urdu-nastaliq-sm leading-loose" dir='rtl' style={{ lineHeight: '2' }}>
                        {article.description?.replace(/<[^>]*>/g, '') || ''}
                    </div>
                    <Link to={`/article/${article.id}`} className="text-xs font-urdu-nastaliq-sm text-red-600 font-bold hover:underline" dir='rtl'>
                        مزید پڑھیں
                    </Link>
                </div>
            </div>
        </>
    )
}

export default CommonCard3Urdu