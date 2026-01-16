import { useEffect, useState } from "react";
import { workoutsAPI } from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function WorkoutVolumeChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    workoutsAPI.getAll().then(res => {
      const chartData = res.data
        .filter((w: any) => w.notes)
        .map((w: any) => {
          const reps = Number(w.notes.split("x")[1].split("@")[0]);
          const weight = Number(w.notes.split("@")[1].replace("kg", ""));
          return { name: w.workout_type, volume: reps * weight };
        });
      setData(chartData);
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
      <h2 className="text-xl font-bold mb-4">Workout Volume</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="volume" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
