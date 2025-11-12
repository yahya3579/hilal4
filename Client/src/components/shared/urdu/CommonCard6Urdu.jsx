import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard6Urdu = ({ article }) => {
    return (
        <>

            <Link to={`/article/${article.id}`} key={article.id} className="bg-white flex gap-x-3 overflow-hidden" dir='rtl'>
                <img
                    src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                    alt={article.title}
                    loading="lazy"
                        className="min-w-[150px] h-[60px] object-cover border-2 border-solid"
                    style={{ borderColor: '#df1600' }}
                />
                <div>
                    <p className="text-xs text-gray-400 font-urdu-nastaliq-sm mb-1" dir='rtl'>{article.author_name}</p>
                    <h4 className="text-xs font-semibold font-urdu-nastaliq-sm  text-black leading-[1.8]" dir='rtl'>
                        {/* {article.title} */}
                        {article.title}
                    </h4>
                </div>
            </Link>
        </>
    )
}

export default CommonCard6Urdu