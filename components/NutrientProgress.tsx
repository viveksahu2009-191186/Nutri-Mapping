
import React from 'react';

interface NutrientProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const NutrientProgress: React.FC<NutrientProgressProps> = ({ label, current, target, unit, color }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-500">
          <span className="font-bold text-slate-900">{current}</span> / {target} {unit}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default NutrientProgress;
