import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import bgImage from '../../assets/auth-bg.png';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (signUpError) {
          setMessage(signUpError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          const { id, email: userEmail } = data.user;

          // Insert extra profile info
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id,
              email: userEmail,
              name,
              organization: organization || null,
            },
          ]);

          if (profileError) {
            setMessage('Error saving profile info: ' + profileError.message);
            setLoading(false);
            return;
          }

          setMessage('✅ Check your email to confirm your signup');

          // Clear form fields after success
          setEmail('');
          setPassword('');
          setName('');
          setOrganization('');
        }
      } else {
        // Sign in user
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        const userEmail = data?.user?.email;

        // Clear form fields after successful sign in
        setEmail('');
        setPassword('');

        if (userEmail === 'nyamburadarlene6974@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-start px-4 md:px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Form Wrapper */}
      <div className="bg-white/80 p-8 rounded-lg shadow-md w-full max-w-md border border-black">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Create an Account' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />

          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Organization (optional)"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p
          className="mt-4 text-center text-sm text-pink-800 cursor-pointer font-bold"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Don’t have an account? Sign up'}
        </p>

        {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
      </div>
    </div>
  );
}
