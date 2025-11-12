import React from 'react'
import { Link } from 'react-router-dom'

const CommonCard2English = ({ data }) => {
    return (
        <>
            <Link to={`/article/${data[0].id}`}>
                <div className="bg-white overflow-hidden">
                    <img
                        src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${data[0].cover_image}`}
                        alt={data[0].title}
                        className="w-full h-[300px] object-cover border-2 border-solid"
                        style={{ borderColor: '#df1600' }}
                    />
                    <div className="py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <span className="line-clamp-1 max-w-[70%]">{data[0].author_name}</span>
                            <span>{new Date(data[0].publish_date).toLocaleDateString("en-GB")}</span>
                        </div>
                        <h3 className="text-[20px] font-bold line-clamp-1 text-black mb-2">{data[0].title}</h3>
                        <div className="text-xs text-gray-600 leading-relaxed line-clamp-5 mb-2">
                            {data[0].description?.replace(/<[^>]*>/g, '') || ''}
                        </div>
                    </div>
                </div>
            </Link>
        </>
    )
}

export default CommonCard2English