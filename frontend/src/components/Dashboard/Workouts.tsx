
import { useEffect, useState } from "react";
import { Plus, Clock, Flame, Edit2, Trash2, Calendar } from "lucide-react";
import { workoutsAPI } from "@/services/api";
import toast from "react-hot-toast";
import type { Workout } from "@/types";
import { format, isToday } from "date-fns";

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [todayWorkoutsCount, setTodayWorkoutsCount] = useState(0);
  const [workoutData, setWorkoutData] = useState({
    workout_type: "",
    duration: 30,
    intensity: "moderate",
    calories_burned: 200,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [customWorkout, setCustomWorkout] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    loadWorkouts();
    checkTodayWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const { data } = await workoutsAPI.getAll();
      setWorkouts(data);
    } catch {
      toast.error("Failed to load workouts");
    }
  };

  const checkTodayWorkouts = async () => {
    try {
      const { data } = await workoutsAPI.getTodayWorkout();
      setTodayWorkoutsCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setTodayWorkoutsCount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate workout type
    const finalWorkoutType = isCustom ? customWorkout.trim() : workoutData.workout_type;
    if (!finalWorkoutType) {
      toast.error("Please enter a workout type");
      return;
    }
    
    setLoading(true);

    const payload = {
      ...workoutData,
      workout_type: finalWorkoutType
    };

    try {
      if (editingWorkout) {
        await workoutsAPI.update(editingWorkout.id, payload);
        toast.success("Workout updated successfully! 💪");
      } else {
        await workoutsAPI.create(payload);
        toast.success("Workout logged successfully! 💪");
      }
      
      setShowModal(false);
      setEditingWorkout(null);
      resetForm();
      loadWorkouts();
      checkTodayWorkouts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save workout");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    
    // Check if workout type is in predefined list
    const predefinedTypes = ["Running", "Cycling", "Swimming", "Walking", "Gym", "Yoga", "Sports"];
    const isPredefined = predefinedTypes.includes(workout.workout_type);
    
    setIsCustom(!isPredefined);
    
    setWorkoutData({
      workout_type: isPredefined ? workout.workout_type : "",
      duration: workout.duration,
      intensity: workout.intensity,
      calories_burned: workout.calories_burned,
      notes: workout.notes || ""
    });
    
    if (!isPredefined) {
      setCustomWorkout(workout.workout_type);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      await workoutsAPI.delete(id);
      toast.success("Workout deleted");
      loadWorkouts();
      checkTodayWorkouts();
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  const resetForm = () => {
    setWorkoutData({
      workout_type: "",
      duration: 30,
      intensity: "moderate",
      calories_burned: 200,
      notes: ""
    });
    setCustomWorkout("");
    setIsCustom(false);
  };

  const openNewWorkoutModal = () => {
    setEditingWorkout(null);
    resetForm();
    setShowModal(true);
  };

  const workoutTypes = ["Running", "Cycling", "Swimming", "Walking", "Gym", "Yoga", "Sports"];
  const intensities = ["low", "moderate", "high"];

  // Group workouts by date
  const groupedWorkouts: { [key: string]: Workout[] } = {};
  workouts.forEach(workout => {
    const dateKey = format(new Date(workout.date), "yyyy-MM-dd");
    if (!groupedWorkouts[dateKey]) {
      groupedWorkouts[dateKey] = [];
    }
    groupedWorkouts[dateKey].push(workout);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
        <button
          onClick={openNewWorkoutModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Log Workout
        </button>
      </div>

      {/* Today's Status */}
      {todayWorkoutsCount > 0 ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ You've logged {todayWorkoutsCount} workout{todayWorkoutsCount > 1 ? 's' : ''} today! Keep up the great work! 🔥
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Don't forget to log your workout today to maintain your streak!
          </p>
        </div>
      )}

      {/* Workout History - Grouped by Date */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Workout History</h2>

        {Object.keys(groupedWorkouts).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No workouts logged yet. Start your journey today!</p>
          </div>
        ) : (
          Object.entries(groupedWorkouts)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([dateKey, dayWorkouts]) => {
              const workoutDate = new Date(dateKey);
              const isTodayDate = isToday(workoutDate);

              return (
                <div key={dateKey} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={20} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">
                      {format(workoutDate, "EEEE, MMMM d, yyyy")}
                      {isTodayDate && (
                        <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          Today
                        </span>
                      )}
                    </h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {dayWorkouts.length} workout{dayWorkouts.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900">
                              {workout.workout_type}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(workout.date), "h:mm a")}
                            </p>
                            <div className="flex gap-6 mt-3">
                              <div className="flex items-center gap-2">
                                <Clock size={18} className="text-gray-600" />
                                <span className="text-sm">{workout.duration} min</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Flame size={18} className="text-orange-600" />
                                <span className="text-sm">{workout.calories_burned} kcal</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm px-2 py-1 rounded ${
                                  workout.intensity === 'high' ? 'bg-red-100 text-red-800' :
                                  workout.intensity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {workout.intensity}
                                </span>
                              </div>
                            </div>
                            {workout.notes && (
                              <p className="mt-3 text-sm italic text-gray-600">{workout.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(workout)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit workout"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(workout.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete workout"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingWorkout ? "Edit Workout" : "Log New Workout"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workout Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Workout Type</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustom(false);
                        setCustomWorkout("");
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg border ${
                        !isCustom ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      Predefined
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustom(true);
                        setWorkoutData({ ...workoutData, workout_type: "" });
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg border ${
                        isCustom ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {!isCustom ? (
                    <select
                      value={workoutData.workout_type}
                      onChange={(e) => setWorkoutData({ ...workoutData, workout_type: e.target.value })}
                      className="w-full border p-2 rounded"
                      required
                    >
                      <option value="">Select workout type</option>
                      {workoutTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customWorkout}
                      onChange={(e) => setCustomWorkout(e.target.value)}
                      placeholder="e.g., Bench Press, Deadlifts, Basketball"
                      className="w-full border p-2 rounded"
                      required
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={workoutData.duration}
                  onChange={(e) => setWorkoutData({ ...workoutData, duration: Number(e.target.value) })}
                  className="w-full border p-2 rounded"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Intensity</label>
                <select
                  value={workoutData.intensity}
                  onChange={(e) => setWorkoutData({ ...workoutData, intensity: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  {intensities.map((i) => (
                    <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Calories Burned</label>
                <input
                  type="number"
                  value={workoutData.calories_burned}
                  onChange={(e) => setWorkoutData({ ...workoutData, calories_burned: Number(e.target.value) })}
                  className="w-full border p-2 rounded"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={workoutData.notes}
                  onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows={3}
                  placeholder="How did it feel? Sets x Reps @ Weight, etc."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWorkout(null);
                    resetForm();
                  }}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingWorkout ? "Update" : "Save Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
