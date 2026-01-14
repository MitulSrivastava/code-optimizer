const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processZip } = require('./services/sanitizer');
const { checkFileHistory, recordProcessedFile } = require('./services/tracking-service');
const { calculateFileHash } = require('./utils/hash-utils');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow all Vercel deployments (production and preview)
    if (origin.includes('vercel.app')) return callback(null, true);
    
    // Check against environment variable
    const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { checkFileHistory, recordProcessedFile } = require('./services/tracking-service');

    // Parse options (NextJS sends it as stringified JSON in FormData)
    let options = {};
    if (req.body.options) {
        try {
            options = JSON.parse(req.body.options);
        } catch (e) {
            console.error("Failed to parse options", e);
        }
    }

    // Check if file has been processed before
    const existingRecord = await checkFileHistory(req.file.path);
    
    if (existingRecord) {
      // File already processed - return cached result
      const cachedOutputPath = path.join(__dirname, 'processed', existingRecord.outputFileName);
      
      if (fs.existsSync(cachedOutputPath)) {
        console.log('✅ Returning cached result for previously processed file');
        
        // Clean up the uploaded duplicate
        fs.unlinkSync(req.file.path);
        
        return res.json({
          message: 'File already processed - returning cached result',
          downloadUrl: `/api/download/${existingRecord.outputFileName}`,
          report: {
            ...existingRecord.report,
            cached: true,
            previouslyProcessedOn: existingRecord.timestamp
          }
        });
      }
    }

    // New file - process it
    console.log(`Processing ${req.file.filename} with options:`, options);
    
    const beforeStats = {
      size: req.file.size,
      filename: req.file.filename
    };

    const result = await processZip(req.file.path, req.file.filename, options);

    // Record this file for future tracking
    await recordProcessedFile(req.file.path, result.outputFileName, result.report, beforeStats);

    res.json({
      message: 'File processed successfully',
      downloadUrl: `/api/download/${result.outputFileName}`,
      report: result.report
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file', details: error.message });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'processed', req.params.filename);
  if (fs.existsSync(filePath)) res.download(filePath);
  else res.status(404).json({ error: 'File not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
