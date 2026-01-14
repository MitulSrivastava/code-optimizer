# Code Sanitizer - Smart Deployment Optimizer

Modern SaaS application for optimizing web projects before deployment to Hostinger or other hosting platforms.

## ✨ Features

- 🧹 **Junk File Removal** - Removes macOS files (.DS_Store, __MACOSX)
- 🖼️ **Image Optimization** - Converts images to WebP format
- ⚡ **Code Minification** - Minifies HTML, CSS, and JavaScript
- 📂 **Path Normalization** - Fixes file paths for Linux/Hostinger compatibility
- 🛡️ **Malware Scanning** - Detects suspicious code patterns
- 🤖 **AI Suggestions** - Intelligent recommendations for improvements
- 💾 **File Tracking** - Prevents re-optimization with hash-based caching
- 🌙 **Dark Mode UI** - Modern, professional interface

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd code-sanitizer
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend
   cd client
   cp .env.example .env.local
   # Edit .env.local if needed (default: http://localhost:3001)
   ```

4. **Start the servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📦 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for detailed deployment instructions to:
- **Frontend**: Vercel
- **Backend**: Render

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- Node.js / Express
- Multer (file uploads)
- Sharp (image processing)
- Terser (JS minification)
- Clean-CSS (CSS minification)
- HTML Minifier

## 📁 Project Structure

```
code sanitizer/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── context/           # React contexts
│   ├── lib/               # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── services/          # Business logic
│   │   ├── sanitizer.js   # Core optimization
│   │   ├── tracking-service.js  # File tracking
│   │   ├── malware-scanner.js   # Security scanning
│   │   └── ai-analyzer.js       # AI recommendations
│   ├── utils/             # Helper functions
│   ├── uploads/           # Temporary file storage
│   └── processed/         # Optimized outputs
└── DEPLOYMENT.md          # Deployment guide
```

## 🎯 Usage

1. **Upload** your website ZIP file
2. **Configure** optimization options (all enabled by default)
3. **Run** optimization
4. **Review** AI recommendations and security scan
5. **Download** your optimized ZIP
6. **Upload** to Hostinger (or any host)

## 🔒 Security

- Pattern-based malware detection
- Suspicious code identification
- File type validation
- CORS protection
- Input sanitization

## 📊 Features Breakdown

### Optimization
- MacOS junk file removal (DS_Store, __MACOSX)
- Image conversion to WebP (up to 50% size reduction)
- HTML/CSS/JS minification
- Path normalization for Linux compatibility

### Analytics
- Before/After size comparison
- Savings percentage calculation
- File count statistics
- Processing history

### Intelligence
- SEO recommendations (sitemap, robots.txt, favicon)
- Mobile responsiveness checks
- Performance optimization tips
- Code organization suggestions

## 🤝 Contributing

This is a personal project. Feel free to fork and customize for your needs.

## 📄 License

MIT License - Feel free to use for your projects.

## 🆘 Support

For issues or questions, create an issue in the repository.

---

**Built with ❤️ for seamless Hostinger deployments**
