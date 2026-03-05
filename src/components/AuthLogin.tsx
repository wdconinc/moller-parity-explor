import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, SignIn } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface AuthLoginProps {
  onAuthenticate: (username: string, password: string) => void;
}

export function AuthLogin({ onAuthenticate }: AuthLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      await onAuthenticate(username, password);
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
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
      
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <Database size={48} weight="duotone" className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight">
              MOLLER Database
            </h1>
            <p className="text-sm text-muted-foreground">
              db.moller12gev.org
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={isLoading}
          >
            <SignIn size={20} weight="bold" />
            {isLoading ? 'Connecting...' : 'Connect to Database'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Credentials are stored securely in your browser session
          </p>
        </div>
      </Card>
    </div>
  );
}
