import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// I HAVE USED MONGODB AS A DATABASE 
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGODB_URI as string); 
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;


    const res = await axios.get(url);
    const pollutionData = res.data;

    
    const client = await clientPromise;
    const db = client.db("Weather_Data");
    const collection = db.collection("pollution_data");

  
    await collection.insertOne({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      pollutionData,
      timestamp: new Date(),
    });

    return NextResponse.json(pollutionData);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching pollution data" },
      { status: 500 }
    );
  }
}
