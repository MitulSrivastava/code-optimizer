const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const minifyHtml = require('html-minifier-terser').minify;
const CleanCSS = require('clean-css');
const Terser = require('terser');

const OUTPUT_DIR = path.join(__dirname, '../processed');
const UNPACK_DIR = path.join(__dirname, '../temp_unpack');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
if (!fs.existsSync(UNPACK_DIR)) fs.mkdirSync(UNPACK_DIR);

async function processZip(filePath, fileName, options = {}) {
  const report = {
    junkFilesRemoved: 0,
    imagesOptimized: 0,
    filesMinified: 0,
    pathsNormalized: 0,
    beforeSize: 0,
    afterSize: 0,
    malwareScan: null,
    aiSuggestions: []
  };

  // Get file size before processing
  const stats = fs.statSync(filePath);
  report.beforeSize = stats.size;

  // Unique unpack folder
  const jobId = path.basename(fileName, '.zip') + '-' + Date.now();
  const unpackPath = path.join(UNPACK_DIR, jobId);
  
  // 1. Extract ZIP
  const zip = new AdmZip(filePath);
  zip.extractAllTo(unpackPath, true);

  // Track file renames to update references later
  const fileRenames = new Map(); 

  // 2. First Pass: Rename, Clean, Image Opt
  await sanitizeDirectoryPass1(unpackPath, report, fileRenames, options);

  // 3. Malware Scan (if enabled)
  if (options.malware !== false) {
    const { scanDirectory, getScanSummary } = require('./malware-scanner');
    const scanResults = await scanDirectory(unpackPath);
    const scanSummary = getScanSummary(scanResults);
    report.malwareScan = {
      ...scanResults,
      summary: scanSummary
    };
  }

  // 4. Second Pass: Update References & Minify
  await sanitizeDirectoryPass2(unpackPath, report, fileRenames, options);

  // 5. AI Analysis (if enabled)
  if (options.ai !== false) {
    const { analyzeProject } = require('./ai-analyzer');
    report.aiSuggestions = await analyzeProject(unpackPath, report);
  }

  // 6. Create New ZIP
  const outputZip = new AdmZip();
  outputZip.addLocalFolder(unpackPath);
  
  const outputFileName = `sanitized-${Date.now()}.zip`;
  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  outputZip.writeZip(outputPath);

  // Get after size
  const afterStats = fs.statSync(outputPath);
  report.afterSize = afterStats.size;
  report.savingsPercent = ((report.beforeSize - report.afterSize) / report.beforeSize * 100).toFixed(2);

  // Cleanup
  try {
    fs.rmSync(unpackPath, { recursive: true, force: true });
  } catch (e) { console.error("Cleanup error", e); }

  return { outputFileName, report };
}

async function sanitizeDirectoryPass1(dirPath, report, fileRenames, options = {}) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const oldPath = path.join(dirPath, file);
    if (!fs.existsSync(oldPath)) continue;

    const stats = fs.statSync(oldPath);

    // Remove Junk
    if (file === '__MACOSX' || file === '.DS_Store' || file.startsWith('._')) {
        fs.rmSync(oldPath, { recursive: true, force: true });
        report.junkFilesRemoved++;
        continue;
    }

    let currentPath = oldPath;
    let currentName = file;

    // Normalize Path (Lowercase + Dash) - only if enabled
    if (options.normalize !== false) {
      const lowerName = file.toLowerCase().replace(/\s+/g, '-');
      if (file !== lowerName) {
          const newPath = path.join(dirPath, lowerName);
          if (!fs.existsSync(newPath)) {
              fs.renameSync(oldPath, newPath);
              currentPath = newPath;
              
              fileRenames.set(file, lowerName); // Record rename
              currentName = lowerName;
              report.pathsNormalized++;
          }
      }
    }

    if (stats.isDirectory()) {
      await sanitizeDirectoryPass1(currentPath, report, fileRenames, options);
    } else {
      // Image Optimization - only if enabled
      if (options.images !== false) {
        const ext = path.extname(currentPath).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          try {
              const webpName = currentName.replace(ext, '.webp');
              const webpPath = path.join(dirPath, webpName);
              
              await sharp(currentPath)
                  .webp({ quality: 80 })
                  .toFile(webpPath);
              
              fs.unlinkSync(currentPath);
              
              fileRenames.set(currentName, webpName); // Record image conversion
              // Also record strict replace for the full original name including extension
              fileRenames.set(file, webpName); 

              report.imagesOptimized++;
          } catch (err) {
              console.error(`Failed to convert ${currentPath}:`, err);
          }
        }
      }
    }
  }
}

async function sanitizeDirectoryPass2(dirPath, report, fileRenames, options = {}) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      await sanitizeDirectoryPass2(filePath, report, fileRenames, options);
    } else {
       const ext = path.extname(filePath).toLowerCase();
       
       if (['.html', '.css', '.js'].includes(ext)) {
          let content = fs.readFileSync(filePath, 'utf8');

          // Update References
          for (const [oldName, newName] of fileRenames.entries()) {
             // Global replace of filenames
             // This is a naive heuristic but works for 90% of static sites
             // Regex for exact word match might be safer, but filenames often appear in paths
             const regex = new RegExp(oldName, 'g');
             content = content.replace(regex, newName);
          }

          // Minify - only if enabled
          if (options.minify !== false) {
            try {
              if (ext === '.html') {
                  content = await minifyHtml(content, {
                      removeAttributeQuotes: true,
                      collapseWhitespace: true,
                      removeComments: true,
                  });
              } else if (ext === '.css') {
                  const output = new CleanCSS().minify(content);
                  content = output.styles;
              } else if (ext === '.js') {
                  const result = await Terser.minify(content);
                  if (result.code) content = result.code;
              }
              report.filesMinified++;
            } catch (e) {
              console.error(`Minification failed for ${file}`, e);
            }
          }

          fs.writeFileSync(filePath, content, 'utf8');
       }
    }
  }
}

module.exports = { processZip };
