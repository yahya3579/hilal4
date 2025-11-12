import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // assuming you're using react-router

const Header = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
                <Link to="/" className="text-2xl font-bold">
                    Hilal.gov.pk
                </Link>

                <nav className="space-x-6 hidden md:flex">
                    <Link to="/" className="hover:underline">
                        {t("home") || "Home"}
                    </Link>
                    <Link to="/about" className="hover:underline">
                        {t("about") || "About"}
                    </Link>
                    <Link to="/contact" className="hover:underline">
                        {t("contactUs") || "Contact"}
                    </Link>
                </nav>

                <div className="space-x-2">
                    <button
                        onClick={() => changeLanguage("en")}
                        className={`px-3 py-1 rounded ${i18n.language === "en" ? "bg-white text-blue-600" : "hover:bg-blue-500"}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => changeLanguage("ur")}
                        className={`px-3 py-1 rounded ${i18n.language === "ur" ? "bg-white text-blue-600" : "hover:bg-blue-500"}`}
                    >
                        اردو
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
