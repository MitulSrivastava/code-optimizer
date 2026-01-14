const fs = require('fs');
const path = require('path');

/**
 * Analyze project structure and provide AI suggestions
 * @param {string} dirPath - Directory to analyze
 * @param {Object} optimizationReport - Report from sanitizer
 * @returns {Array<string>} - Array of suggestions
 */
async function analyzeProject(dirPath, optimizationReport) {
  const suggestions = [];
  const structure = await analyzeStructure(dirPath);
  
  // Performance suggestions
  if (optimizationReport.imagesOptimized > 0) {
    suggestions.push(`✨ Converted ${optimizationReport.imagesOptimized} images to WebP format, reducing page load time by ~30-50%`);
  }
  
  if (optimizationReport.filesMinified > 0) {
    suggestions.push(`🚀 Minified ${optimizationReport.filesMinified} files, improving download speed and reducing bandwidth`);
  }
  
  // File structure suggestions
  if (structure.hasIndexHtml) {
    if (!structure.hasFavicon) {
      suggestions.push('💡 Consider adding a favicon.ico for better branding');
    }
    
    if (!structure.hasRobotsTxt) {
      suggestions.push('🤖 Add robots.txt to control search engine crawling');
    }
    
    if (!structure.hasSitemap) {
      suggestions.push('🗺️  Create a sitemap.xml to improve SEO');
    }
  }
  
  // CSS suggestions
  if (structure.cssFiles > 5) {
    suggestions.push('📦 Consider combining multiple CSS files to reduce HTTP requests');
  }
  
  // JS suggestions
  if (structure.jsFiles > 10) {
    suggestions.push('⚡ Large number of JS files detected. Consider bundling with Webpack or Vite');
  }
  
  // Image suggestions
  if (structure.imageCount > 20 && !structure.hasImagesInSubfolder) {
    suggestions.push('🖼️  Organize images into an /images or /assets folder for better structure');
  }
  
  // Security suggestions
  if (structure.hasPhpFiles) {
    suggestions.push('🔒 PHP files detected. Ensure server-side validation is implemented');
  }
  
  // Mobile responsiveness
  if (structure.hasIndexHtml && !structure.hasViewportMeta) {
    suggestions.push('📱 Add viewport meta tag for mobile responsiveness: <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }
  
  // Path normalization success
  if (optimizationReport.pathsNormalized > 0) {
    suggestions.push(`✅ Normalized ${optimizationReport.pathsNormalized} file paths for Linux/Hostinger compatibility`);
  }
  
  // Cleanup success
  if (optimizationReport.junkFilesRemoved > 0) {
    suggestions.push(`🧹 Removed ${optimizationReport.junkFilesRemoved} macOS junk files (DS_Store, __MACOSX)`);
  }
  
  // General best practices
  if (structure.totalSize > 50 * 1024 * 1024) { // > 50MB
    suggestions.push('⚠️  Project size is quite large. Consider lazy loading or code splitting');
  }
  
  // Default encouragement
  if (suggestions.length === 0) {
    suggestions.push('✨ Project structure looks good! No critical issues found.');
  }
  
  return suggestions.slice(0, 8); // Limit to 8 suggestions
}

/**
 * Analyze directory structure
 */
async function analyzeStructure(dirPath) {
  const structure = {
    hasIndexHtml: false,
    hasFavicon: false,
    hasRobotsTxt: false,
    hasSitemap: false,
    hasViewportMeta: false,
    hasPhpFiles: false,
    hasImagesInSubfolder: false,
    cssFiles: 0,
    jsFiles: 0,
    imageCount: 0,
    totalSize: 0,
    totalFiles: 0
  };
  
  await analyzeStructureRecursive(dirPath, dirPath, structure);
  
  // Check index.html for viewport meta
  const indexPath = path.join(dirPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    structure.hasViewportMeta = content.includes('name="viewport"');
  }
  
  return structure;
}

/**
 * Recursively analyze structure
 */
async function analyzeStructureRecursive(dirPath, rootPath, structure) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    
    if (!fs.existsSync(filePath)) continue;
    
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Check for images subfolder
      if (file.toLowerCase().match(/^(images|img|assets|media)$/)) {
        structure.hasImagesInSubfolder = true;
      }
      await analyzeStructureRecursive(filePath, rootPath, structure);
    } else {
      structure.totalFiles++;
      structure.totalSize += stats.size;
      
      const fileName = file.toLowerCase();
      const ext = path.extname(fileName);
      
      // Check for specific files
      if (fileName === 'index.html') structure.hasIndexHtml = true;
      if (fileName.includes('favicon')) structure.hasFavicon = true;
      if (fileName === 'robots.txt') structure.hasRobotsTxt = true;
      if (fileName.includes('sitemap')) structure.hasSitemap = true;
      
      // Count file types
      if (ext === '.css') structure.cssFiles++;
      if (ext === '.js') structure.jsFiles++;
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
        structure.imageCount++;
      }
      if (ext === '.php') structure.hasPhpFiles = true;
    }
  }
}

module.exports = {
  analyzeProject
};
