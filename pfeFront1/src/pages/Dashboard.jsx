import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CardTShirt from '../components/CardTShirt';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [tshirts, setTshirts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await api.get("/tshirts/all");
        setTshirts(response.data);
      } catch (error) {
        console.error('Error fetching profile tshirts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

      {/* HEADER PROFILE */}
      <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.username}
          </h1>

          <p className="text-sm text-gray-500">
            {user?.email}
          </p>

          <p className="text-sm mt-1">
            Role: {user?.isAdmin ? 'Admin' : 'User'}
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total T-Shirts</p>
          <p className="text-xl font-bold">{tshirts.length}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Account Type</p>
          <p className="text-xl font-bold">
            {user?.isAdmin ? 'Administrator' : 'Standard User'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Status</p>
          <p className="text-xl font-bold text-green-600">
            Active
          </p>
        </div>

      </div>

      {/* T-SHIRTS SECTION */}
      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-xl font-bold mb-4">
          My T-Shirts
        </h2>

        {tshirts.length === 0 ? (
          <p className="text-gray-500">
            You don't have any T-Shirts yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {tshirts.map((tshirt) => (
              <CardTShirt
                key={tshirt.id}
                tshirt={tshirt}
              />
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Dashboard;