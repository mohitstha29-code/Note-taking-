
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  tooltip?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ children, tooltip, className, ...props }) => {
  return (
    <div className="relative group flex items-center">
      <button
        className={`p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 ${className}`}
        {...props}
      >
        {children}
      </button>
      {tooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default IconButton;
   