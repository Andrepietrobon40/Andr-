
import React from 'react';
import { BookIcon } from './IconComponents';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900 rounded-xl">
      <div className="relative">
        <BookIcon className="w-16 h-16 text-yellow-400 animate-pulse" />
      </div>
      <p className="mt-4 text-lg font-medium text-gray-300">{message}</p>
      <div className="w-full bg-gray-800 rounded-full h-2.5 mt-4 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2.5 rounded-full animate-loader-progress"></div>
      </div>
      <style>{`
        @keyframes loader-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loader-progress {
          animation: loader-progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
