import { useState, useEffect } from 'react';
import api from '../api/axios';
import CardTShirt from '../components/CardTShirt';

const Profile = () => {

  const [tshirts, setTshirts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

      <h2 className="text-2xl font-bold mb-6">
        My T-Shirts
      </h2>

      {tshirts.length === 0 ? (
        <p className="text-gray-500">
          You don't have any T-Shirts yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {tshirts.map((tshirt) => (
            <CardTShirt
              key={tshirt.id}
              tshirt={tshirt}
            />
          ))}

        </div>
      )}
    </div>
  );
};

export default Profile;