"use client";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import {
  clearSky,
  cloudy,
  drizzleIcon,
  navigation,
  rain,
  snow,
} from "@/app/utils/Icons";
import { kelvinToCelsius } from "@/app/utils/misc";
import moment from "moment";
import axios from "axios";

function Temperature() {
  const { forecast } = useGlobalContext();
  const { main, timezone, name, weather } = forecast; 

  if (!forecast || !weather) {
    return <div>Loading...</div>;
  }

  const temp = kelvinToCelsius(main?.temp);
  const minTemp = kelvinToCelsius(main?.temp_min);
  const maxTemp = kelvinToCelsius(main?.temp_max);

  const [localTime, setLocalTime] = useState<string>("");
  const [currentDay, setCurrentDay] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const { main: weatherMain, description } = weather[0];

  const getIcon = () => {
    switch (weatherMain) {
      case "Drizzle":
        return drizzleIcon;
      case "Rain":
        return rain;
      case "Snow":
        return snow;
      case "Clear":
        return clearSky;
      case "Clouds":
        return cloudy;
      default:
        return clearSky;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const localMoment = moment().utcOffset(timezone / 60);
      const formattedTime = localMoment.format("HH:mm:ss");
      const day = localMoment.format("dddd");

      setLocalTime(formattedTime);
      setCurrentDay(day);
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  // Every 15 second u will recieve a mail if u want u can update it to 35 
  useEffect(() => {
    if (inputEmail && temp > 25) {
      const interval = setInterval(() => {
        axios.post('/api/SendAlert', { email: inputEmail, temperature: temp, city: name })
          .then(response => {
            console.log("Alert email sent: ", response.data.message);
          })
          .catch(error => {
            console.error('Error sending alert:', error.message);
          });
      }, 15000); 

      return () => clearInterval(interval);
    }
  }, [inputEmail, temp, name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('/api/SendAlert', { email: inputEmail, temperature: temp, city: name })
      .then(response => {
        setMessage("Email address added successfully.");
        setTimeout(() => setMessage(""), 5000);
      })
      .catch(error => {
        setMessage("Failed to add email address. Please try again.");
      });
  };

  return (
    <div
      className="pt-6 pb-5 px-4 border rounded-lg flex flex-col 
        justify-between dark:bg-dark-grey shadow-sm dark:shadow-none"
    >
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="email"
          value={inputEmail}
          onChange={handleInputChange}
          placeholder="Please add your email address"
          className="p-2 border rounded-md w-full mb-2"
        />
        <button
          type="submit"
          className="p-2 bg-red-500 text-white rounded-md w-full hover:bg-red-900"
        >
          Submit
        </button>
      </form>

      {message && <p className="text-center mb-4 font-medium">{message}</p>}

      <p className="flex justify-between items-center">
        <span className="font-medium">{currentDay}</span>
        <span className="font-medium">{localTime}</span>
      </p>
      <p className="pt-2 font-bold flex gap-1">
        <span>{name}</span> {}
        <span>{navigation}</span>
      </p>
      <p className="py-10 text-9xl font-bold self-center">{temp}°</p>

      <div>
        <div>
          <span>{getIcon()}</span>
          <p className="pt-2 capitalize text-lg font-medium">{description}</p>
        </div>
        <p className="flex items-center gap-2">
          <span>Low: {minTemp}°</span>
          <span>High: {maxTemp}°</span>
        </p>
      </div>
    </div>
  );
}

export default Temperature;
