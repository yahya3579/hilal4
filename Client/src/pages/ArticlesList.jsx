import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import InternationIssuesCard from '../components/Home/InternationalIssuesCard'
import Loader from '../components/Loader/loader'
import useAuthStore from '../utils/store'
import { fetchArticlesList } from '../utils/fetchArticlesList'

const ArticlesList = () => {
    const [searchParams] = useSearchParams()
    const [isUrdu, setIsUrdu] = useState(false)
    
    // Get data from store - ALL hooks must be called before any conditional returns
    const articlesList = useAuthStore((state) => state.articlesList)
    const loadingArticlesList = useAuthStore((state) => state.loadingArticlesList)
    const categories = useAuthStore((state) => state.categories)
    const publications = useAuthStore((state) => state.publications)
    
    // Get parameters from URL
    const categoryId = searchParams.get('category')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const publication = searchParams.get('publication')
    const magazine = searchParams.get('magazine')
    

    // Fetch articles when component mounts or params change
    useEffect(() => {
        if (categoryId || magazine || publication) {
            fetchArticlesList(categoryId, month, year, publication, magazine)
        }
    }, [categoryId, month, year, publication, magazine])

    // Update isUrdu state when category or publication changes
    useEffect(() => {
        if (categoryId && categories.length > 0) {
            const category = categories.find(cat => cat.id === parseInt(categoryId))
            if (category) {
                setIsUrdu(category.name.toLowerCase().includes('urdu'))
            }
        } else if (publication) {
            // If no category but we have publication, check if publication name contains 'urdu'
            setIsUrdu(publication.toLowerCase().includes('urdu'))
        }
    }, [categoryId, categories, publication])

    // Get current category and publication info for display
    const currentCategory = categories.find(cat => cat.id === parseInt(categoryId))
    const currentPublication = publications.find(pub => pub.name === publication)

    // Separate news articles from other articles
    // Only show articles with "Hilal News" author in the news section
    const newsArticles = articlesList?.filter(article => 
        article.category_name && 
        (article.category_name.toLowerCase() === 'news' || article.category_name.toLowerCase() === 'national-news' || article.category_name.toLowerCase().includes('news-')) &&
        article.author_name && 
        article.author_name.toLowerCase().includes('hilal news')
    ) || []
    
    const otherArticles = articlesList?.filter(article => 
        !newsArticles.some(newsArticle => newsArticle.id === article.id)
    ) || []

    // Conditional return AFTER all hooks have been called
    if (loadingArticlesList) return <Loader />

    return (
        <div className={`bg-white min-h-screen overflow-x-hidden max-w-full ${isUrdu ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            {(!articlesList || articlesList.length === 0) ? (
                <div className="text-gray-500 font-poppins flex justify-center items-center text-lg px-3 sm:px-6">
                    <span className="font-bold">
                        No articles found for {currentCategory?.display_name || currentPublication?.display_name || 'this publication'}
                    </span>
                </div>
            ) : (
                <>
                    <div className="px-3 sm:px-6 pt-3 sm:pt-4 max-w-full">
                        <h1 className={`text-lg sm:text-2xl font-medium uppercase tracking-tight text-[#DF1600] font-poppins mt-1 sm:mt-2 break-words ${isUrdu ? 'font-urdu-nastaliq-sm' : 'text-left'}`}>
                            {currentCategory?.display_name || currentPublication?.display_name || 'Articles'}
                        </h1>
                    </div>
                    
                    {/* News Articles Section */}
                    {newsArticles.length > 0 && (
                        <div className="px-3 sm:px-6 py-3 sm:py-4 max-w-full">
                            <div className="border-t-[3px] border-[#DF1600]">
                                <div className="py-2">
                                    <h2 className={`text-lg sm:text-xl font-semibold uppercase tracking-tight text-[#DF1600] font-poppins break-words ${isUrdu ? 'font-urdu-nastaliq-sm text-right' : 'text-left'}`}>
                                        {isUrdu ? 'خبریں' : 'NEWS'}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full py-4">
                                    {newsArticles.map((article) => (
                                        <InternationIssuesCard key={article.id} article={article} isUrdu={isUrdu} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Other Articles Section */}
                    {otherArticles.length > 0 && (
                        <div className="px-3 sm:px-6 py-3 sm:py-4 max-w-full">
                            <div className="border-t-[3px] border-[#DF1600]">
                                {newsArticles.length > 0 && (
                                    <div className="py-2">
                                        <h2 className={`text-lg sm:text-xl font-semibold uppercase tracking-tight text-[#DF1600] font-poppins break-words ${isUrdu ? 'font-urdu-nastaliq-sm text-right' : 'text-left'}`}>
                                            {isUrdu ? 'دیگر مضامین' : 'OTHER ARTICLES'}
                                        </h2>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full py-4">
                                    {otherArticles.map((article) => (
                                        <InternationIssuesCard key={article.id} article={article} isUrdu={isUrdu} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ArticlesList
