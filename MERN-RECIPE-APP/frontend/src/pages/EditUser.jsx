import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/admin/users/${id}`);
        setUsername(res.data.username);
        setEmail(res.data.email);
        setLoading(false);
      } catch {
        setError("Failed to fetch user");
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${id}`, { username, email });
      navigate("/admin");
    } catch {
      setError("Failed to update user");
    }
  };

  if (loading) return <p className="text-green-300">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="ml-2 p-1 text-black"
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ml-2 p-1 text-black"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-green-600 text-black font-bold">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditUser;
