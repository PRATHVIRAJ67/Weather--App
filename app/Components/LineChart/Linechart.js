

"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function LineChartComponent() {
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
     
      const storedData = localStorage.getItem("averageData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
       
        const chartData = parsedData.map((day) => ({
          day: day.day, 
          avgTemp: day.avgTemp,
        }));
        setData(chartData);
      } else {
        setError("No average temperature data found.");
      }
    } catch (err) {
      setError("Failed to parse average temperature data.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No average temperature data available.</div>;
  }

  return (
    <div className="flex-1 border rounded-lg p-4 dark:bg-dark-grey shadow-sm dark:shadow-none">
      <h2 className="text-lg font-medium mb-4">5-Day Average Temperature</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            label={{
              value: "Temperature (°C)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgTemp"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartComponent;
