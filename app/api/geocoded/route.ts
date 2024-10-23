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
    const city = searchParams.get("search");

    if (!city) {
      return NextResponse.json(
        { error: "City name is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

 
    const res = await axios.get(url);
    const geocodedData = res.data;

    const client = await clientPromise;
    const db = client.db("Weather_Data"); 
    const collection = db.collection("geocoded_data");

    await collection.insertOne({
      city,
      geocodedData,
      timestamp: new Date(),
    });

    return NextResponse.json(geocodedData);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching geocoded data" },
      { status: 500 }
    );
  }
}