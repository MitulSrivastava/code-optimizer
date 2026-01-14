const crypto = require('crypto');
const fs = require('fs');

/**
 * Calculate MD5 hash of a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - MD5 hash string
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Calculate hash of a buffer
 * @param {Buffer} buffer - Buffer to hash
 * @returns {string} - MD5 hash string
 */
function calculateBufferHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

module.exports = {
  calculateFileHash,
  calculateBufferHash
};
