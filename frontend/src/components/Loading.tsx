import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  contentArea?: boolean;
  transparent?: boolean;
  pulseCenterDot?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text = 'Loading...',
  contentArea = false,
  transparent = false,
  pulseCenterDot = false
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div
      className={`flex items-center justify-center ${
        contentArea ? "absolute inset-0 z-50" : "h-screen w-full"
      } ${transparent ? "bg-background/50" : "bg-background"}`}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <div 
            className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-primary animate-spin`}
          ></div>
          
          {pulseCenterDot && (
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                size === 'small' ? 'h-2 w-2' : size === 'medium' ? 'h-4 w-4' : 'h-6 w-6'
              } bg-primary rounded-full animate-pulse`}
            ></div>
          )}
        </div>
        
        <span className={`mt-2 ${textSizeClasses[size]} text-muted-foreground`}>{text}</span>
      </div>
    </div>
  );
};

export default Loading;