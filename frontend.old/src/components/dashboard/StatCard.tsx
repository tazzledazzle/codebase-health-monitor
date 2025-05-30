import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className = '',
}) => {
  const getTrendColor = () => {
    if (trend === undefined) return '';
    return trend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    return trend > 0 ? '↑' : '↓';
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4">
          <span className={`text-sm ${getTrendColor()}`}>
            {getTrendIcon()} {Math.abs(trend)}% {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;