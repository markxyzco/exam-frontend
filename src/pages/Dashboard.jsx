import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/current_user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data));

    fetch(`${import.meta.env.VITE_BACKEND_URL}/tests`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setTests(data));
  }, []);

  const handleAdminPanel = () => {
    navigate("/admin");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user ? (
        <div className="space-y-4">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          {/* ✅ List available tests */}
          <h2 className="text-xl mt-6 font-semibold">Available Tests</h2>
          {tests.length > 0 ? (
            tests.map((test) => (
              <Link
                key={test.id}
                to={`/test/${test.id}`}
                className="block bg-indigo-600 text-white px-4 py-2 rounded my-2 hover:bg-indigo-700"
              >
                Start {test.title}
              </Link>
            ))
          ) : (
            <p>No tests available.</p>
          )}

          {/* ✅ Admin Panel Access */}
          {user.role === "admin" && (
            <button
              className="ml-4 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleAdminPanel}
            >
              Go to Admin Panel
            </button>
          )}
        </div>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
}
