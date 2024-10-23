import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// I HAVE USED MONGODB AS A DATABASE 
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGODB_URI as string); // Remove deprecated options
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
    }

    const dailyUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const dailyRes = await fetch(dailyUrl, {
      next: { revalidate: 3600 },
    });

    const dailyData = await dailyRes.json();

    // Store the data to MongoDB
    const client = await clientPromise;
    const db = client.db("Weather_Data"); 
    const collection = db.collection("FiveDay_Data");

    await collection.insertOne({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      dailyData,
      timestamp: new Date(),
    });

 
    return NextResponse.json(dailyData);
  } catch (error) {
    console.error("Error in getting daily data or saving to MongoDB", error);
    return NextResponse.json({ error: "Error in getting daily data" }, { status: 500 });
  }
}
