import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "../components/Loader/loader";
import { getEbookCoverUrl, getEbookDocumentUrl } from "../utils/localUpload";

const fetchActiveEbooks = async () => {
    try {
        const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/ebooks/active/`
        );
        console.log("API Response:", res.data); // Debugging log
        return res.data?.data || []; // Ensure it always returns an array even if data is undefined
    } catch (error) {
        console.error("Error fetching active ebooks:", error); // Log the error
        return []; // Return an empty array in case of an error
    }
};

const stripHtmlTags = (text = "") => text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const HilalEbooks = () => {

    const { data: ebookData = [], isLoading: isLoadingEbooks, error: ebookError } = useQuery({
        queryKey: ["activeEbooks"],
        queryFn: fetchActiveEbooks,
    });

    if (isLoadingEbooks) return <Loader />;
    if (ebookError) return <p>Error fetching archives</p>;

    return (

        <>


            <div className="bg-white min-h-screen">
                {/* Header */}

                {ebookData.length === 0 ? (
                    <p className="text-center text-gray-500 font-poppins text-lg col-span-full">
                        No E-Books  found
                    </p>
                ) : (
                    <>

                        <div className="px-3 sm:px-6 pt-3 sm:pt-4">
                            <h1 className="text-lg sm:text-2xl font-medium uppercase tracking-tight text-[#DF1600] font-[Poppins] mt-1 sm:mt-2">
                                E-books
                            </h1>
                        </div>

                        {/* Grid + Red Line */}
                        <div className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                                {/* Red Line */}
                                <div className="col-span-full border-t-[3px] border-[#DF1600] mb-1 sm:mb-2" />

                                {/* Archive Items */}
                                {ebookData.map((issue) => (
                                    <a
                                        key={issue.id}
                                        href={getEbookDocumentUrl(issue.doc_url) || issue.doc_url} // Link to the PDF
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="border border-gray-200 shadow-sm bg-white overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
                                    >
                                        <div className=" bg-white overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer">
                                            <div className="relative">
                                                <img
                                                    src={getEbookCoverUrl(issue.cover_image) || issue.cover_image}
                                                    alt={issue.title}
                                                    className="w-full aspect-[3/4] object-cover"
                                                />
                                            </div>
                                            <div className="p-1.5 sm:p-2">
                                                <h3 className="text-xs sm:text-sm font-medium text-gray-800 text-center leading-tight">
                                                    {issue.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 text-center mt-0.5">
                                                    ({issue.publish_date})
                                                </p>
                                                {issue.description && (
                                                    <p
                                                        className="text-[11px] sm:text-xs text-gray-600 mt-1 sm:mt-1.5 text-center"
                                                        style={{
                                                            display: "-webkit-box",
                                                            WebkitBoxOrient: "vertical",
                                                            WebkitLineClamp: 3,
                                                            overflow: "hidden"
                                                        }}
                                                    >
                                                        {stripHtmlTags(issue.description)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                    </a>
                                ))
                                }
                            </div>
                        </div>
                    </>

                )}
            </div>
        </>

    );
};

export default HilalEbooks;