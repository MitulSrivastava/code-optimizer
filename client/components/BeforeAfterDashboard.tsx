'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, FileArchive, Zap, Award } from 'lucide-react';

interface BeforeAfterDashboardProps {
  beforeSize: number;
  afterSize: number;
  savingsPercent: number;
  report: any;
}

export default function BeforeAfterDashboard({ beforeSize, afterSize, savingsPercent, report }: BeforeAfterDashboardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const metrics = [
    {
      icon: <FileArchive className="w-5 h-5" />,
      label: 'Original Size',
      value: formatBytes(beforeSize),
      color: 'text-slate-400'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Optimized Size',
      value: formatBytes(afterSize),
      color: 'text-green-400'
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      label: 'Size Reduction',
      value: `${savingsPercent}%`,
      color: 'text-purple-400'
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'Files Optimized',
      value: report.imagesOptimized + report.filesMinified,
      color: 'text-blue-400'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl"
    >
      <h3 className="text-white font-bold text-lg mb-6 flex items-center">
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
        Before / After Comparison
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
          >
            <div className={`${metric.color} mb-2`}>
              {metric.icon}
            </div>
            <p className="text-slate-400 text-xs mb-1">{metric.label}</p>
            <p className="text-white font-bold text-xl">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Visual Bar Comparison */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-xs">File Size Comparison</span>
          <span className="text-green-400 text-xs font-bold">-{savingsPercent}%</span>
        </div>
        
        <div className="space-y-2">
          {/* Before Bar */}
          <div className="flex items-center space-x-3">
            <span className="text-slate-500 text-xs w-14">Before</span>
            <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
          
          {/* After Bar */}
          <div className="flex items-center space-x-3">
            <span className="text-green-400 text-xs w-14">After</span>
            <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${100 - parseFloat(savingsPercent.toString())}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
