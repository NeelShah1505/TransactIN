import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!req.url) {
    return NextResponse.json(
      { message: "URL is not defined" },
      { status: 400 }
    );
  }
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";

  const client = await MongoClient.connect(
    process.env.NEXT_PUBLIC_MONGODB_URI as string
  );
  const db = client.db();
  const collection = db.collection("transactions");

  try {
    const query: any = {}; // Use a more specific type if you can define it

    query.$and = [
      { $or: [{ senderAddress: address }, { receiverAddress: address }] },
      // { $or: [{ status: "inititated" }, { status: "approved" }] },
    ];

    // else if (type === "received") {
    //   query.receiverAddress = address;
    //   query.$or = [{ status: "inititated" }, { status: "approved" }];
    // } else if (type === "history") {
    //   query.$and = [
    //     { $or: [{ senderAddress: address }, { receiverAddress: address }] },
    //     { $or: [{ status: "completed" }, { status: "rejected" }] },
    //   ];
    // }

    const transactions = await collection.find(query).toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching transactions", error },
      { status: 500 }
    );
  } finally {
    await client.close(); // Ensure client.close() is awaited
  }
}
