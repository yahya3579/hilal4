import React from 'react'
import { Link } from 'react-router-dom'

export const CommonCard2Urdu = ({ data }) => {
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
                            <span className="line-clamp-1 max-w-[70%]" dir='rtl'>{data[0].author_name}</span>
                            <span>{new Date(data[0].publish_date).toLocaleDateString("en-GB")}</span>
                        </div>
                        {/* <h3 className="text-[20px] font-bold line-clamp-1 text-gray-500 mb-2">{data[0].title}</h3> */}
                        <h3 className="text-[20px] font-bold  font-urdu-nastaliq-sm text-black mb-2 font-urdu-nastaliq-sm" dir='rtl'>{data[0].title}</h3>
                        <div className="text-xs text-black font-urdu-nastaliq-sm leading-loose font-bold line-clamp-5 mb-2" dir='rtl' style={{ lineHeight: '2' }}>
                            {data[0].description?.replace(/<[^>]*>/g, '') || ''}
                        </div>
                    </div>
                </div>
            </Link>

        </>
    )
}
