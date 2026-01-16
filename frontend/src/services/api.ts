
import axios from "axios";
import type {
  User,
  UserMetrics,
  Workout,
  Notification,
  Reward,
  AIRecommendations,
  StreakData,
  Analytics,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================= AUTH ================= */
export const authAPI = {
  register: (data: { email: string; username: string; password: string; is_admin?: boolean }) =>
    api.post("/auth/register", data),

  login: (username: string, password: string) =>
    api.post(
      "/auth/login",
      new URLSearchParams({ username, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),

  getCurrentUser: () => api.get<User>("/auth/me"),
};

/* ================= METRICS ================= */
export const metricsAPI = {
  create: (data: Omit<UserMetrics, "bmi" | "body_fat_percentage" | "skeletal_muscle_mass">) =>
    api.post<UserMetrics>("/users/metrics", data),

  get: () => api.get<UserMetrics>("/users/metrics"),
};

/* ================= WORKOUTS ================= */
export const workoutsAPI = {
  create: (data: Omit<Workout, "id" | "date">) =>
    api.post<Workout>("/workouts", data),
  
  getAll: (skip = 0, limit = 100) =>
    api.get<Workout[]>(`/workouts?skip=${skip}&limit=${limit}`),
  
  getTodayWorkout: () =>
    api.get<Workout[]>("/workouts/today"), // Changed to return array
  
  update: (id: number, data: Omit<Workout, "id" | "date">) =>
    api.put<Workout>(`/workouts/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/workouts/${id}`),
  
  getStreak: () =>
    api.get<StreakData>("/streaks"),
  
  getRewards: () =>
    api.get<Reward[]>("/rewards"),
};
/* ================= AI ================= */
export const aiAPI = {
  getRecommendations: (prompt: string) =>
    api.post<AIRecommendations>("/ai/recommendations", { prompt }),

  analyzeProgress: (days = 30) =>
    api.get(`/ai/progress-analysis?days=${days}`),
};

/* ================= NOTIFICATIONS ================= */
export const notificationsAPI = {
  getAll: () => api.get<Notification[]>("/users/notifications"),
  markAsRead: (id: number) =>
    api.put(`/users/notifications/${id}/read`),
};

/* ================= ADMIN ================= */
export const adminAPI = {
  getAllUsers: () => api.get<User[]>("/admin/users"),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  sendNotification: (user_id: number, message: string) =>
    api.post("/admin/notifications", { user_id, message }),

  getAnalytics: () => api.get<Analytics>("/admin/analytics"),
  getUserStats: (id: number) => api.get(`/admin/users/${id}/stats`),

  // ✅ THIS is the new feature you added
  getUserWorkouts: (id: number) =>
    api.get(`/admin/users/${id}/workouts`),
};

export default api;
