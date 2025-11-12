/**
 * Utility functions for filtering videos by language
 */

/**
 * Checks if a video is in English based on language field and content analysis
 * @param {Object} video - Video object with title, description, and language fields
 * @returns {boolean} - True if video is considered English
 */
export const isEnglishVideo = (video) => {
    if (!video) return false;
    
    const language = video.language?.toLowerCase();
    
    // If explicitly marked as English, include it
    if (language === 'english') {
        return true;
    }
    
    // If explicitly marked as Urdu, exclude it
    if (language === 'urdu') {
        return false;
    }
    
    // If no language is set, analyze the content
    if (!video.language) {
        const title = video.title || '';
        const description = video.description || '';
        
        // Check for Urdu/Arabic characters (Unicode ranges)
        // U+0600-U+06FF: Arabic
        // U+0750-U+077F: Arabic Supplement
        // U+08A0-U+08FF: Arabic Extended-A
        const urduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        
        // If title or description contains Urdu characters, exclude it
        if (urduRegex.test(title) || urduRegex.test(description)) {
            return false;
        }
        
        // Additional check for common Urdu words in English transliteration
        const urduWordsRegex = /\b(aur|mein|kay|ki|ko|se|par|hai|hain|tha|the|thi|main|apne|apna|apni|kya|kaise|kahan|kyun|jab|agar|lekin|phir)\b/i;
        
        if (urduWordsRegex.test(title) || urduWordsRegex.test(description)) {
            return false;
        }
        
        // If no Urdu indicators found, assume it's English
        return true;
    }
    
    // For any other language values, exclude
    return false;
};

/**
 * Filters an array of videos to include only English videos
 * @param {Array} videos - Array of video objects
 * @returns {Array} - Filtered array containing only English videos
 */
export const filterEnglishVideos = (videos) => {
    if (!Array.isArray(videos)) return [];
    
    const filtered = videos.filter(isEnglishVideo);
    
    console.log(`Video filtering: ${videos.length} total videos, ${filtered.length} English videos`);
    console.log('Filtered videos:', filtered.map(v => ({ 
        title: v.title, 
        language: v.language,
        isEnglish: isEnglishVideo(v)
    })));
    
    return filtered;
};

/**
 * Checks if a video is in Urdu based on language field and content analysis
 * @param {Object} video - Video object with title, description, and language fields
 * @returns {boolean} - True if video is considered Urdu
 */
export const isUrduVideo = (video) => {
    if (!video) return false;
    
    const language = video.language?.toLowerCase();
    
    // If explicitly marked as Urdu, include it
    if (language === 'urdu') {
        return true;
    }
    
    // If explicitly marked as English, exclude it
    if (language === 'english') {
        return false;
    }
    
    // If no language is set, analyze the content
    if (!video.language) {
        const title = video.title || '';
        const description = video.description || '';
        
        // Check for Urdu/Arabic characters
        const urduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        
        if (urduRegex.test(title) || urduRegex.test(description)) {
            return true;
        }
        
        // Check for common Urdu words in English transliteration
        const urduWordsRegex = /\b(aur|mein|kay|ki|ko|se|par|hai|hain|tha|the|thi|main|apne|apna|apni|kya|kaise|kahan|kyun|jab|agar|lekin|phir)\b/i;
        
        if (urduWordsRegex.test(title) || urduWordsRegex.test(description)) {
            return true;
        }
    }
    
    return false;
};
