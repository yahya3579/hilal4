import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard8Urdu = ({ article }) => {
    return (
        <>

            <Link to={`/article/${article.id}`} key={article.id} className='flex items-start gap-2 hover:bg-gray-50 rounded cursor-pointer outline-none' dir='rtl'>
                <img
                    src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                    alt={article.title}
                    className="w-16 h-10 object-cover  flex-shrink-0 outline-none border-2 border-solid"
                    style={{ borderColor: '#df1600' }}
                />
                <p className="text-black text-xs font-urdu-nastaliq-sm outline-none font-bold" dir='rtl'>
                    {/* {article.title} */}
                    {article.title}
                </p>
            </Link>
        </>
    )
}

export default CommonCard8Urdu