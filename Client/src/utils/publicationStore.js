import { create } from 'zustand';

const usePublicationStore = create((set, get) => ({
    // Current publication data
    currentPublication: null,
    currentPublicationName: null,
    
    // Articles data for different sections
    trendingArticles: [],
    inFocusArticles: [],
    nationalNewsArticles: [],
    miscArticles: [],
    
    // Loading states
    loadingTrending: false,
    loadingInFocus: false,
    loadingNationalNews: false,
    loadingMisc: false,
    
    // Error states
    errorTrending: null,
    errorInFocus: null,
    errorNationalNews: null,
    errorMisc: null,
    
    // Actions
    setCurrentPublication: (publication) => set({ 
        currentPublication: publication,
        currentPublicationName: publication?.name || null
    }),
    
    setTrendingArticles: (articles) => set({ trendingArticles: articles }),
    setInFocusArticles: (articles) => set({ inFocusArticles: articles }),
    setNationalNewsArticles: (articles) => set({ nationalNewsArticles: articles }),
    setMiscArticles: (articles) => set({ miscArticles: articles }),
    
    setLoadingTrending: (loading) => set({ loadingTrending: loading }),
    setLoadingInFocus: (loading) => set({ loadingInFocus: loading }),
    setLoadingNationalNews: (loading) => set({ loadingNationalNews: loading }),
    setLoadingMisc: (loading) => set({ loadingMisc: loading }),
    
    setErrorTrending: (error) => set({ errorTrending: error }),
    setErrorInFocus: (error) => set({ errorInFocus: error }),
    setErrorNationalNews: (error) => set({ errorNationalNews: error }),
    setErrorMisc: (error) => set({ errorMisc: error }),
    
    // Clear all data when publication changes
    clearAllData: () => set({
        trendingArticles: [],
        inFocusArticles: [],
        nationalNewsArticles: [],
        miscArticles: [],
        loadingTrending: false,
        loadingInFocus: false,
        loadingNationalNews: false,
        loadingMisc: false,
        errorTrending: null,
        errorInFocus: null,
        errorNationalNews: null,
        errorMisc: null,
    }),
    
    // Get current month and year for API calls
    getCurrentMonthYear: () => {
        const now = new Date();
        return {
            month: now.getMonth() + 1, // JavaScript months are 0-indexed
            year: now.getFullYear()
        };
    }
}));

export default usePublicationStore;
