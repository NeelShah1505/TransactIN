import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

interface UpdateTransactionRequest {
  TransactionId: string;
  status: string;
  transectionDate: string;
  TransactionHash: string;
}

export async function PUT(req: Request) {
  const {
    TransactionId,
    status,
    transectionDate,
    TransactionHash,
  }: UpdateTransactionRequest = await req.json();

  // Connect to MongoDB
  const client = await MongoClient.connect(
    process.env.NEXT_PUBLIC_MONGODB_URI as string
  );
  const db = client.db();
  const collection = db.collection("transactions");

  try {
    // Find the transaction by TransactionId and update it
    const updateResult = await collection.updateOne(
      { TransactionId }, // Filter by TransactionId
      {
        $set: {
          status,
          transectionDate,
          TransactionHash,
        },
      }
    );

    // Check if the transaction was successfully updated
    if (updateResult.modifiedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          message:
            "No transaction found with the given ID or no changes were made.",
        }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Transaction updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: "Error updating transaction",
        error: (error as Error).message, // Type assertion for better error handling
      }),
      { status: 500 }
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
