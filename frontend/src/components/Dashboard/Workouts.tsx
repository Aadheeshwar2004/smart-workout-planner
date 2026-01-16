import { useEffect, useState } from "react";
import { Plus, Clock, Flame, Dumbbell } from "lucide-react";
import { workoutsAPI } from "@/services/api";
import toast from "react-hot-toast";
import type { Workout } from "@/types";
import { format } from "date-fns";

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [workoutMode, setWorkoutMode] = useState<"cardio" | "strength">("cardio");

  // CARDIO FORM
  const [cardioData, setCardioData] = useState({
    workout_type: "Running",
    duration: 30,
    intensity: "moderate",
    calories_burned: 200,
    notes: ""
  });

  // STRENGTH FORM
  const [strengthData, setStrengthData] = useState({
    exercise: "Bench Press",
    sets: 3,
    reps: 10,
    weight: 40,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const { data } = await workoutsAPI.getAll();
      setWorkouts(data);
    } catch {
      toast.error("Failed to load workouts");
    }
  };

  // 🔥 CALORIE CALCULATION (SAFE + SIMPLE)
  const calculateStrengthCalories = () => {
    return Math.round(strengthData.sets * strengthData.reps * strengthData.weight * 0.1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload =
      workoutMode === "strength"
        ? {
            workout_type: strengthData.exercise,
            duration: Math.round(strengthData.sets * 2), // ✅ MUST BE INT
            intensity: "moderate",
            calories_burned: calculateStrengthCalories(),
            notes: `${strengthData.sets}x${strengthData.reps} @ ${strengthData.weight}kg`,
          }
        : cardioData;

    try {
      await workoutsAPI.create(payload);
      toast.success("Workout logged successfully 💪");
      setShowModal(false);
      loadWorkouts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  const workoutTypes = ["Running", "Cycling", "Swimming", "Walking"];
  const intensities = ["low", "moderate", "high"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Log Workout
        </button>
      </div>

      {/* WORKOUT LIST */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white p-6 rounded-xl shadow border">
            <h3 className="font-semibold text-lg">{workout.workout_type}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(workout.date), "MMM dd, yyyy • h:mm a")}
            </p>

            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2">
                <Clock size={18} /> {workout.duration} min
              </div>
              <div className="flex items-center gap-2">
                <Flame size={18} /> {workout.calories_burned} kcal
              </div>
            </div>

            {workout.notes && (
              <p className="mt-3 text-sm italic text-gray-600">{workout.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Log New Workout</h2>

            {/* MODE SWITCH */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setWorkoutMode("cardio")}
                className={`flex-1 py-2 rounded-lg ${
                  workoutMode === "cardio" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                Cardio
              </button>
              <button
                onClick={() => setWorkoutMode("strength")}
                className={`flex-1 py-2 rounded-lg ${
                  workoutMode === "strength" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                Strength
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CARDIO */}
              {workoutMode === "cardio" && (
                <>
                  <select
                    value={cardioData.workout_type}
                    onChange={(e) =>
                      setCardioData({ ...cardioData, workout_type: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  >
                    {workoutTypes.map((w) => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={cardioData.duration}
                    onChange={(e) =>
                      setCardioData({ ...cardioData, duration: Number(e.target.value) })
                    }
                    placeholder="Duration (min)"
                    className="w-full border p-2 rounded"
                  />

                  <select
                    value={cardioData.intensity}
                    onChange={(e) =>
                      setCardioData({ ...cardioData, intensity: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  >
                    {intensities.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={cardioData.calories_burned}
                    onChange={(e) =>
                      setCardioData({
                        ...cardioData,
                        calories_burned: Number(e.target.value),
                      })
                    }
                    placeholder="Calories"
                    className="w-full border p-2 rounded"
                  />
                </>
              )}

              {/* STRENGTH */}
              {workoutMode === "strength" && (
                <>
                  <input
                    value={strengthData.exercise}
                    onChange={(e) =>
                      setStrengthData({ ...strengthData, exercise: e.target.value })
                    }
                    placeholder="Exercise (Bench Press)"
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={strengthData.sets}
                    onChange={(e) =>
                      setStrengthData({ ...strengthData, sets: Number(e.target.value) })
                    }
                    placeholder="Sets"
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={strengthData.reps}
                    onChange={(e) =>
                      setStrengthData({ ...strengthData, reps: Number(e.target.value) })
                    }
                    placeholder="Reps"
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={strengthData.weight}
                    onChange={(e) =>
                      setStrengthData({ ...strengthData, weight: Number(e.target.value) })
                    }
                    placeholder="Weight (kg)"
                    className="w-full border p-2 rounded"
                  />

                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Dumbbell size={16} />
                    Estimated calories: {calculateStrengthCalories()} kcal
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2"
                >
                  {loading ? "Saving..." : "Save Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
