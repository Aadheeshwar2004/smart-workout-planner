import { useEffect, useState } from 'react';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { workoutsAPI, metricsAPI } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Workout, UserMetrics, StreakData, Reward } from '@/types';
import { format } from 'date-fns';

export default function Overview({ user }: { user: any }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0 });
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsRes, metricsRes, streakRes, rewardsRes] = await Promise.all([
        workoutsAPI.getAll(0, 30),
        metricsAPI.get().catch(() => ({ data: null })),
        workoutsAPI.getStreak(),
        workoutsAPI.getRewards(),
      ]);
      setWorkouts(workoutsRes.data);
      setMetrics(metricsRes.data);
      setStreak(streakRes.data);
      setRewards(rewardsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = workouts.reduce((sum, w) => sum + w.calories_burned, 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);

  const chartData = workouts.slice(0, 7).reverse().map(w => ({
    date: format(new Date(w.date), 'MM/dd'),
    calories: w.calories_burned,
    duration: w.duration,
  }));

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{streak.current_streak}</p>
              <p className="text-gray-500 text-xs mt-1">days</p>
            </div>
            <Flame className="text-orange-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Workouts</p>
              <p className="text-3xl font-bold text-blue-600">{workouts.length}</p>
              <p className="text-gray-500 text-xs mt-1">completed</p>
            </div>
            <Trophy className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Calories Burned</p>
              <p className="text-3xl font-bold text-green-600">{totalCalories.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-1">kcal</p>
            </div>
            <TrendingUp className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Time</p>
              <p className="text-3xl font-bold text-purple-600">{totalMinutes}</p>
              <p className="text-gray-500 text-xs mt-1">minutes</p>
            </div>
            <Calendar className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Workout Progress (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Rewards</h2>
          <div className="space-y-3">
            {rewards.slice(0, 5).map(reward => (
              <div key={reward.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Trophy className="text-yellow-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-sm">{reward.title}</p>
                  <p className="text-xs text-gray-600">{reward.description}</p>
                </div>
              </div>
            ))}
            {rewards.length === 0 && (
              <p className="text-gray-500 text-center py-8">No rewards yet. Keep working out!</p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Your Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">BMI</p>
              <p className="text-2xl font-bold">{metrics.bmi}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Weight</p>
              <p className="text-2xl font-bold">{metrics.weight} kg</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Body Fat</p>
              <p className="text-2xl font-bold">{metrics.body_fat_percentage}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Muscle Mass</p>
              <p className="text-2xl font-bold">{metrics.skeletal_muscle_mass} kg</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}