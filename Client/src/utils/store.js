import { create } from 'zustand';

const useAuthStore = create((set) => ({
    accessToken: null,
    userId: null,
    refreshToken: null,
    userRole: null,
    isAuthorized: null,
    authTrigger: 0,
    section: "hilal-english",
    language: 'en',
    isRTL: false,
    publications: [],
    loadingPublications: false,
    categories: [],
    loadingCategories: false,
    articlesList: [],
    loadingArticlesList: false,
    currentCategoryId: null,
    currentPublication: null,
    currentCategory: null,
    setIsAuthorized: (status) => set({ isAuthorized: status }),
    setAccessToken: (token) => {
        set({ accessToken: token });
        if (token) {
            localStorage.setItem('access', token);
        } else {
            localStorage.removeItem('access');
        }
    },
    setRefreshToken: (token) => {
        set({ refreshToken: token });
        if (token) {
            localStorage.setItem('refresh', token);
        } else {
            localStorage.removeItem('refresh');
        }
    },
    setUserRole: (role) => {
        set({ userRole: role });
        if (role) {
            localStorage.setItem('userRole', role);
        } else {
            localStorage.removeItem('userRole');
        }
    },
    setCurrentSection: (section) => set({ currentSection: section }),
    setUserId: (id) => {
        set({ userId: id });
        if (id) {
            localStorage.setItem('userId', id.toString());
        } else {
            localStorage.removeItem('userId');
        }
    },
    setLanguage: (lang) => set({ language: lang, isRTL: lang === 'ur' }),
    setPublications: (publications) => set({ publications }),
    setLoadingPublications: (loading) => set({ loadingPublications: loading }),
    setCategories: (categories) => set({ categories }),
    setLoadingCategories: (loading) => set({ loadingCategories: loading }),
    setArticlesList: (articles) => set({ articlesList: articles }),
    setLoadingArticlesList: (loading) => set({ loadingArticlesList: loading }),
    setCurrentCategoryId: (categoryId) => set({ currentCategoryId: categoryId }),
    setCurrentPublication: (publication) => set({ currentPublication: publication }),
    setCurrentCategory: (category) => set({ currentCategory: category }),
    clearTokens: () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        set({ accessToken: null, refreshToken: null, userRole: null, userId: null, isAuthorized: false });
    },
    initializeAuth: () => {
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');
        const userRole = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');
        
        if (accessToken && refreshToken && userRole && userId) {
            set({ 
                accessToken, 
                refreshToken, 
                userRole, 
                userId: parseInt(userId), 
                isAuthorized: true 
            });
        }
    },
    triggerAuth: () => set((state) => ({ authTrigger: state.authTrigger + 1 })), // increment to trigger
}));

export default useAuthStore;

