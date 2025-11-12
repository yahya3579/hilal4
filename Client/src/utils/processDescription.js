// Utility function to process article descriptions
// Replaces environment variables with actual values and handles other processing

export const processDescription = (description, options = {}) => {
  if (!description) return '';
  
  const {
    replaceEnvVars = true,
    stripHtml = false,
    maxLength = null,
    removeImages = false
  } = options;
  
  let processedDescription = description;
  
  // Replace environment variables with actual values
  if (replaceEnvVars) {
    const apiUrl = import.meta.env.VITE_API_URL;
    processedDescription = processedDescription.replace(/\$\{import\.meta\.env\.VITE_API_URL\}/g, apiUrl);
    
    // Convert relative gallery image paths used in img src attributes to absolute URLs
    // 1) Handle src="/uploads/gallery/..."
    processedDescription = processedDescription.replace(
      /(src\s*=\s*["'])(?:\/)?uploads\/gallery\/([^"']+)(["'])/gi,
      `$1${apiUrl}/media/uploads/gallery/$2$3`
    );
    // 2) Handle src="gallery/..." (without the uploads prefix)
    processedDescription = processedDescription.replace(
      /(src\s*=\s*["'])gallery\/([^"']+)(["'])/gi,
      `$1${apiUrl}/media/uploads/gallery/$2$3`
    );
  }
  
  // Remove images if requested
  if (removeImages) {
    processedDescription = processedDescription.replace(/<img[^>]*>/gi, '');
  }
  
  // Strip HTML if requested
  if (stripHtml) {
    processedDescription = processedDescription.replace(/<[^>]*>/g, '');
  }
  
  // Truncate if maxLength is specified
  if (maxLength && processedDescription.length > maxLength) {
    processedDescription = processedDescription.slice(0, maxLength) + '...';
  }
  
  return processedDescription;
};
