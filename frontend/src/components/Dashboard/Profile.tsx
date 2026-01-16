import { useEffect, useState } from 'react';
import { User, Mail, Calendar, Save } from 'lucide-react';
import { metricsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { UserMetrics } from '@/types';

export default function Profile({ user }: { user: any }) {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [formData, setFormData] = useState({
    height: 170,
    weight: 70,
    age: 25,
    gender: 'male',
    activity_level: 'moderate',
  });
  const [loading, setLoading] = useState(false);
  const [hasMetrics, setHasMetrics] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const { data } = await metricsAPI.get();
      setMetrics(data);
      setFormData({
        height: data.height,
        weight: data.weight,
        age: data.age,
        gender: data.gender,
        activity_level: data.activity_level,
      });
      setHasMetrics(true);
    } catch {
      setHasMetrics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await metricsAPI.create(formData);
      setMetrics(data);
      toast.success('Profile updated successfully!');
      setHasMetrics(true);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Light (exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (physical job + exercise)' },
  ];

  // ✅ BMI MESSAGE LOGIC
  const getBmiInsight = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        title: 'Underweight',
        message:
          'You are underweight. Focus on strength training, proper nutrition, and a calorie surplus diet.',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-700',
      };
    }

    if (bmi < 25) {
      return {
        title: 'Healthy BMI',
        message:
          'Great job! You have a healthy BMI. Maintain consistency with balanced workouts and nutrition.',
        color: 'bg-green-50 border-green-300 text-green-700',
      };
    }

    if (bmi < 30) {
      return {
        title: 'Overweight',
        message:
          'You are slightly overweight. Focus on fat-loss workouts, cardio, and controlled calorie intake.',
        color: 'bg-orange-50 border-orange-300 text-orange-700',
      };
    }

    return {
      title: 'Obese',
      message:
        'Your BMI is high. Start with low-impact workouts, build consistency, and consult a professional if needed.',
      color: 'bg-red-50 border-red-300 text-red-700',
    };
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      {/* ACCOUNT INFO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-semibold">{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FITNESS METRICS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Fitness Metrics</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Height (cm)"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: Number(e.target.value) })
              }
              className="border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: Number(e.target.value) })
              }
              className="border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: Number(e.target.value) })
              }
              className="border rounded-lg p-3"
            />

            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="border rounded-lg p-3"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <select
            value={formData.activity_level}
            onChange={(e) =>
              setFormData({ ...formData, activity_level: e.target.value })
            }
            className="border rounded-lg p-3 w-full"
          >
            {activityLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Update Metrics'}
          </button>
        </form>

        {/* CALCULATED METRICS */}
        {metrics && (
          <div className="mt-6 border-t pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">BMI</p>
                <p className="text-2xl font-bold">{metrics.bmi}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Body Fat %</p>
                <p className="text-2xl font-bold">
                  {metrics.body_fat_percentage}%
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Muscle Mass</p>
                <p className="text-2xl font-bold">
                  {metrics.skeletal_muscle_mass} kg
                </p>
              </div>
            </div>

            {/* ✅ BMI MESSAGE */}
            {(() => {
              const insight = getBmiInsight(metrics.bmi);
              return (
                <div className={`p-4 border rounded-xl ${insight.color}`}>
                  <p className="font-semibold">{insight.title}</p>
                  <p className="text-sm mt-1">{insight.message}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
