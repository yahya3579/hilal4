import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            welcome: "Welcome to Hilal.gov.pk",
            contactUs: "Contact Us",
            home: "Home",
            // Admin Dashboard translations
            adminDashboard: "Admin Dashboard",
            editArticle: "EDIT ARTICLE",
            articleCover: "Article Cover",
            articleTitle: "Article Title",
            category: "Category",
            writer: "Writer",
            date: "Date",
            articleContent: "Article Content",
            uploadArticle: "Upload Article",
            uploading: "Uploading...",
            dragDropFiles: "Drag & drop files or ",
            browse: "Browse",
            supportedFormats: "Supported formats: PNG, JPG",
            selectCategory: "Select category",
            writeArticleHere: "Write article here",
            // Placeholders
            titlePlaceholder: "What we have given to Pakistan",
            writerPlaceholder: "Enter Writer name",
            datePlaceholder: "yyyy-mm-dd",
            // add all your keys here
        }
    },
    ur: {
        translation: {
            welcome: "ہلال ڈاٹ کام میں خوش آمدید",
            contactUs: "ہم سے رابطہ کریں",
            home: 'ہوم',
            // Admin Dashboard translations
            adminDashboard: "ایڈمن ڈیش بورڈ",
            editArticle: "مضمون میں تبدیلی",
            articleCover: "مضمون کا کور",
            articleTitle: "مضمون کا عنوان",
            category: "قسم",
            writer: "مصنف",
            date: "تاریخ",
            articleContent: "مضمون کا مواد",
            uploadArticle: "مضمون اپ لوڈ کریں",
            uploading: "اپ لوڈ ہو رہا ہے...",
            dragDropFiles: "فائلز کو ڈریگ اور ڈراپ کریں یا ",
            browse: "براؤز کریں",
            supportedFormats: "سپورٹ شدہ فارمیٹس: PNG, JPG",
            selectCategory: "قسم منتخب کریں",
            writeArticleHere: "یہاں مضمون لکھیں",
            // Placeholders
            titlePlaceholder: "ہم نے پاکستان کو کیا دیا ہے",
            writerPlaceholder: "مصنف کا نام درج کریں",
            datePlaceholder: "سال-مہینہ-دن",
            // add urdu translations here
        }
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        }
    });

export default i18n;
