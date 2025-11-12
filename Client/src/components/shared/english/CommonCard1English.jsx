import { Link } from "react-router-dom"

export const CommonCard1English = ({ article }) => {
    return (
        <>

            <div key={article.id} className="bg-white overflow-hidden transition-shadow cursor-pointer">
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
                            className="absolute top-3 left-3 bg-red-500/85 text-white text-xs font-medium px-2 py-1 rounded max-w-[calc(100%-1.5rem)] break-words inline-block"
                            style={{ wordBreak: 'break-word', lineHeight: '1.3', zIndex: 9 }}
                        >
                            <span className="block">{article.category_display_name || 'Category'}</span>
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
                        <h3 className="text-xs font-semibold line-clamp-1 text-black leading-[1.8]">
                            {article.title}
                        </h3>
                    </Link>
                        {/* Description (2 lines only) */}
                        <div className="text-xs text-gray-600 line-clamp-2 mt-2 mb-2">
                            {article.description?.replace(/<[^>]*>/g, '') || ''}
                        </div>
                        <Link to={`/article/${article.id}`} className="text-red-600 text-xs font-bold hover:underline">Read More</Link>
                </div>
            </div>
        </>
    )
}