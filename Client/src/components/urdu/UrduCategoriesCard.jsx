import { Link } from "react-router-dom";

export default function UrduCategoriesCard({ article }) {
    return (
        <div className="mx-auto px-2 md:px-4">
            <div className="flex flex-col md:flex-row bg-white shadow-sm overflow-hidden">
                {/* Left side - Image with overlay text */}


                {/* Right side - Article content */}
                <div className="flex-1 px-2 py-2 flex flex-col justify-between font-poppins" dir="rtl">
                    <div>
                        {/* Main headline */}
                        <h1 className="text-[20px] md:text-[24px] font-medium leading-[auto] tracking-[-0.03em] text-black">
                            {article.title}
                        </h1>

                        {/* Article description */}
                        <p className="text-[16px] md:text-[18px] font-normal leading-[auto] tracking-[-0.03em] line-clamp-4 text-black">
                            {article.description}
                        </p>
                        <Link
                            to={`/article/${article.id}`}
                            className="text-[14px] md:text-[16px] font-semibold leading-[auto] tracking-[-0.03em] text-black underline red-primary"
                        >
                            READ MORE
                        </Link>
                    </div>

                    {/* Author byline */}
                    <div className="mt-2">
                        <p className="text-[14px] md:text-[16px] font-semibold leading-[auto] tracking-[-0.03em] text-black">
                            {article.author_name}
                        </p>
                    </div>
                </div>
                <div className="relative w-full md:w-[40%] h-[100%] font-poppins">
                    <Link to={`/article/${article.id}`}>
                        <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-full h-[200px] md:h-[266px] object-cover border-2 border-solid"
                            style={{ borderColor: '#df1600' }}
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}
