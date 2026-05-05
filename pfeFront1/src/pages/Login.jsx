import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const result = await login(formData.username, formData.password);
    if (!result.success) {
      setLoading(false);
    }
  } catch (error) {
    setLoading(false);
  }
};


  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 card">
        <div className="card-header text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-brand-ink">Welcome back</h2>
          <p className="text-sm text-brand-muted">
            Sign in to continue.{' '}
            <Link to="/register" className="link">
              Create an account
            </Link>
          </p>
        </div>
        
        <form className="card-body space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                name="username"
                type="text"
                required
                className="input"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;