import { useState, useEffect } from "react";
import { Pencil, Check, X, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmPassword, setConfirmPassword] = useState(""); // new state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // for mismatch error

  // Fetch profile info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUser(data);
        setFormData(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save updated profile
  const handleSave = async () => {
    setError("");

    // If password is being changed, validate it
    if (formData.password && formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();
      setUser(updatedUser.user);
      setFormData(updatedUser.user);
      setConfirmPassword(""); // clear confirm field
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">No profile data available.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Profile</h2>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Check size={20} />
            </button>
            <button
              onClick={() => {
                setFormData(user);
                setConfirmPassword("");
                setIsEditing(false);
                setError("");
              }}
              className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Pencil size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Other fields */}
        {["name", "email", "role"].map((field) => (
          <div key={field} className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 capitalize">
              {field}
            </label>
            {isEditing ? (
              <input
                type="text"
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
                disabled={field === "role"}
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            ) : (
              <p className="mt-1 px-3 py-2 bg-gray-100 rounded-lg">
                {user[field] || "Not Provided"}
              </p>
            )}
          </div>
        ))}

        {/* Password field with toggle */}
        <div className="flex flex-col relative">
          <label className="text-sm font-semibold text-gray-600">Password</label>
          {isEditing ? (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Enter new password"
                className="border border-gray-300 rounded-lg px-3 py-2 mt-1 pr-10 focus:ring-2 focus:ring-blue-400 outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ) : (
            <p className="mt-1 px-3 py-2 bg-gray-100 rounded-lg">••••••••</p>
          )}
        </div>

        {/* Confirm Password field */}
        {isEditing && (
          <div className="flex flex-col relative">
            <label className="text-sm font-semibold text-gray-600">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={`border rounded-lg px-3 py-2 mt-1 focus:ring-2 outline-none w-full 
                ${
                  error
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
