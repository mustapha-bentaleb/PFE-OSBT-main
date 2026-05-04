
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [podOrders, setPodOrders] = useState([]);
  const [podLoading, setPodLoading] = useState(true);
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.isAdmin) {
      navigate('/profile');
      return;
    }

    fetchUsers();
    fetchPodComplaints();
  }, [currentUser, navigate]);

  const fetchPodComplaints = async () => {
    setPodLoading(true);
    try {
      if (!currentUser?.isAdmin) {
        setPodOrders([]);
        return;
      }
      const { data } = await api.get('/admin/pod-complaints');
      setPodOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching POD complaints:', error);
    } finally {
      setPodLoading(false);
    }
  };

  const submitPodReply = async (e) => {
    e.preventDefault();
    if (!replyFor || !replyText.trim()) return;
    setReplyBusy(true);
    try {
      await api.put(`/admin/pod-orders/${replyFor}/respond`, { response: replyText.trim() });
      setReplyFor(null);
      setReplyText('');
      await fetchPodComplaints();
      alert('تم حفظ الرد');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'تعذر الحفظ');
    } finally {
      setReplyBusy(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await api.put(`/admin/users/${userId}/status`);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, ban: !user.ban }
          : user
      ));
    } catch (error) {
      console.error('Error changing user status:', error);
      if (error.response?.status === 403) {
        alert("Vous n'avez pas les droits d'administration");
      } else if (error.response?.status === 401) {
        alert("Session expirée, veuillez vous reconnecter");
        navigate('/login');
      } else {
        alert("Erreur lors du changement de statut");
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
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
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Admin Panel
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage system users
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={user.ban ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.ban ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.ban ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currentUser?.id !== user.id ? (
                          <button
                            onClick={() => handleStatusChange(user.id)}
                            disabled={actionLoading[user.id]}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                              user.ban 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                          >
                            {actionLoading[user.id] ? '...' : (user.ban ? 'Activate' : 'Ban')}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">(Vous)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            شكاوى طباعة عند الطلب
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            اطلع على رسائل الزبناء وأرسل الرد من هنا
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          {podLoading ? (
            <p className="text-gray-500">Loading complaints…</p>
          ) : podOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">لا توجد شكاوى مسجلة.</p>
          ) : (
            <ul className="space-y-6">
              {podOrders.map((o) => (
                <li key={o.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-mono text-gray-600">طلب #{o.id}</span>
                    <span className="text-gray-500">
                      {o.buyer?.username} · {o.complaintPhone && <span className="font-mono">{o.complaintPhone}</span>}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                    <span className="font-semibold text-amber-800">الشكوى:</span> {o.complaintText}
                  </p>
                  {o.adminResponse && (
                    <p className="mt-2 text-sm text-blue-900 whitespace-pre-wrap">
                      <span className="font-semibold">ردك السابق:</span> {o.adminResponse}
                    </p>
                  )}
                  {o.complaintText && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyFor(o.id);
                        setReplyText(o.adminResponse || '');
                      }}
                      className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {o.adminResponse ? 'تعديل الرد' : 'رد على الشكوى'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {replyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={submitPodReply}
            className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4"
          >
            <h4 className="font-semibold text-gray-900">رد على طلب #{replyFor}</h4>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[120px] text-sm"
              placeholder="نص الرد للزبون…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm text-gray-600"
                onClick={() => setReplyFor(null)}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={replyBusy}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {replyBusy ? '…' : 'إرسال الرد'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;