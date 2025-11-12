// utils/localUpload.js
import { handleFileUpload, getFileUrl as getFileUrlFromHandler, uploadMagazinePdfToBackend } from './fileManager';

const generateUniqueId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Generic function to save file locally and return the path for database storage
export const saveFileLocally = async (file, entityType, entityId, options = {}) => {
    return handleFileUpload(file, entityType, entityId, options);
};

// Function to get file URL from stored filename
export const getFileUrl = (filename, entityType = 'articles') => {
    return getFileUrlFromHandler(filename, entityType);
};

// Specific upload functions for different entity types
export const uploadArticleImage = async (file, articleId) => {
    return saveFileLocally(file, 'articles', articleId);
};

export const uploadAuthorImage = async (file, authorId) => {
    return saveFileLocally(file, 'authors', authorId);
};

export const uploadGalleryImage = async (file, galleryId) => {
    return saveFileLocally(file, 'gallery', galleryId);
};

export const uploadEbookCover = async (file) => {
    const uniqueId = generateUniqueId();
    const filename = await saveFileLocally(file, 'ebooks', uniqueId, { filePurpose: 'cover' });
    return `uploads/ebooks/covers/${filename}`;
};

export const uploadEbookDocument = async (file) => {
    const uniqueId = generateUniqueId();
    const filename = await saveFileLocally(file, 'ebooks', uniqueId, { filePurpose: 'document' });
    return `uploads/ebooks/documents/${filename}`;
};

export const uploadMagazineImage = async (file, magazineId) => {
    return saveFileLocally(file, 'magazines', magazineId);
};

export const uploadPublicationImage = async (file, publicationId) => {
    return saveFileLocally(file, 'publications', publicationId);
};

export const uploadMagazinePdf = async (file, magazineId) => {
    return uploadMagazinePdfToBackend(file, magazineId);
};

export const getEbookCoverUrl = (path) => {
    if (!path) return null;
    if (typeof path === 'string' && path.startsWith('http')) {
        return path;
    }
    return getFileUrlFromHandler(path, 'ebooks/covers');
};

export const getEbookDocumentUrl = (path) => {
    if (!path) return null;
    if (typeof path === 'string' && path.startsWith('http')) {
        return path;
    }
    return getFileUrlFromHandler(path, 'ebooks/documents');
};
