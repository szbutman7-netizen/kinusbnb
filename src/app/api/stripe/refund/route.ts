import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret && !stripeSecret.includes("placeholder")
  ? new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as any })
  : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentIntentId, chargeId, amount, reason, shliachId } = body;

    if (!paymentIntentId && !chargeId) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or chargeId" },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured in live mode" },
        { status: 500 }
      );
    }

    const refundParams: Stripe.RefundCreateParams = {};
    if (paymentIntentId) refundParams.payment_intent = paymentIntentId;
    if (chargeId) refundParams.charge = chargeId;
    if (amount) refundParams.amount = Math.round(Number(amount) * 100); // convert USD to cents
    if (reason && ["duplicate", "fraudulent", "requested_by_customer"].includes(reason)) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    // If shliachId provided or found, update Firestore
    const targetShliachId = shliachId || refund.metadata?.shliachId;
    if (targetShliachId) {
      try {
        const shliachRef = doc(db, "shluchim", targetShliachId);
        const snap = await getDoc(shliachRef);
        if (snap.exists()) {
          const now = new Date().toISOString();
          await updateDoc(shliachRef, {
            paymentStatus: "REFUNDED",
            refundedAt: now,
            refundId: refund.id,
            refundAmount: refund.amount / 100,
            updatedAt: now,
          });
        }
      } catch (dbErr) {
        console.error("Error updating Firestore on refund:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    });
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
