import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">

      <h1 className="text-4xl font-bold mb-6">
        Welcome to OSBT
      </h1>

      <p className="text-gray-600 mb-8">
        Sign in to access your dashboard, manage your profile, and explore available offers.
      </p>

      <div className="flex gap-4">

        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign in
        </Link>

        <Link
          to="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Create account
        </Link>

      </div>

    </div>
  );
};

export default Home;