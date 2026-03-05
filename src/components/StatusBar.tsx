import { useConnection } from '@/contexts/ConnectionContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Warning, Circle, CircleNotch } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

const operationLabels: Record<string, string> = {
  idle: 'Idle',
  fetching_databases: 'Fetching databases',
  fetching_schema: 'Loading schema',
  executing_query: 'Executing query',
  loading_relationships: 'Loading relationships',
  loading_examples: 'Loading examples',
};

export function StatusBar() {
  const {
    status,
    currentOperation,
    operationDetails,
    lastError,
    serverUrl,
    connectedDatabase,
    lastActivity,
  } = useConnection();

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} weight="fill" className="text-green-600" />;
      case 'connecting':
        return <CircleNotch size={16} weight="bold" className="text-yellow-600 animate-spin" />;
      case 'error':
        return <XCircle size={16} weight="fill" className="text-destructive" />;
      case 'disconnected':
        return <Circle size={16} weight="fill" className="text-muted-foreground" />;
      default:
        return <Circle size={16} weight="fill" className="text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-600/10 text-green-700 border-green-600/20';
      case 'connecting':
        return 'bg-yellow-600/10 text-yellow-700 border-yellow-600/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'disconnected':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOperationColor = () => {
    if (currentOperation === 'idle') {
      return 'bg-muted text-muted-foreground';
    }
    return 'bg-accent/10 text-accent-foreground border-accent/20';
  };

  const showWarning = status === 'error' && lastError;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm z-50">
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge variant="outline" className={getStatusColor()}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2 truncate">
              <span className="text-muted-foreground font-mono">{serverUrl}</span>
              {connectedDatabase && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {connectedDatabase}
                  </Badge>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              {currentOperation !== 'idle' && (
                <CircleNotch size={14} className="animate-spin text-accent" />
              )}
              <Badge variant="outline" className={getOperationColor()}>
                {operationLabels[currentOperation] || currentOperation}
              </Badge>
              {operationDetails && (
                <span className="text-muted-foreground truncate max-w-xs">
                  {operationDetails}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showWarning && (
              <div className="flex items-center gap-2 text-destructive">
                <Warning size={16} weight="fill" />
                <span className="truncate max-w-md">{lastError}</span>
              </div>
            )}

            {lastActivity && (
              <span className="text-muted-foreground whitespace-nowrap">
                Last activity: {formatDistanceToNow(lastActivity, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
