# File Upload System

This document explains the new local file upload system that stores files in the `hilal_client` directory structure and saves file paths in the database.

## How It Works

### 1. File Structure
Files are organized in the following structure:
```
hilal_client/
├── public/
│   └── uploads/
│       ├── articles/
│       │   └── {id}.jpg
│       ├── authors/
│       │   └── {id}.jpg
│       ├── gallery/
│       │   └── {id}.jpg
│       ├── magazines/
│       │   ├── {id}.jpg
│       │   └── {id}.pdf
│       └── publications/
│           └── {id}.jpg
└── uploads/ (temporary storage during development)
    └── (same structure as public/uploads)
```

### 2. Database Storage
Instead of storing full URLs, the database now stores relative paths:
- `uploads/articles/123.jpg`
- `uploads/authors/456.jpg`
- `uploads/magazines/789.pdf`

### 3. File Access
Files are accessible via public URLs:
- `http://localhost:5173/uploads/articles/123.jpg`
- `http://localhost:5173/uploads/authors/456.jpg`

## Implementation Details

### Frontend Files
- `src/utils/localUpload.js` - Main upload functions
- `src/utils/fileUploadHandler.js` - File handling logic
- `src/utils/fileManager.js` - File management utilities

### Upload Functions
```javascript
// Upload article image
const imagePath = await uploadArticleImage(file, articleId);
// Returns: "uploads/articles/123.jpg"

// Upload author image
const authorImagePath = await uploadAuthorImage(file, authorId);
// Returns: "uploads/authors/456.jpg"

// Upload magazine files
const magazineImagePath = await uploadMagazineImage(file, magazineId);
const magazinePdfPath = await uploadMagazinePdf(file, magazineId);
```

### File URL Generation
```javascript
import { getFileUrl } from './utils/localUpload';

const fileUrl = getFileUrl("uploads/articles/123.jpg");
// Returns: "/uploads/articles/123.jpg"
```

## Development Workflow

### 1. File Upload Process
1. User selects a file in the edit form
2. File is validated (type, size, etc.)
3. File path is generated: `uploads/{entityType}/{entityId}.{extension}`
4. Path is stored in the database
5. File is saved to the public directory structure

### 2. Build Process
The build process includes copying files from the temporary `uploads/` directory to the `public/uploads/` directory:

```bash
npm run build
# This runs: vite build && node scripts/copy-files.js
```

### 3. File Serving
Files are served directly from the public directory, making them accessible via HTTP requests.

## Benefits

1. **Local Storage**: No dependency on external services like Cloudinary
2. **Organized Structure**: Files are organized by entity type and ID
3. **Predictable URLs**: File URLs follow a consistent pattern
4. **Database Efficiency**: Only file paths are stored, not full URLs
5. **Version Control**: Files can be tracked in version control if needed

## File Types Supported

- **Articles**: `.jpg`, `.jpeg`, `.png`
- **Authors**: `.jpg`, `.jpeg`, `.png`
- **Gallery**: `.jpg`, `.jpeg`, `.png`
- **Magazines**: `.jpg`, `.jpeg`, `.png`, `.pdf`
- **Publications**: `.jpg`, `.jpeg`, `.png`

## Error Handling

The system includes comprehensive error handling:
- File type validation
- File size validation (can be added)
- Entity type validation
- Database error handling

## Future Enhancements

1. **File Compression**: Automatically compress images
2. **File Size Limits**: Add configurable file size limits
3. **File Cleanup**: Remove unused files
4. **CDN Integration**: Easy migration to CDN if needed
5. **File Versioning**: Support for multiple versions of the same file
