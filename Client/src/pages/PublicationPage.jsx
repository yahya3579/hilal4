import React, { Suspense, lazy, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../utils/store";
import pdfPreviewImage from "../assets/pdf/aprilpdf.jpg";
import newsletterPdf from "../assets/pdf/17d63b1625c816c22647a73e1482372b.pdf";

// Component mapping for different publications
const componentMappings = {
    // Home (Hilal English)
    'hilal-english': {
        TrendingPublications: lazy(() => import("../components/shared/TrendingPublications")),
        ArmedForcesNews: lazy(() => import("../components/Home/ArmedForcesNews")),
        HilalDigitalGrid: lazy(() => import("../components/shared/HilalDigitalGrid")),
        InFocusSection: lazy(() => import("../components/shared/InFocus")),
        NationalNewsSection: lazy(() => import("../components/shared/NationalNews")),
        MiscSection: lazy(() => import("../components/shared/Misc")),
        NewsLetter: lazy(() => import("../components/Home/NewsLetter")),
        Advertisement2: lazy(() => import("../components/Home/Advertisement2")),
        Advertisement1: lazy(() => import("../components/Home/Advertisement1")),
        Advertisement4: lazy(() => import("../components/Home/Advertisement4")),
        HilalDigitalList: lazy(() => import("../components/shared/HilalDigitalList")),
        PreviousMonth: lazy(() => import("../components/shared/PreviousMonth")),
        ReaderOpinion: lazy(() => import("../components/shared/ReaderOpinion")),
    },
    // Hilal Urdu
    'hilal-urdu': {
        TrendingPublications: lazy(() => import("../components/shared/TrendingPublications")),
        ArmedForcesNews: lazy(() => import("../components/urdu/ArmedForcesNewsUrdu")),
        HilalDigitalGrid: lazy(() => import("../components/shared/HilalDigitalGrid")),
        NewsLetter: lazy(() => import("../components/urdu/NewsLetterUrdu")),
        InFocusSection: lazy(() => import("../components/shared/InFocus")),
        NationalNewsSection: lazy(() => import("../components/shared/NationalNews")),
        MiscSection: lazy(() => import("../components/shared/Misc")),
        Advertisement2: lazy(() => import("../components/urdu/Advertisment2Urdu")),
        Advertisement1: lazy(() => import("../components/Home/Advertisement1")),
        Advertisement4: lazy(() => import("../components/Home/Advertisement4")),
        HilalDigitalList: lazy(() => import("../components/shared/HilalDigitalList")),
        PreviousMonth: lazy(() => import("../components/shared/PreviousMonth")),
        ReaderOpinion: lazy(() => import("../components/shared/ReaderOpinion")),
    },
    // Hilal Kids English
    'hilal-english-kids': {
        TrendingPublications: lazy(() => import("../components/shared/TrendingPublications")),
        ArmedForcesNews: lazy(() => import("../components/Home/ArmedForcesNews")),
        HilalDigitalGrid: lazy(() => import("../components/shared/HilalDigitalGrid")),
        InFocusSection: lazy(() => import("../components/shared/InFocus")),
        NationalNewsSection: lazy(() => import("../components/shared/NationalNews")),
        NewsLetter: lazy(() => import("../components/Home/NewsLetter")),
        Advertisement2: lazy(() => import("../components/Home/Advertisement2")),
        Advertisement1: lazy(() => import("../components/Home/Advertisement1")),
        Advertisement4: lazy(() => import("../components/Home/Advertisement4")),
        HilalDigitalList: lazy(() => import("../components/shared/HilalDigitalList")),
        PreviousMonth: lazy(() => import("../components/shared/PreviousMonth")),
        ReaderOpinion: lazy(() => import("../components/shared/ReaderOpinion")),
    },
    // Hilal Kids Urdu
    'hilal-urdu-kids': {
        TrendingPublications: lazy(() => import("../components/shared/TrendingPublications")),
        ArmedForcesNews: lazy(() => import("../components/urdu/ArmedForcesNewsUrdu")),
        HilalDigitalGrid: lazy(() => import("../components/shared/HilalDigitalGrid")),
        NewsLetter: lazy(() => import("../components/urdu/NewsLetterUrdu")),
        NationalNewsSection: lazy(() => import("../components/shared/NationalNews")),
        InFocusSection: lazy(() => import("../components/shared/InFocus")),
        MiscSection: lazy(() => import("../components/shared/Misc")),
        Advertisement2: lazy(() => import("../components/urdu/Advertisment2Urdu")),
        Advertisement1: lazy(() => import("../components/Home/Advertisement1")),
        Advertisement4: lazy(() => import("../components/Home/Advertisement4")),
        HilalDigitalList: lazy(() => import("../components/shared/HilalDigitalList")),
        PreviousMonth: lazy(() => import("../components/shared/PreviousMonth")),
        ReaderOpinion: lazy(() => import("../components/shared/ReaderOpinion")),
    },
    // Hilal Her
    'hilal-her': {
        TrendingPublications: lazy(() => import("../components/shared/TrendingPublications")),
        ArmedForcesNews: lazy(() => import("../components/Home/ArmedForcesNews")),
        HilalDigitalGrid: lazy(() => import("../components/shared/HilalDigitalGrid")),
        InFocusSection: lazy(() => import("../components/shared/InFocus")),
        NationalNewsSection: lazy(() => import("../components/shared/NationalNews")),
        NewsLetter: lazy(() => import("../components/Home/NewsLetter")),
        Advertisement2: lazy(() => import("../components/Home/Advertisement2")),
        Advertisement1: lazy(() => import("../components/Home/Advertisement1")),
        Advertisement4: lazy(() => import("../components/Home/Advertisement4")),
        HilalDigitalList: lazy(() => import("../components/shared/HilalDigitalList")),
        PreviousMonth: lazy(() => import("../components/shared/PreviousMonth")),
        ReaderOpinion: lazy(() => import("../components/shared/ReaderOpinion")),
    },
};

// Loading skeleton component
const ComponentSkeleton = ({ height = "h-48", width = "w-full" }) => (
    <div className={`${width} ${height} bg-gray-200 animate-pulse rounded-lg mb-4`}>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
    </div>
);

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const [targetRef, setTargetRef] = useState(null);

    useEffect(() => {
        if (!targetRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(targetRef);
        return () => observer.disconnect();
    }, [targetRef, threshold]);

    return [setTargetRef, isVisible];
};

const PublicationPage = () => {
    const { publication: publicationParam } = useParams();

    // Get the publication type from the URL parameter
    // Map URL parameter to component mapping key
    const publicationMapping = {
        'hilal-english': 'hilal-english',
        'hilal-urdu': 'hilal-urdu',
        'hilal-english-kids': 'hilal-english-kids',
        'hilal-urdu-kids': 'hilal-urdu-kids',
        'hilal-her': 'hilal-her'
    };

    // Get publications from store to map name (URL-friendly) to publication name
    const publications = useAuthStore.getState().publications;
    const publicationObj = publications.find(pub => pub.name === publicationParam);
    const publicationName = publicationObj ? publicationObj.name : 'hilal-english';

    const publication = publicationMapping[publicationParam] || 'home';

    // Get the component mapping for the current publication
    const components = componentMappings[publication] || componentMappings.home;

    // Intersection observers for lazy loading
    const [topRef, topVisible] = useIntersectionObserver(0.1);
    const [middleRef, middleVisible] = useIntersectionObserver(0.1);
    const [bottomRef, bottomVisible] = useIntersectionObserver(0.1);

    return (
        <>
            <div className="flex lg:flex-row flex-col">
                {/* LEFT COLUMN - Main content with articles and videos */}
                <div style={{ scrollbarWidth: "none" }} className="lg:w-[70%]">
                    <div className="flex lg:flex-row flex-col">
                        <div className="lg:w-3/4">
                            <Suspense fallback={<ComponentSkeleton height="h-64" />}>
                                <components.TrendingPublications 
                                    publicationName={publicationName}
                                    isUrdu={publicationParam?.includes('urdu') || false}
                                />
                            </Suspense>
                        </div>
                        <div className="lg:w-1/4">
                            <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                                <components.HilalDigitalList 
                                    language={publicationParam?.includes('urdu') ? 'urdu' : 'english'}
                                    maxVideos={3}
                                />
                            </Suspense>
                        </div>
                    </div>

                    {/* Conditional sections based on publication type */}
                    {components.InFocusSection && (
                        <Suspense fallback={<ComponentSkeleton height="h-56" />}>
                            <components.InFocusSection 
                                publicationName={publicationName}
                                isUrdu={publicationParam?.includes('urdu') || false}
                            />
                        </Suspense>
                    )}

                    {components.NationalNewsSection && (
                        <Suspense fallback={<ComponentSkeleton height="h-64" />}>
                            <components.NationalNewsSection 
                                publicationName={publicationName}
                                isUrdu={publicationParam?.includes('urdu') || false}
                            />
                        </Suspense>
                    )}

                    {/* {components.MiscSection && (
                        <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                            <components.MiscSection 
                                publicationName={publicationName}
                                isUrdu={publicationParam?.includes('urdu') || false}
                            />
                        </Suspense>
                    )} */}
                </div>

                {/* RIGHT COLUMN - Sidebar with ads and news */}
                <div className="lg:w-[30%] relative">
                    <div ref={topRef}>
                        <Suspense fallback={<ComponentSkeleton height="h-64" />}>
                            <components.ArmedForcesNews />
                        </Suspense>
                    </div>

                    <div ref={middleRef}>
                        {middleVisible && (
                            <>
                                {/* {topVisible && (
                                    <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                                        <components.Advertisement1 />
                                    </Suspense>
                                )} */}

                                {/* <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                                    <components.Advertisement2 />
                                </Suspense> */}

                            </>
                        )}
                    </div>

                    <div ref={bottomRef}>
                        {/* {bottomVisible && (
                            <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                                <components.Advertisement4 />
                            </Suspense>
                        )} */}

                        {components.NewsLetter && (
                            <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                                <components.NewsLetter />
                            </Suspense>
                        )}

                        <div className="mt-6 px-4">
                            <a
                                href={newsletterPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <img
                                    src={pdfPreviewImage}
                                    alt="Download latest newsletter"
                                    className="w-full h-80 object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
                                />``
                                <span className="mt-3 inline-flex items-center justify-center w-full px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-md shadow hover:bg-red-700 transition-colors duration-200">
                                    View / Download PDF
                                </span>
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            <div className="lg:w-[100%]">
                <Suspense fallback={<ComponentSkeleton height="h-48" />}>
                    <components.HilalDigitalGrid 
                        language={publicationParam?.includes('urdu') ? 'urdu' : 'english'}
                    />
                </Suspense>
                <div className="relative flex lg:flex-row flex-col">
                    <div className="lg:w-[70%]">

                        <Suspense fallback={<ComponentSkeleton height="h-48 lg:w-[70%]" />}>
                            <components.PreviousMonth 
                                publicationName={publicationName}
                                isUrdu={publicationParam?.includes('urdu') || false}
                            />
                        </Suspense>
                    </div>
                    <div className="lg:w-[30%]">
                        <Suspense fallback={<ComponentSkeleton height="h-48 lg:w-[30%]" />}>
                            <components.ReaderOpinion
                                isUrdu={publicationParam?.includes('urdu') || false}
                                showAdSliders={publicationParam?.includes('urdu') || false}
                                queryKeyPrefix={publicationParam?.includes('urdu') ? 'billboards-urdu' : 'billboards'}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PublicationPage;
