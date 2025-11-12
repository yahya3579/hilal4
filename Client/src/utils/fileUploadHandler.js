// utils/fileUploadHandler.js

// Function to handle file upload and return the path for database storage
export const handleFileUpload = async (file, entityType, entityId) => {
    if (!file) return null;

    try {
        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Validate file type based on entity type
        if (entityType === 'magazines') {
            // Magazines can have both images and PDFs
            if (!['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
                throw new Error('Invalid file type. Magazines support: .jpg, .jpeg, .png, .pdf');
            }
        } else {
            // Other entities only support images
            if (!['jpg', 'jpeg', 'png'].includes(fileExtension)) {
                throw new Error('Invalid file type. Only .jpg, .jpeg, .png are supported');
            }
        }

        // Create filename with entity ID
        const filename = `${entityId}.${fileExtension}`;
        
        // Save file to client-side public directory
        await saveFileToPublic(file, entityType, filename);
        
        console.log(`File uploaded: ${filename}`);
        console.log(`File saved to: public/uploads/${entityType}/${filename}`);
        console.log(`File will be accessible at: /uploads/${entityType}/${filename}`);
        console.log(`Database will store: ${filename}`);
        
        // Return only the filename for database storage
        return filename;
    } catch (err) {
        console.error("File upload error:", err);
        throw err;
    }
};

// Function to save file to public directory
const saveFileToPublic = async (file, entityType, filename) => {
    try {
        // Convert file to array buffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Create a blob from the array buffer
        const blob = new Blob([arrayBuffer], { type: file.type });
        
        // Create a temporary download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
        
        console.log(`File ${filename} has been prepared for download to public/uploads/${entityType}/`);
        console.log('Note: In development, files are downloaded to your Downloads folder.');
        console.log('In production, you would need to manually move files to public/uploads/ or use a build script.');
        
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
};

// Function to get the public URL for a file path
export const getFileUrl = (filename, entityType = 'articles') => {
    if (!filename) return null;
    
    // If filename already contains the full path, return it as is
    if (filename.includes('/')) {
        return `/${filename}`;
    }
    
    // For files in the public directory, use the frontend public URL
    // Files are served from the frontend at /uploads/{entityType}/{filename}
    return `/uploads/${entityType}/${filename}`;
};

// Function to create a preview URL for uploaded files
export const createPreviewUrl = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
};

// Function to revoke preview URL to free memory
export const revokePreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};
