'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, FileArchive, CheckCircle, AlertCircle, Loader2, 
  ShieldCheck, Wand2, Smartphone, RefreshCw, LayoutDashboard,
  Sparkles, Download, Clock
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressStages from './ProgressStages';
import BeforeAfterDashboard from './BeforeAfterDashboard';
import MalwareScanResults from './MalwareScanResults';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [currentStage, setCurrentStage] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  
  // Feature Toggles
  const [features, setFeatures] = useState({
    minify: true,
    images: true,
    normalize: true,
    malware: true,
    ai: true,
    responsive: true
  });

  const processingStages = [
    'Uploading',
    'Extracting',
    'Cleaning',
    'Optimizing',
    'Scanning',
    'Complete'
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    multiple: false
  });

  const handleProcess = async () => {
    if (!file) return;
    setStatus('uploading');
    setCurrentStage(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(features));

    try {
        // Simulate stages
        const stageInterval = setInterval(() => {
            setCurrentStage((prev) => {
              if (prev < processingStages.length - 1) return prev + 1;
              return prev;
            });
        }, 1500);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await axios.post(`${API_URL}/api/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        clearInterval(stageInterval);
        setCurrentStage(processingStages.length - 1);
        setStatus('done');
        setDownloadUrl(`${API_URL}${response.data.downloadUrl}`);
        setReport(response.data.report);

    } catch (error) {
        console.error(error);
        setStatus('error');
    }
  };

  const handleRerun = () => {
    setStatus('idle');
    setFile(null);
    setReport(null);
    setDownloadUrl(null);
    setCurrentStage(0);
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen w-full">
      {/* Modern Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white gradient-text">Code Sanitizer</h1>
              <p className="text-xs text-slate-400">Smart Deployment Optimizer</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass rounded-2xl p-6 border border-slate-700 dark:border-slate-700 light:border-slate-200"
          >
            <h3 className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm font-medium mb-1">System Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xl font-bold text-white dark:text-white light:text-slate-900">Operational</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="glass rounded-2xl p-6 border border-slate-700 dark:border-slate-700 light:border-slate-200"
          >
            <h3 className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm font-medium mb-1">Security Database</h3>
            <span className="text-xl font-bold text-white dark:text-white light:text-slate-900">Up to Date</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-lg shadow-purple-500/20"
          >
            <h3 className="text-purple-100 text-sm font-medium mb-1">AI Powered</h3>
            <span className="text-xl font-bold text-white">Active</span>
          </motion.div>
        </div>

        <div className={cn(
          "grid gap-8",
          status === 'done' ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
        )}>
          {/* Left Column: Controls */}
          <div className={cn(
            "space-y-6",
            status === 'done' ? "hidden" : "lg:col-span-2"
          )}>
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={cn(
                "relative group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300",
                isDragActive 
                  ? "border-purple-500 bg-purple-500/10" 
                  : "border-slate-700 hover:border-purple-400 glass",
                status !== 'idle' && "pointer-events-none opacity-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl shadow-black/20">
                {file ? <FileArchive className="w-8 h-8 text-purple-400" /> : <Upload className="w-8 h-8 text-slate-400" />}
              </div>
              {file ? (
                <div>
                  <p className="text-lg font-bold text-white mb-1">{file.name}</p>
                  <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-white mb-2">Drag & Drop Project ZIP</p>
                  <p className="text-sm text-slate-400">Supports standard Web Projects (HTML/CSS/JS)</p>
                </div>
              )}
            </div>

            {/* Feature Checkboxes */}
            {status === 'idle' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 border border-slate-700"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-2 text-purple-400" /> Optimization Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureToggle label="Minify Code" active={features.minify} onClick={() => toggleFeature('minify')} icon={<RefreshCw className="w-4 h-4"/>} />
                  <FeatureToggle label="Convert Images (WebP)" active={features.images} onClick={() => toggleFeature('images')} icon={<Wand2 className="w-4 h-4"/>} />
                  <FeatureToggle label="Safe Path Normalize" active={features.normalize} onClick={() => toggleFeature('normalize')} icon={<CheckCircle className="w-4 h-4"/>} />
                  <FeatureToggle label="Malware Scan" active={features.malware} onClick={() => toggleFeature('malware')} icon={<ShieldCheck className="w-4 h-4"/>} />
                  <FeatureToggle label="AI Suggestions" active={features.ai} onClick={() => toggleFeature('ai')} icon={<Sparkles className="w-4 h-4"/>} />
                  <FeatureToggle label="Responsive Check" active={features.responsive} onClick={() => toggleFeature('responsive')} icon={<Smartphone className="w-4 h-4"/>} />
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            {status === 'idle' && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleProcess}
                disabled={!file}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Run Optimization</span>
              </motion.button>
            )}
          </div>

          {/* Results Section - Full width when done */}
          <div className={cn(
            "space-y-6",
            status === 'done' ? "w-full" : ""
          )}>
            {/* Progress Stages - Show in right column when processing */}
            {status !== 'idle' && status !== 'done' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 border border-slate-700"
              >
                <ProgressStages currentStage={currentStage} stages={processingStages} />
              </motion.div>
            )}

            {/* Download Button - Full width when done */}
            {status === 'done' && downloadUrl && (
              <motion.a 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                href={downloadUrl} 
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/25 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download Optimized ZIP</span>
              </motion.a>
            )}

            {/* Results Grid - 2 columns when done */}
            {status === 'done' && report && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Recommendations */}
                {report.aiSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-2xl p-6 border border-slate-700"
                  >
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                      AI Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      {report.aiSuggestions.map((suggestion: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start space-x-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg"
                        >
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quick Stats */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-6 border border-slate-700"
                >
                  <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <StatRow label="Junk Files Removed" value={report.junkFilesRemoved} />
                    <StatRow label="Images Optimized" value={report.imagesOptimized} />
                    <StatRow label="Minified Files" value={report.filesMinified} />
                    <StatRow label="Paths Normalized" value={report.pathsNormalized} />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Processing Info - Cached indicator */}
            {report && report.cached && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 border border-green-700"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold">Cached Result</h3>
                </div>
                <p className="text-sm text-slate-300">
                  This file was previously optimized on {new Date(report.previouslyProcessedOn).toLocaleDateString()}. 
                  Returning cached result to prevent re-optimization.
                </p>
              </motion.div>
            )}

            {/* Before/After and Malware - Full width sections */}
            {status === 'done' && report && (
              <>
                {report.beforeSize && (
                  <BeforeAfterDashboard 
                    beforeSize={report.beforeSize}
                    afterSize={report.afterSize}
                    savingsPercent={parseFloat(report.savingsPercent || '0')}
                    report={report}
                  />
                )}

                {report.malwareScan && (
                  <MalwareScanResults scanResults={report.malwareScan} />
                )}

                {/* Re-run Button - At the bottom */}
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleRerun}
                  className="w-full border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-run Optimization</span>
                </motion.button>
              </>
            )}

            {/* Error Display */}
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-red-400 font-bold">Processing Failed</h3>
                </div>
                <p className="text-sm text-red-300">
                  An error occurred while processing your file. Please try again.
                </p>
                <button 
                  onClick={handleRerun}
                  className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureToggle({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
        active 
          ? "bg-purple-500/10 border-purple-500/50" 
          : "bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-400"
      )}
    >
      <div className="flex items-center space-x-3">
        <div className={cn("p-2 rounded-lg", active ? "bg-purple-500 text-white" : "bg-slate-700 dark:bg-slate-700 light:bg-slate-300 text-slate-400 dark:text-slate-400 light:text-slate-600")}>
          {icon}
        </div>
        <span className={cn("font-medium", active ? "text-white dark:text-white light:text-slate-900" : "text-slate-400 dark:text-slate-400 light:text-slate-600")}>{label}</span>
      </div>
      <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", active ? "bg-purple-500 border-purple-500" : "border-slate-600 dark:border-slate-600 light:border-slate-400")}>
        {active && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-mono font-bold bg-slate-800 px-2 py-1 rounded">{value}</span>
    </div>
  )
}
