import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret && !stripeSecret.includes("placeholder")
  ? new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as any })
  : null;

export async function GET(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({
        charges: [],
        note: "Stripe secret key not configured or in mock mode",
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number(searchParams.get("limit")) || 50);

    const stripeCharges = await stripe.charges.list({
      limit,
    });

    const charges = stripeCharges.data.map((c) => ({
      id: c.id,
      amount: c.amount / 100,
      currency: c.currency.toUpperCase(),
      created: new Date(c.created * 1000).toISOString(),
      status: c.status,
      paid: c.paid,
      refunded: c.refunded,
      amountRefunded: (c.amount_refunded || 0) / 100,
      customerEmail: c.billing_details?.email || c.receipt_email || "",
      customerName: c.billing_details?.name || c.metadata?.shliachName || "",
      description: c.description || "",
      receiptUrl: c.receipt_url || null,
      paymentIntentId: typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id || null,
      metadata: c.metadata || {},
      cardBrand: c.payment_method_details?.card?.brand || "card",
      cardLast4: c.payment_method_details?.card?.last4 || "",
      wallet: c.payment_method_details?.card?.wallet?.type || null,
    }));

    return NextResponse.json({ charges });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Error fetching Stripe charges:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch charges from Stripe" },
      { status: 500 }
    );
  }
}
