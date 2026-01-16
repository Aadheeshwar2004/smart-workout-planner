export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export interface UserMetrics {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activity_level: string;
  bmi: number;
  body_fat_percentage: number;
  skeletal_muscle_mass: number;
}

export interface Workout {
  id: number;
  workout_type: string;
  duration: number;
  intensity: string;
  calories_burned: number;
  notes?: string;
  date: string;
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  earned_at: string;
}

// export interface AIRecommendations {
//   workout_plan: string;
//   diet_suggestions: string;
//   motivation: string;
//   context_used?: any;
// }
export interface AIRecommendations {
  ai_response: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export interface Analytics {
  total_users: number;
  total_workouts: number;
  active_users: number;
  average_workouts_per_user: number;
}



// export interface User {
//   id: number;
//   email: string;
//   username: string;
//   is_admin: boolean;
//   created_at: string;
// }

// export interface UserMetrics {
//   height: number;
//   weight: number;
//   age: number;
//   gender: string;
//   activity_level: string;
//   bmi: number;
//   body_fat_percentage: number;
//   skeletal_muscle_mass: number;
// }

// export interface Workout {
//   id: number;
//   workout_type: string;
//   duration: number;
//   intensity: string;
//   calories_burned: number;
//   notes?: string;
//   date: string;
// }

// export interface Notification {
//   id: number;
//   message: string;
//   is_read: boolean;
//   created_at: string;
// }

// export interface Reward {
//   id: number;
//   title: string;
//   description: string;
//   earned_at: string;
// }

// export interface AIRecommendations {
//   workout_plan: string;
//   diet_suggestions: string;
//   motivation: string;
//   context_used?: any;
// }

// export interface StreakData {
//   current_streak: number;
//   longest_streak: number;
// }

// export interface Analytics {
//   total_users: number;
//   total_workouts: number;
//   active_users: number;
//   average_workouts_per_user: number;
// }