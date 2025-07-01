import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">JEE Test Platform</h1>
      <Link to="/login" className="text-blue-500 underline mt-4 block">Login</Link>
    </div>
  );
}
