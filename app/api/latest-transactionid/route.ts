import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: Request) {
  const client = await MongoClient.connect(
    process.env.NEXT_PUBLIC_MONGODB_URI as string
  );
  const db = client.db();
  const collection = db.collection("transactions");

  try {
    const latestTransaction = await collection
      .find({})
      .sort({ TransactionId: -1 })
      .limit(1)
      .toArray();

    const latestTransactionId = latestTransaction[0]?.TransactionId ?? null; // Use optional chaining and nullish coalescing

    return new NextResponse(
      JSON.stringify({ TransactionId: latestTransactionId }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching transactions", error },
      { status: 500 }
    );
  } finally {
    client.close();
  }
}
