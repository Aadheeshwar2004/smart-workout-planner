import { useEffect, useState } from "react";
import { Trash2, Send, BarChart3, Dumbbell } from "lucide-react";
import { adminAPI } from "@/services/api";
import toast from "react-hot-toast";
import type { User } from "@/types";
import UserWorkoutsModal from "./UserWorkoutModal";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showWorkoutsModal, setShowWorkoutsModal] = useState(false);

  const [notification, setNotification] = useState("");
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await adminAPI.getAllUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete user");
    }
  };

  const sendNotification = async () => {
    if (!selectedUser || !notification.trim()) return;

    try {
      await adminAPI.sendNotification(selectedUser.id, notification);
      toast.success("Notification sent!");
      setShowNotificationModal(false);
      setNotification("");
      setSelectedUser(null);
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const viewUserStats = async (user: User) => {
    setSelectedUser(user);
    setShowStatsModal(true);

    try {
      const { data } = await adminAPI.getUserStats(user.id);
      setUserStats(data);
    } catch {
      toast.error("Failed to load user stats");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

      {/* USERS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {/* STATS */}
                    <button
                      onClick={() => viewUserStats(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View stats"
                    >
                      <BarChart3 size={18} />
                    </button>

                    {/* WORKOUTS */}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowWorkoutsModal(true);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="View workouts"
                    >
                      <Dumbbell size={18} />
                    </button>

                    {/* NOTIFICATION */}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowNotificationModal(true);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Send notification"
                    >
                      <Send size={18} />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTIFICATION MODAL */}
      {showNotificationModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Send Notification to {selectedUser.username}
            </h2>

            <textarea
              value={notification}
              onChange={(e) => setNotification(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setNotification("");
                  setSelectedUser(null);
                }}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStatsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {selectedUser.username}'s Statistics
            </h2>

            {userStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm">Total Workouts</p>
                  <p className="text-2xl font-bold">{userStats.total_workouts}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm">Total Minutes</p>
                  <p className="text-2xl font-bold">{userStats.total_workout_minutes}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg col-span-2">
                  <p className="text-sm">Calories Burned</p>
                  <p className="text-2xl font-bold">{userStats.total_calories_burned}</p>
                </div>
              </div>
            ) : (
              <p>Loading stats...</p>
            )}

            <button
              onClick={() => {
                setShowStatsModal(false);
                setUserStats(null);
                setSelectedUser(null);
              }}
              className="mt-6 w-full bg-gray-200 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* WORKOUTS MODAL */}
      {showWorkoutsModal && selectedUser && (
        <UserWorkoutsModal
          user={selectedUser}
          onClose={() => {
            setShowWorkoutsModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
