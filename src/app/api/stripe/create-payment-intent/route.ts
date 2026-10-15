import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe if secret key is provided
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as any }) : null;

export async function POST(req: Request) {
  try {
    const { amount = 30, currency = "usd", shliachDetails } = await req.json();

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // cents
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          shliachName: `${shliachDetails?.firstName} ${shliachDetails?.lastName}`,
          email: shliachDetails?.email || "",
          city: shliachDetails?.city || "",
          passportOrId: shliachDetails?.passportOrId || "",
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    }

    // Demo / Development fallback mode
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
    return NextResponse.json({
      clientSecret: mockClientSecret,
      paymentIntentId: `pi_mock_${Date.now()}`,
      demoMode: true
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
