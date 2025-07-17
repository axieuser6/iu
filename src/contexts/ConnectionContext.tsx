import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConnectionContextType {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  isSecureConnection: boolean;
  setIsSecureConnection: (secure: boolean) => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

interface ConnectionProviderProps {
  children: ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSecureConnection, setIsSecureConnection] = useState(false);

  return (
    <ConnectionContext.Provider value={{
      isConnected,
      setIsConnected,
      isSecureConnection,
      setIsSecureConnection
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};