import { createContext, useContext, useState, ReactNode } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
export type OperationType = 'idle' | 'fetching_databases' | 'fetching_schema' | 'executing_query' | 'loading_relationships' | 'loading_examples';

interface ConnectionState {
  status: ConnectionStatus;
  currentOperation: OperationType;
  operationDetails?: string;
  lastError?: string;
  serverUrl: string;
  connectedDatabase?: string;
  lastActivity?: Date;
}

interface ConnectionContextValue extends ConnectionState {
  setStatus: (status: ConnectionStatus) => void;
  setOperation: (operation: OperationType, details?: string) => void;
  setError: (error: string) => void;
  setConnectedDatabase: (database: string | undefined) => void;
  clearError: () => void;
  updateActivity: () => void;
}

const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>({
    status: 'disconnected',
    currentOperation: 'idle',
    serverUrl: 'db.moller12gev.org',
  });

  const setStatus = (status: ConnectionStatus) => {
    setState((prev) => ({ ...prev, status, lastActivity: new Date() }));
  };

  const setOperation = (operation: OperationType, details?: string) => {
    setState((prev) => ({
      ...prev,
      currentOperation: operation,
      operationDetails: details,
      lastActivity: new Date(),
    }));
  };

  const setError = (error: string) => {
    setState((prev) => ({
      ...prev,
      status: 'error',
      lastError: error,
      lastActivity: new Date(),
    }));
  };

  const setConnectedDatabase = (database: string | undefined) => {
    setState((prev) => ({ ...prev, connectedDatabase: database }));
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, lastError: undefined }));
  };

  const updateActivity = () => {
    setState((prev) => ({ ...prev, lastActivity: new Date() }));
  };

  const value: ConnectionContextValue = {
    ...state,
    setStatus,
    setOperation,
    setError,
    setConnectedDatabase,
    clearError,
    updateActivity,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return context;
}
