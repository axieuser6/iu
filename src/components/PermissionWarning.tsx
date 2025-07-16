import React from 'react';
import { MicOff } from 'lucide-react';

interface PermissionWarningProps {
  hasPermission: boolean | null;
}

const PermissionWarning: React.FC<PermissionWarningProps> = ({ hasPermission }) => {
  if (hasPermission !== false) return null;

  return (
    <div className="max-w-xs sm:max-w-md lg:max-w-lg mx-auto mb-4 sm:mb-6 px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start sm:items-center space-x-2 text-amber-800">
          <MicOff size={16} className="flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-xs sm:text-sm font-medium leading-relaxed">
            Mikrofonbehörighet krävs för att använda röstassistenten
          </span>
        </div>
      </div>
    </div>
  );
};

export default PermissionWarning;