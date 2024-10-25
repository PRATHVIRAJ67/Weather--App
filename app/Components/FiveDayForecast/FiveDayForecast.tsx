import { useGlobalContext } from "@/app/context/globalContext";
import { calender } from "@/app/utils/Icons";
import { kelvinToCelsius, unixToDay } from "@/app/utils/misc";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect } from "react";


interface DailyData {
  main: {
    temp_min: number;
    temp_max: number;
  };
  dt: number;
}

interface FiveDayForecastData {
  city: {
    name: string;
  };
  list: DailyData[];
}


interface ProcessedForecast {
  day: string;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
}

function FiveDayForecast() {
  const { fiveDayForecast } = useGlobalContext();

  if (!fiveDayForecast || !fiveDayForecast.city || !fiveDayForecast.list) {
    return <Skeleton className="h-[12rem] w-full" />;
  }

  const processData = (dailyData: DailyData[]): ProcessedForecast => {
    let minTemp = Number.MAX_VALUE;
    let maxTemp = Number.MIN_VALUE;

    dailyData.forEach((day) => {
      if (day.main.temp_min < minTemp) {
        minTemp = day.main.temp_min;
      }
      if (day.main.temp_max > maxTemp) {
        maxTemp = day.main.temp_max;
      }
    });

    const minCelsius = kelvinToCelsius(minTemp);
    const maxCelsius = kelvinToCelsius(maxTemp);
    const avgTemp = (minCelsius + maxCelsius) / 2;

    return {
      day: unixToDay(dailyData[0].dt),
      minTemp: parseFloat(minCelsius.toFixed(1)),
      maxTemp: parseFloat(maxCelsius.toFixed(1)),
      avgTemp: parseFloat(avgTemp.toFixed(1)),
    };
  };

  // Define the type of dailyForecasts explicitly
  const dailyForecasts: ProcessedForecast[] = [];

  for (let i = 0; i < fiveDayForecast.list.length; i += 8) {
    const dailyData = fiveDayForecast.list.slice(i, i + 8);
    if (dailyData.length) {
      dailyForecasts.push(processData(dailyData));
    }
  }

  useEffect(() => {
    localStorage.setItem("averageData", JSON.stringify(dailyForecasts));
  }, [dailyForecasts]);

  return (
    <div
      className="pt-6 pb-5 px-4 flex-1 border rounded-lg flex flex-col
        justify-between dark:bg-dark-grey shadow-sm dark:shadow-none"
    >
      <div>
        <h2 className="flex items-center gap-2 font-medium">
          {calender} 5-Day Forecast for {fiveDayForecast.city.name}
        </h2>

        <div className="forecast-list pt-3">
          {dailyForecasts.map((day, i) => {
            return (
              <div
                key={i}
                className="daily-forecast py-4 flex flex-col justify-evenly border-b-2"
              >
                <p className="text-xl min-w-[3.5rem]">{day.day}</p>
                <p className="text-sm flex justify-between">
                  <span>(low)</span>
                  <span>(high)</span>
                </p>

                <div className="flex-1 flex items-center justify-between gap-4">
                  <p className="font-bold">{day.minTemp}°C</p>
                  <div className="temperature flex-1 w-full h-2 rounded-lg bg-gray-300"></div>
                  <p className="font-bold">{day.maxTemp}°C</p>
                </div>

                <p className="text-sm text-gray-500">
                  Average Temperature:{" "}
                  <span className="font-bold">{day.avgTemp}°C</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FiveDayForecast;
