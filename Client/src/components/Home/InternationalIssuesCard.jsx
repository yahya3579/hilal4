import { Link } from "react-router-dom";

export default function InternationIssuesCard({ article, isUrdu }) {
    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className={`flex flex-col md:flex-row bg-white shadow-sm overflow-hidden w-full max-w-full ${isUrdu ? 'md:flex-row-reverse' : ''}`}>
                {/* Left side - Image with overlay text */}
                <div className="relative w-full md:w-[40%] flex-shrink-0 font-poppins">
                    <Link to={`/article/${article.id}`} className="block w-full h-full">
                        <img
                            src={`${import.meta.env.VITE_API_URL}/media/uploads/articles/${article.cover_image}`}
                            alt={article.title}
                            className="w-full h-[200px] md:h-[266px] object-cover border-2 border-solid max-w-full"
                            style={{ borderColor: '#df1600' }}
                        />
                    </Link>
                </div>

                {/* Right side - Article content */}
                <div className={`flex-1 px-3 sm:px-4 py-2 flex flex-col justify-between min-w-0 overflow-hidden ${isUrdu ? '' : 'font-poppins'}`}>
                    <div className="min-w-0">
                        {/* Main headline */}
                        <Link to={`/article/${article.id}`} className="block">
                            <h1 className={`text-[20px] md:text-[24px] font-medium leading-[auto] tracking-[-0.03em] text-black text-justify break-words cursor-pointer hover:text-[#DF1600] transition-colors ${isUrdu ? ' font-urdu-nastaliq-sm' : ''}`}>
                                {article.title}
                            </h1>
                        </Link>

                        {/* Article description */}
                        <p
                            className={`text-[16px] md:text-[18px] mt-1 font-normal tracking-[-0.03em] line-clamp-4 text-black text-justify break-words
    ${isUrdu ? 'font-urdu-nastaliq-sm1 leading-[2.2]' : 'leading-snug font-poppins'}`}
                        >
                            {article.description?.replace(/<[^>]*>/g, '')}
                        </p>

                        <Link
                            to={`/article/${article.id}`}
                            className={`text-[14px] md:text-[16px] font-semibold leading-[auto] tracking-[-0.03em] text-black underline red-primary inline-block mt-2 ${isUrdu ? 'text-right font-urdu-nastaliq-sm1' : 'text-left'}`}
                        >
                            {isUrdu ? 'مزید پڑھیں' : 'READ MORE'}
                        </Link>
                    </div>

                    {/* Author byline */}
                    <div className="mt-2">
                        <p className={`text-[14px] md:text-[16px] font-semibold leading-[auto] tracking-[-0.03em] text-black break-words ${isUrdu ? 'text-right' : 'text-left'}`}>
                            {article.author_name}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
