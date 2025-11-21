import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  // Initialize Firebase Admin using your service account key
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY!);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function GET() {
  try {
    const snapshot = await db.collection("records").get();

    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching records:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}