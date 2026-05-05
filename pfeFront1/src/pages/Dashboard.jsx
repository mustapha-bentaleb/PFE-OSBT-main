import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CardTShirt from '../components/CardTShirt';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [tshirts, setTshirts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTShirts = useCallback(async () => {
    try {
      const response = await api.get('/tshirts/all');
      setTshirts(response.data);
    } catch (error) {
      console.error('Error fetching t-shirts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTShirts();
  }, [fetchAllTShirts]);

  const handleTshirtUpdate = useCallback((updated) => {
    setTshirts((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
    );
  }, []);

  const myCount = user
    ? tshirts.filter((t) => t.owner?.username === user.username).length
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

      <div className="card">
        <div className="card-body flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>
            <h1 className="text-2xl font-extrabold text-brand-ink">{user?.username}</h1>

            <p className="text-sm text-brand-muted">{user?.email}</p>

            <p className="text-sm mt-2 text-brand-ink/80">
              Role: <span className="font-semibold">{user?.isAdmin ? 'Admin' : 'User'}</span>
            </p>
          </div>

          <button onClick={logout} className="btn-ghost">
            Sign out
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="card">
          <div className="card-body">
            <p className="text-brand-muted text-sm">All designs</p>
            <p className="text-3xl font-extrabold text-brand-ink mt-2">{tshirts.length}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="text-brand-muted text-sm">My designs</p>
            <p className="text-3xl font-extrabold text-brand-ink mt-2">{myCount}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="text-brand-muted text-sm">Account</p>
            <p className="text-lg font-bold text-brand-ink mt-2">
              {user?.isAdmin ? 'Administrator' : 'Standard user'}
            </p>
            <p className="text-xs text-brand-muted mt-1">Permissions and access level</p>
          </div>
        </div>

      </div>

      <div className="card">

        <div className="card-header">
          <h2 className="text-xl font-extrabold text-brand-ink">Marketplace</h2>
          <p className="text-sm text-brand-muted mt-1">
            Browse designs, preview details, and like your favorites for quick access.
          </p>
        </div>

        <div className="card-body">
          {tshirts.length === 0 ? (
            <p className="text-brand-muted">No designs available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch">

              {tshirts.map((tshirt) => (
                <CardTShirt
                  key={tshirt.id}
                  tshirt={tshirt}
                  variant="dashboard"
                  showLike
                  onTshirtUpdate={handleTshirtUpdate}
                />
              ))}

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
