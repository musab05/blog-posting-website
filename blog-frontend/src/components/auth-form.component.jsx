import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { SessionManager } from '@/common/SessionManager';
import { useAuth } from '../AuthProvider';

export function AuthForm({ type = 'signin', className, ...props }) {
  const { login } = useAuth();

  const isSignin = type === 'signin';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    toast.loading('Processing...');

    try {
      const endpoint = isSignin ? '/auth/signin' : '/auth/signup';
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + endpoint,
        formData
      );

      SessionManager.setItem('token', response.data.token);
      SessionManager.setItem('user', JSON.stringify(response.data.user));
      toast.dismiss();
      toast.success('Success! Redirecting...');
      login(response.data.token, response.data.user);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {isSignin ? 'Login to your account' : 'Create an account'}
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          {isSignin
            ? 'Enter your email below to login to your account'
            : 'Enter your details below to create a new account'}
        </p>
      </div>
      <div className="grid gap-6">
        {!isSignin && (
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {!isSignin && (
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Processing...' : isSignin ? 'Sign In' : 'Sign Up'}
        </Button>
      </div>
      <div className="text-center text-sm">
        {isSignin ? (
          <>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link to="/signin" className="underline underline-offset-4">
              Login
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
