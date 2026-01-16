import { useEffect, useState } from "react";
import { adminAPI } from "@/services/api";

interface Props {
  user: any;
  onClose: () => void;
}

export default function UserWorkoutsModal({ user, onClose }: Props) {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUserWorkouts(user.id)
      .then(res => setWorkouts(res.data))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[700px] p-6">
        <h2 className="text-xl font-bold mb-4">
          {user.username}&apos;s Workouts
        </h2>

        {loading ? (
          <p className="text-center py-8">Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No workouts logged</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Workout</th>
                <th className="text-left p-2">Minutes</th>
                <th className="text-left p-2">Calories</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map(w => (
                <tr key={w.id} className="border-b">
                  <td className="p-2">{new Date(w.date).toLocaleDateString()}</td>
                  <td className="p-2">{w.workout_type}</td>
                  <td className="p-2">{w.duration}</td>
                  <td className="p-2">{w.calories_burned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
