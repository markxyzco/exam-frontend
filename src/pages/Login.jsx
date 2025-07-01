import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if already logged in
    axios.get('http://localhost:5000/auth/current_user', { withCredentials: true })
      .then(res => {
        if (res.data) setUser(res.data);
      });
  }, []);

  const handleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  const handleLogout = () => {
    window.open('http://localhost:5000/auth/logout', '_self');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Login to JEE Test Platform</h1>
      {user ? (
        <div className="flex flex-col items-center gap-2">
          <p>Welcome, {user.name}</p>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin} className="bg-blue-500 text-white px-6 py-3 rounded">Login with Google</button>
      )}
    </div>
  );
}
