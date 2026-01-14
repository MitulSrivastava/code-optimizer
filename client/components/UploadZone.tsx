'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileArchive, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function UploadZone() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus('done');
      setDownloadUrl(`http://localhost:3001${response.data.downloadUrl}`);
      setReport(response.data.report);
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Something went wrong');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          status === 'uploading' && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        {status === 'idle' && (
          <>
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">Drag & drop your project ZIP here</p>
            <p className="text-sm text-gray-500 mt-2">or click to browse files</p>
          </>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">Processing your project...</p>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-green-700">Sanitization Complete!</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-700">Error</p>
            <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
          </div>
        )}
      </div>

      {status === 'done' && downloadUrl && (
        <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border border-green-100">
           <h3 className="text-xl font-bold text-gray-900 mb-4">Optimization Report</h3>
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="block text-sm text-gray-500">Junk Files Removed</span>
                <span className="block text-2xl font-bold text-gray-800">{report?.junkFilesRemoved}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="block text-sm text-gray-500">Images Optimized</span>
                <span className="block text-2xl font-bold text-gray-800">{report?.imagesOptimized}</span>
              </div>
           </div>

           <a 
             href={downloadUrl} 
             className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
           >
             Download Optimized ZIP
           </a>
        </div>
      )}
    </div>
  );
}
