import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe if secret key is provided
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as any }) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shliachDetails, childrenCount = 0 } = body;

    // Strict server-side fee calculation
    const baseFee = 30;
    const validatedChildrenCount = shliachDetails?.needsChildrenAccommodation
      ? Math.max(0, Number(childrenCount) || (shliachDetails.childrenNames?.length || 0))
      : 0;
    const calculatedAmount = baseFee + (validatedChildrenCount * 30); // in USD

    const shliachId = shliachDetails?.id || `shliach-${Date.now()}`;
    const shliachName = shliachDetails?.hebrewName || `${shliachDetails?.firstName || ""} ${shliachDetails?.lastName || ""}`.trim() || "הרב השליח";

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(calculatedAmount * 100), // cents
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          shliachId,
          shliachName,
          email: shliachDetails?.email?.trim()?.toLowerCase() || "",
          phone: shliachDetails?.phone || "",
          city: shliachDetails?.city || "",
          country: shliachDetails?.country || "",
          passportOrId: shliachDetails?.passportOrId || "",
          arrivalDate: shliachDetails?.arrivalDate || "2026-11-04",
          arrivalTime: shliachDetails?.arrivalTime || "12:00",
          departureDate: shliachDetails?.departureDate || "2026-11-09",
          departureTime: shliachDetails?.departureTime || "12:00",
          amountPaid: String(calculatedAmount),
          childrenCount: String(validatedChildrenCount),
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: calculatedAmount,
        currency: "usd",
      });
    }

    // Demo / Development fallback mode
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
    return NextResponse.json({
      clientSecret: mockClientSecret,
      paymentIntentId: `pi_mock_${Date.now()}`,
      amount: calculatedAmount,
      currency: "usd",
      demoMode: true,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
