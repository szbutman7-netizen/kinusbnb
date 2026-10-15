import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret && !stripeSecret.includes("placeholder")
  ? new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as any })
  : null;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const referer = req.headers.get("referer");

    // Require authorization or valid admin session referer
    if (!authHeader && (!referer || !referer.includes("/admin/payments"))) {
      return NextResponse.json(
        { error: "Unauthorized: admin privileges required to process refunds" },
        { status: 401 }
      );
    }

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

    // Stripe allows specifying EITHER payment_intent OR charge, never both.
    const refundParams: Stripe.RefundCreateParams = {};
    if (paymentIntentId) {
      refundParams.payment_intent = paymentIntentId;
    } else if (chargeId) {
      refundParams.charge = chargeId;
    }

    if (amount) refundParams.amount = Math.round(Number(amount) * 100); // convert USD to cents
    if (reason && ["duplicate", "fraudulent", "requested_by_customer"].includes(reason)) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    // If shliachId provided or found, update Firestore
    const targetShliachId = shliachId || refund.metadata?.shliachId;
    try {
      const now = new Date().toISOString();
      if (targetShliachId) {
        const shliachRef = doc(db, "shluchim", targetShliachId);
        const snap = await getDoc(shliachRef);
        if (snap.exists()) {
          await updateDoc(shliachRef, {
            paymentStatus: "REFUNDED",
            refundedAt: now,
            refundId: refund.id,
            refundAmount: refund.amount / 100,
            updatedAt: now,
          });
        }
      } else if (paymentIntentId || refund.payment_intent) {
        const pi = paymentIntentId || (typeof refund.payment_intent === "string" ? refund.payment_intent : refund.payment_intent?.id);
        if (pi) {
          const q = query(collection(db, "shluchim"), where("stripePaymentIntentId", "==", pi));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            for (const d of qSnap.docs) {
              await updateDoc(d.ref, {
                paymentStatus: "REFUNDED",
                refundedAt: now,
                refundId: refund.id,
                refundAmount: refund.amount / 100,
                updatedAt: now,
              });
            }
          }
        }
      }
    } catch (dbErr) {
      console.error("Error updating Firestore on refund:", dbErr);
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
