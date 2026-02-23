import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(username, password);
        if (success) {
            toast({
                title: "Success",
                description: "Logged in successfully",
            });
            navigate('/dashboard');
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid credentials. Use admin / admin",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center space-y-4 mb-8">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to access the platform
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In
                    </Button>
                </form>
                <div className="text-center mt-4 text-xs text-muted-foreground">
                    Demo Credentials: admin / admin
                </div>
            </div>
        </div>
    );
}
