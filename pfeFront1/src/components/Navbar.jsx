import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-brand-border" dir="ltr">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl grid place-items-center text-white shadow-glow"
                 style={{ background: 'linear-gradient(135deg, #e11d48 0%, #b45309 115%)' }}>
              <span className="font-black">O</span>
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-brand-ink group-hover:text-brand-red-800 transition-colors">
                OSBT
              </div>
              <div className="text-xs text-brand-muted -mt-0.5">Red · Gold · White</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink/80 hover:text-brand-ink hover:bg-white transition"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink/80 hover:text-brand-ink hover:bg-white transition"
                >
                  Profile
                </Link>
                <Link 
                  to="/messages" 
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink/80 hover:text-brand-ink hover:bg-white transition"
                >
                  Messages
                </Link>
                <Link 
                  to="/offers" 
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink/80 hover:text-brand-ink hover:bg-white transition"
                >
                  Offers
                </Link>
                <Link 
                  to="/print-on-demand" 
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-ink/80 hover:text-brand-ink hover:bg-white transition"
                >
                  Print on Demand
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-red-800 hover:text-brand-red-900 hover:bg-brand-red-50 transition"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn-ghost"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-3">
              <span className="badge-gold tabular-nums" title="الرصيد">
                {user.balance != null
                  ? `${Number(user.balance).toFixed(2)} د.م.`
                  : '—'}
              </span>
              <ProfileAvatar
                icon={user.profileAvatarIcon}
                color={user.profileAvatarColor}
                size={28}
                initial={user.username}
                className="bg-white p-1 border border-brand-border"
              />
              <span className="text-sm text-brand-muted">
                Welcome, <span className="font-semibold text-brand-ink">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn-ghost"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;