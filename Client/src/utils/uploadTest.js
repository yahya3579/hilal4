// utils/uploadTest.js
// Test file to demonstrate the new upload system

import { uploadArticleImage, uploadAuthorImage, uploadMagazineImage, getFileUrl } from './localUpload';

// Example usage of the new upload system
export const testUploadSystem = async () => {
    console.log('Testing new file upload system...');
    
    // Example 1: Article image upload
    const mockArticleFile = new File(['article content'], 'article.jpg', { type: 'image/jpeg' });
    try {
        const articlePath = await uploadArticleImage(mockArticleFile, '123');
        console.log('Article image path:', articlePath);
        console.log('Article image URL:', getFileUrl(articlePath, 'articles'));
    } catch (error) {
        console.error('Article upload error:', error);
    }
    
    // Example 2: Author image upload
    const mockAuthorFile = new File(['author content'], 'author.jpg', { type: 'image/jpeg' });
    try {
        const authorPath = await uploadAuthorImage(mockAuthorFile, '456');
        console.log('Author image path:', authorPath);
        console.log('Author image URL:', getFileUrl(authorPath, 'authors'));
    } catch (error) {
        console.error('Author upload error:', error);
    }
    
    // Example 3: Magazine image upload
    const mockMagazineFile = new File(['magazine content'], 'magazine.jpg', { type: 'image/jpeg' });
    try {
        const magazinePath = await uploadMagazineImage(mockMagazineFile, '789');
        console.log('Magazine image path:', magazinePath);
        console.log('Magazine image URL:', getFileUrl(magazinePath, 'magazines'));
    } catch (error) {
        console.error('Magazine upload error:', error);
    }
    
    console.log('Upload system test completed!');
};

// Example of how filenames are stored in database
export const exampleDatabaseStorage = {
    articles: [
        {
            id: 123,
            title: "Sample Article",
            cover_image: "123.jpg", // This is what gets stored in DB (just filename)
            // ... other fields
        }
    ],
    authors: [
        {
            id: 456,
            author_name: "John Doe",
            author_image: "456.jpg", // This is what gets stored in DB (just filename)
            // ... other fields
        }
    ],
    magazines: [
        {
            id: 789,
            title: "Sample Magazine",
            cover_image: "789.jpg", // This is what gets stored in DB (just filename)
            doc_url: "789.pdf", // This is what gets stored in DB (just filename)
            // ... other fields
        }
    ]
};
