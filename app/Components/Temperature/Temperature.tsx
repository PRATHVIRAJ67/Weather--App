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
  const { main, timezone, name, weather } = forecast; // 'name' is the city name

  if (!forecast || !weather) {
    return <div>Loading...</div>;
  }

  const temp = kelvinToCelsius(main?.temp);
  const minTemp = kelvinToCelsius(main?.temp_min);
  const maxTemp = kelvinToCelsius(main?.temp_max);

  // State
  const [localTime, setLocalTime] = useState<string>("");
  const [currentDay, setCurrentDay] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

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

  // Live time update
  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      const localMoment = moment().utcOffset(timezone / 60);
      // custom format: 24-hour format
      const formattedTime = localMoment.format("HH:mm:ss");
      // day of the week
      const day = localMoment.format("dddd");

      setLocalTime(formattedTime);
      setCurrentDay(day);
    }, 1000);

    // Clear interval
    return () => clearInterval(interval);
  }, [timezone]);

  // Send email continuously every 15 seconds once the email is saved
  useEffect(() => {
    if (inputEmail) {
      const interval = setInterval(() => {
        axios.post('/api/SendAlert', { email: inputEmail, temperature: temp, city: name })
          .then(response => {
            console.log("Email sent: ", response.data.message);
          })
          .catch(error => {
            console.error('Error sending alert:', error.message);
          });
      }, 15000); // Send email every 15 seconds

      // Clear interval on unmount
      return () => clearInterval(interval);
    }
  }, [inputEmail, temp, name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add functionality to handle the input email, e.g., send an alert
    axios.post('/api/SendAlert', { email: inputEmail, temperature: temp, city: name })
      .then(response => {
        setMessage("Email address added Sucessfully");
        setTimeout(() => setMessage(""), 5000);
      })
      .catch(error => {
        setMessage("Failed to add Email addresss. Please try again.");
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
          placeholder="Please add u r email address"
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
        <span>{name}</span> {/* Displaying the city name */}
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
