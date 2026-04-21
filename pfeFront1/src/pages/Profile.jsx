import { useState, useEffect } from 'react';
import api from '../api/axios';
import CardTShirt from '../components/CardTShirt';
import ProfileAvatar from '../components/ProfileAvatar';
import { useAuth } from '../context/AuthContext';
import { AVATAR_ICONS } from '../constants/avatarIcons';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tshirts, setTshirts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [icon, setIcon] = useState(user?.profileAvatarIcon || 'FaUserCircle');
  const [color, setColor] = useState(user?.profileAvatarColor || '#6366f1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.profileAvatarIcon) setIcon(user.profileAvatarIcon);
    if (user?.profileAvatarColor) setColor(user.profileAvatarColor);
  }, [user?.profileAvatarIcon, user?.profileAvatarColor]);

  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    const syncBalance = async () => {
      try {
        const { data } = await api.get('/wallet/balance');
        if (data?.balance != null) {
          updateUser({ balance: data.balance });
        }
      } catch {
        /* ignore */
      }
    };
    syncBalance();
  }, [updateUser]);

  useEffect(() => {
    const fetchMyTShirts = async () => {
      try {
        const response = await api.get('/tshirts/my');
        setTshirts(response.data);
      } catch (error) {
        console.error('Error fetching my tshirts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTShirts();
  }, []);

  const saveAvatar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/user/avatar', {
        profileAvatarIcon: icon,
        profileAvatarColor: color,
      });
      updateUser({
        profileAvatarIcon: data.profileAvatarIcon,
        profileAvatarColor: data.profileAvatarColor,
      });
      toast.success('تم حفظ الصورة الرمزية');
    } catch {
      toast.error('تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const redeem = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    try {
      const { data } = await api.post('/wallet/redeem', { code: redeemCode.trim() });
      if (data?.balance != null) {
        updateUser({ balance: data.balance });
      }
      setRedeemCode('');
      toast.success(data?.message || 'تم الشحن');
    } catch (err) {
      const m = err.response?.data;
      toast.error(typeof m === 'string' ? m : 'كود غير صالح أو مستخدم');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {user && (
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              icon={icon}
              color={color}
              size={72}
              initial={user.username}
              className="bg-gray-100 p-2 ring-gray-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <p className="mt-2 text-lg font-semibold text-amber-700 tabular-nums">
                الرصيد:{' '}
                {user.balance != null
                  ? `${Number(user.balance).toFixed(2)} د.م.`
                  : '—'}
              </p>
            </div>
          </div>

          <form
            onSubmit={redeem}
            className="flex-1 max-w-xl bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm space-y-3"
          >
            <h2 className="font-semibold text-gray-900">شحن الرصيد (كود بطاقة)</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              أكواد تجريبية لمرة واحدة: <span className="font-mono">4521</span> → 100،{' '}
              <span className="font-mono">7830</span> → 200، <span className="font-mono">1299</span> → 300،{' '}
              <span className="font-mono">5544</span> → 500، <span className="font-mono">9010</span> → 1000 د.م.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest"
                placeholder="0000"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <button
                type="submit"
                disabled={redeeming || redeemCode.length !== 4}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {redeeming ? '…' : 'شحن'}
              </button>
            </div>
          </form>

          <form
            onSubmit={saveAvatar}
            className="flex-1 max-w-xl bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4"
          >
            <h2 className="font-semibold text-gray-900">تخصيص الأفاتار</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">شكل الأيقونة</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {AVATAR_ICONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اللون</label>
                <input
                  type="color"
                  value={color?.startsWith('#') ? color : '#6366f1'}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 rounded border cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm text-gray-600 mb-1">رمز اللون (hex)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#RRGGBB"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ…' : 'حفظ الأفاتار'}
            </button>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">
        قمصاني
      </h2>

      {tshirts.length === 0 ? (
        <p className="text-gray-500">
          لا توجد قمصان بعد.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {tshirts.map((tshirt) => (
            <CardTShirt
              key={tshirt.id}
              tshirt={tshirt}
              variant="profile"
            />
          ))}

        </div>
      )}
    </div>
  );
};

export default Profile;
