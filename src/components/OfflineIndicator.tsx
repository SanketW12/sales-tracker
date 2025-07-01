import React from 'react';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide message after coming back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
      <div className={`rounded-xl shadow-lg border p-4 transition-all duration-300 ${
        isOnline 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-orange-50 border-orange-200 text-orange-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isOnline ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">
                {isOnline ? 'Back Online' : 'You\'re Offline'}
              </h4>
              {!isOnline && <AlertCircle className="w-4 h-4" />}
            </div>
            <p className="text-xs mt-1">
              {isOnline 
                ? 'Your data will sync automatically' 
                : 'Your data will be saved locally and synced when you\'re back online'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;