// Utility functions for date filtering

/**
 * Filters articles to show only those from the current month and year
 * @param {Array} articles - Array of article objects
 * @param {string} dateField - The field name containing the date (default: 'publish_date')
 * @returns {Array} Filtered articles from current month
 */
export const filterCurrentMonthArticles = (articles, dateField = 'publish_date') => {
  if (!articles || !Array.isArray(articles)) return [];
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();
  
  return articles.filter(article => {
    if (!article[dateField]) return false;
    
    const articleDate = new Date(article[dateField]);
    
    // Check if article date is valid
    if (isNaN(articleDate.getTime())) return false;
    
    return (
      articleDate.getMonth() === currentMonth &&
      articleDate.getFullYear() === currentYear
    );
  });
};

/**
 * Filters articles to show only those from a specific month and year
 * @param {Array} articles - Array of article objects
 * @param {number} month - Month (0-11, where 0 = January)
 * @param {number} year - Year (e.g., 2024)
 * @param {string} dateField - The field name containing the date
 * @returns {Array} Filtered articles from specified month
 */
export const filterArticlesByMonth = (articles, month, year, dateField = 'publish_date') => {
  if (!articles || !Array.isArray(articles)) return [];
  
  return articles.filter(article => {
    if (!article[dateField]) return false;
    
    const articleDate = new Date(article[dateField]);
    
    // Check if article date is valid
    if (isNaN(articleDate.getTime())) return false;
    
    return (
      articleDate.getMonth() === month &&
      articleDate.getFullYear() === year
    );
  });
};

/**
 * Gets the current month name
 * @returns {string} Current month name (e.g., "January")
 */
export const getCurrentMonthName = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[new Date().getMonth()];
};

/**
 * Gets formatted current month and year
 * @returns {string} Formatted string (e.g., "January 2024")
 */
export const getCurrentMonthYear = () => {
  // Temporary override to display April 2025
  return 'April 2025';
};

/**
 * Gets the current month name in Urdu
 * @returns {string} Current month name in Urdu (e.g., "جنوری")
 */
export const getCurrentMonthNameUrdu = () => {
  const monthsUrdu = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
  ];
  return monthsUrdu[new Date().getMonth()];
};

/**
 * Gets formatted current month and year in Urdu
 * @returns {string} Formatted string in Urdu (e.g., "اکتوبر 2025")
 */
export const getCurrentMonthYearUrdu = () => {
  // Temporary override to display April 2025 in Urdu
  return 'اپریل 2025';
};
