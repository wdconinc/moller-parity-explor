import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, SignOut, Warning, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useConnection } from '@/contexts/ConnectionContext';

interface DatabaseInfo {
  name: string;
  size?: string;
  owner?: string;
  encoding?: string;
}

interface DatabaseListProps {
  username: string;
  password: string;
  onLogout: () => void;
  onSelectDatabase: (dbName: string) => void;
}

export function DatabaseList({ username, password, onLogout, onSelectDatabase }: DatabaseListProps) {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const connection = useConnection();

  useEffect(() => {
    fetchDatabases();
  }, [username, password]);

  const fetchDatabases = async () => {
    setIsLoading(true);
    setError(null);
    connection.setStatus('connecting');
    connection.setOperation('fetching_databases', 'Retrieving database list from server');

    try {
      const response = await fetch('https://db.moller12gev.org/api/databases', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your credentials.');
        }
        throw new Error(`Failed to fetch databases: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data.databases)) {
        setDatabases(data.databases);
      } else if (Array.isArray(data)) {
        setDatabases(data);
      } else {
        setDatabases([
          { name: 'moller_parity', owner: 'postgres', encoding: 'UTF8' },
          { name: 'moller_tracking', owner: 'postgres', encoding: 'UTF8' },
          { name: 'moller_slow_controls', owner: 'postgres', encoding: 'UTF8' },
        ]);
      }
      
      connection.setStatus('connected');
      connection.setOperation('idle');
      connection.updateActivity();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to database server';
      setError(errorMessage);
      connection.setError(errorMessage);
      toast.error(errorMessage);
      
      setDatabases([
        { name: 'moller_parity', owner: 'postgres', encoding: 'UTF8' },
        { name: 'moller_tracking', owner: 'postgres', encoding: 'UTF8' },
        { name: 'moller_slow_controls', owner: 'postgres', encoding: 'UTF8' },
      ]);
      
      connection.setOperation('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    connection.setStatus('disconnected');
    connection.setOperation('idle');
    connection.setConnectedDatabase(undefined);
    toast.success('Logged out successfully');
    onLogout();
  };

  const handleSelectDatabase = (dbName: string) => {
    connection.setConnectedDatabase(dbName);
    connection.updateActivity();
    onSelectDatabase(dbName);
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            oklch(0.7 0.15 65 / 0.05) 35px,
            oklch(0.7 0.15 65 / 0.05) 70px
          )`,
        }}
      />

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={40} weight="duotone" className="text-primary" />
              <div>
                <h1 className="text-3xl font-bold font-mono tracking-tight">
                  MOLLER Database Explorer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Connected as <span className="font-mono text-foreground">{username}</span> • db.moller12gev.org
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <SignOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Available Databases</h2>
            <p className="text-muted-foreground">
              Select a database to explore its schema and build queries
            </p>
          </div>

          {isLoading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center gap-4">
                <CircleNotch size={48} className="text-primary animate-spin" />
                <p className="text-muted-foreground">Loading databases...</p>
              </div>
            </Card>
          ) : error ? (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-3">
                <Warning size={24} className="text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Connection Warning</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing example databases. The actual database list will be fetched when the server is accessible.
                  </p>
                  <Button variant="outline" size="sm" onClick={fetchDatabases}>
                    Retry Connection
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          <div className="grid gap-4 mt-6">
            {databases.map((db) => (
              <Card
                key={db.name}
                className="p-6 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleSelectDatabase(db.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Database size={32} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono font-semibold mb-1">{db.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {db.owner && (
                          <Badge variant="secondary" className="text-xs">
                            Owner: {db.owner}
                          </Badge>
                        )}
                        {db.encoding && (
                          <Badge variant="secondary" className="text-xs">
                            {db.encoding}
                          </Badge>
                        )}
                        {db.size && (
                          <Badge variant="secondary" className="text-xs">
                            {db.size}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {databases.length === 0 && !isLoading && (
            <Card className="p-12">
              <div className="text-center">
                <Database size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Databases Found</h3>
                <p className="text-muted-foreground mb-4">
                  No databases are available for this account.
                </p>
                <Button onClick={fetchDatabases}>Refresh</Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
