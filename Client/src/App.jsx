import SearchResults from "./pages/SearchResults";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Css from "./pages/Css";
import Dashboard from "./pages/admin/Management/Dashboard";
import CommentManagement from "./pages/admin/Management/CommentManagement";
import MagazineManagement from "./pages/admin/Management/MagazineManagement";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoutes from "./layouts/ProtectedRoutes";
import ArticlePage from "./pages/ArticlePage";
import AuthorsManagement from "./pages/admin/Management/AuthorsManagement";
import PackagesManagement from "./pages/admin/Management/PackagesManagement";
import ArticleManagement from "./pages/admin/Management/ArticlesManagement";
import VideosManagement from "./pages/admin/Management/VideosManagement";
import CreateVideo from "./pages/admin/Management/CreateVideo";

import EditArticle from "./pages/admin/Edit/EditArticle";
import EditAuthor from "./pages/admin/Edit/EditAuthor";
import EditBillBoard from "./pages/admin/Edit/EditBillBoard";
import EditMagazine from "./pages/admin/Edit/EditMagazine";
import EditPublication from "./pages/admin/Edit/EditPublication";
import EditCategory from "./pages/admin/Edit/EditCategory";
import PublicationsManagement from "./pages/admin/Management/PublicationsManagement";
import CategoriesManagement from "./pages/admin/Management/CategoriesManagement";



import EditVideo from "./pages/admin/Edit/EditVideo";
import HilalArchives from "./pages/HilalArchives";
import AboutUs from "./pages/AboutUs";
import HilalEbooks from "./pages/HilalEbooks";
import ArticlesList from "./pages/ArticlesList";
import Advertise from "./pages/Advertise";
import OurContributors from "./pages/OurContributors";
import Subscribe from "./pages/Subscribe";
import BillboardsManagement from "./pages/admin/Management/BillboardsManagement";
import PublicationPage from "./pages/PublicationPage";
import EbookManagement from "./pages/admin/Management/EbookManagement";
import EditEbook from "./pages/admin/Edit/EditEbook";
import MagazineArchive from "./pages/MagazineArchive";
import MonthArticles from "./pages/MonthArticles";
import MonthArticlesUrdu from "./pages/MonthArticlesUrdu";
import MonthArticlesKidsUrdu from "./pages/MonthArticlesKidsUrdu";
import MonthArticlesKids from "./pages/MonthArticlesKids";
import MonthArticlesHer from "./pages/MonthArticlesHer";
import { fetchPublications } from "./utils/fetchPublications";
import { fetchCategories } from "./utils/fetchCategories";
import { Navigate } from "react-router-dom";
import useAuthStore from "./utils/store";

const App = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  // Fetch publications and categories when the app starts
  useEffect(() => {
    initializeAuth(); // Initialize authentication from localStorage
    fetchPublications();
    fetchCategories();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Publications */}
        <Route path="/" element={<Navigate to="/hilal-english" replace />} />
        <Route path="/:publication" element={<PublicationPage />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/css" element={<Css />} />
        <Route path="/articlepage/:articleId" element={<ArticlePage />} />
        <Route path="/article/:articleId" element={<ArticlePage />} />
        <Route path="/archives" element={<HilalArchives />} />
        <Route path="/ebooks" element={<HilalEbooks />} />
        <Route path="/articles" element={<ArticlesList />} />
        {/* <Route path="/category/urdu/:category" element={<UrduCategoriesPage />} /> */}
        <Route path="/ourcontributors" element={<OurContributors />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/subscribe" element={<Subscribe />} />

        {/* Search Results Page */}
        <Route path="/search" element={<SearchResults />} />
        <Route path="/magazines" element={<MagazineArchive />} />
        <Route path="/month-articles/:monthYear" element={<MonthArticles />} />
        <Route path="/month-articles-urdu/:monthYear" element={<MonthArticlesUrdu />} />
        <Route path="/month-articles-kids-urdu/:monthYear" element={<MonthArticlesKidsUrdu />} />
        <Route path="/month-articles-kids/:monthYear" element={<MonthArticlesKids />} />
        <Route path="/month-articles-her/:monthYear" element={<MonthArticlesHer />} />
      </Route>

      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/login" element={<Login />} />

      {/* admin routes start*/}
      <Route element={
        <ProtectedRoutes><AdminLayout /></ProtectedRoutes>}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/bill-boards-management" element={<BillboardsManagement />} />
        <Route path="/admin/articles-management" element={<ArticleManagement />}
        />
        <Route path="/admin/magazine-management" element={<MagazineManagement />}
        />
        <Route path="/admin/comment-management" element={<CommentManagement />}
        />
        <Route path="/admin/packages-management" element={<PackagesManagement />}
        />
        <Route path="/admin/authors-management" element={<AuthorsManagement />}
        />
        <Route path="/admin/ebooks-management" element={<EbookManagement />}
        />
        <Route path="/admin/videos-management" element={<VideosManagement />}
        />
        <Route path="/admin/videos-management/create" element={<CreateVideo />}
        />
        <Route path="/admin/publications-management" element={<PublicationsManagement />}
        />
        <Route path="/admin/categories-management" element={<CategoriesManagement />}
        />
        <Route path="/admin/*" element={<NotFound />} />
      </Route>
      <Route path="/admin/new-article/:articleId" element={<ProtectedRoutes><EditArticle /></ProtectedRoutes>} />
      <Route path="/admin/edit-billboard/:billboardId" element={<ProtectedRoutes><EditBillBoard /></ProtectedRoutes>} />
      <Route path="/admin/edit-magazine/:magazineId" element={<ProtectedRoutes><EditMagazine /></ProtectedRoutes>} />
      <Route path="/admin/edit-author/:authorId" element={<ProtectedRoutes><EditAuthor /></ProtectedRoutes>} />
      <Route path="/admin/new-article" element={<ProtectedRoutes><EditArticle /></ProtectedRoutes>} />
      <Route path="/admin/edit-author" element={<ProtectedRoutes><EditAuthor /></ProtectedRoutes>} />
      <Route path="/admin/edit-billboard" element={<ProtectedRoutes><EditBillBoard /></ProtectedRoutes>} />
      <Route path="/admin/edit-magazine" element={<ProtectedRoutes><EditMagazine /></ProtectedRoutes>} />
      <Route path="/admin/edit-ebook" element={<ProtectedRoutes><EditEbook /></ProtectedRoutes>} />
      <Route path="/admin/edit-ebook/:ebookId" element={<ProtectedRoutes><EditEbook /></ProtectedRoutes>} />
      <Route path="/admin/videos-management/edit/:videoId" element={<ProtectedRoutes><EditVideo /></ProtectedRoutes>} />
      <Route path="/admin/publication/create" element={<ProtectedRoutes><EditPublication /></ProtectedRoutes>} />
      <Route path="/admin/publication/edit/:publicationId" element={<ProtectedRoutes><EditPublication /></ProtectedRoutes>} />
      <Route path="/admin/category/create" element={<ProtectedRoutes><EditCategory /></ProtectedRoutes>} />
      <Route path="/admin/category/edit/:categoryId" element={<ProtectedRoutes><EditCategory /></ProtectedRoutes>} />
      {/* admin routes end */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
