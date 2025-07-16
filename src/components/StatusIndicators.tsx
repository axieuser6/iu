import React from 'react';

interface StatusIndicatorsProps {
  isConnected: boolean;
  isSecureConnection: boolean;
  isSpeaking: boolean;
}

const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  isConnected,
  isSecureConnection,
  isSpeaking
}) => {
  if (!isConnected) return null;

  return (
    <div className="flex items-center justify-center space-x-3 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6">
      <div className="flex items-center space-x-2 text-emerald-600">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-xs sm:text-sm lg:text-base font-medium">
          {isSecureConnection ? 'Säker anslutning' : 'Ansluten'}
        </span>
      </div>
      {isSpeaking && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm lg:text-base font-medium">AI talar</span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicators;