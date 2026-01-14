const fs = require('fs');
const path = require('path');
const { calculateFileHash } = require('../utils/hash-utils');

const TRACKING_DB_PATH = path.join(__dirname, '../data/tracking.json');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize tracking database
if (!fs.existsSync(TRACKING_DB_PATH)) {
  fs.writeFileSync(TRACKING_DB_PATH, JSON.stringify({ files: {} }, null, 2));
}

/**
 * Load tracking database
 * @returns {Object} - Tracking database object
 */
function loadDatabase() {
  try {
    const data = fs.readFileSync(TRACKING_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tracking database:', error);
    return { files: {} };
  }
}

/**
 * Save tracking database
 * @param {Object} db - Database object to save
 */
function saveDatabase(db) {
  try {
    fs.writeFileSync(TRACKING_DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving tracking database:', error);
  }
}

/**
 * Check if file has been processed before
 * @param {string} filePath - Path to the uploaded file
 * @returns {Promise<Object|null>} - Previous processing record or null
 */
async function checkFileHistory(filePath) {
  const hash = await calculateFileHash(filePath);
  const db = loadDatabase();
  
  if (db.files[hash]) {
    const record = db.files[hash];
    console.log(`✅ File already processed on ${record.timestamp}`);
    return record;
  }
  
  return null;
}

/**
 * Record a processed file
 * @param {string} filePath - Original file path
 * @param {string} outputFileName - Output filename
 * @param {Object} report - Optimization report
 * @param {Object} beforeStats - File stats before optimization
 * @returns {Promise<void>}
 */
async function recordProcessedFile(filePath, outputFileName, report, beforeStats) {
  const hash = await calculateFileHash(filePath);
  const db = loadDatabase();
  
  db.files[hash] = {
    hash,
    timestamp: new Date().toISOString(),
    outputFileName,
    report,
    beforeStats,
    uploadCount: (db.files[hash]?.uploadCount || 0) + 1
  };
  
  saveDatabase(db);
  console.log(`📝 Recorded file with hash: ${hash}`);
}

/**
 * Get processing statistics
 * @returns {Object} - Statistics about processed files
 */
function getStatistics() {
  const db = loadDatabase();
  const totalFiles = Object.keys(db.files).length;
  const totalUploads = Object.values(db.files).reduce((sum, record) => sum + record.uploadCount, 0);
  
  return {
    uniqueFilesProcessed: totalFiles,
    totalUploads,
    duplicateUploads: totalUploads - totalFiles
  };
}

/**
 * Clear old records (optional cleanup)
 * @param {number} daysOld - Remove records older than this many days
 */
function cleanupOldRecords(daysOld = 30) {
  const db = loadDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  let removedCount = 0;
  for (const [hash, record] of Object.entries(db.files)) {
    if (new Date(record.timestamp) < cutoffDate) {
      delete db.files[hash];
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    saveDatabase(db);
    console.log(`🗑️  Cleaned up ${removedCount} old records`);
  }
}

module.exports = {
  checkFileHistory,
  recordProcessedFile,
  getStatistics,
  cleanupOldRecords
};
