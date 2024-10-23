"use client";
import { useGlobalContext } from "@/app/context/globalContext";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function Temperature() {
  const { fiveDayForecast } = useGlobalContext();
  const { city, list } = fiveDayForecast;

  if (!fiveDayForecast || !city || !list) {
    return <Skeleton className="h-[12rem] w-full" />;
  }

  const currentTemp = list[0]?.main?.temp;

  return (
    <div className="pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none">
      <div className="top">
        <h2 className="flex items-center gap-2 font-medium">
          Current Temperature in Kelvin
        </h2>
        <p className="pt-4 text-2xl p-10">{currentTemp} °K</p>
      </div>
    </div>
  );
}

export default Temperature;
