'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stage {
  id: string;
  label: string;
  complete: boolean;
  active: boolean;
}

interface ProgressStagesProps {
  currentStage: number;
  stages: string[];
}

export default function ProgressStages({ currentStage, stages }: ProgressStagesProps) {
  const stageData: Stage[] = stages.map((label, index) => ({
    id: `stage-${index}`,
    label,
    complete: index < currentStage,
    active: index === currentStage
  }));

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {stageData.map((stage, index) => (
          <React.Fragment key={stage.id}>
            {/* Stage Indicator */}
            <div className="flex flex-col items-center relative">
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-lg",
                  stage.complete && "bg-green-500 text-white",
                  stage.active && "bg-purple-500 text-white ring-4 ring-purple-500/30 scale-110",
                  !stage.complete && !stage.active && "bg-slate-700 text-slate-400"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: stage.active ? 1.1 : 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {stage.complete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : stage.active ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  index + 1
                )}
              </motion.div>
              
              {/* Label */}
              <span className={cn(
                "text-xs mt-2 font-medium text-center max-w-[80px] transition-colors",
                stage.active ? "text-purple-400" : stage.complete ? "text-green-400" : "text-slate-500"
              )}>
                {stage.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < stageData.length - 1 && (
              <div className="flex-1 h-0.5 bg-slate-700 mx-2 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-green-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: stage.complete ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
