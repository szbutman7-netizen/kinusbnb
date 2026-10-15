import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { generateRegistrationConfirmationHtml, renderEmailTemplate } from "@/lib/services/emailTemplateHelper";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2025-01-27.acacia" as any }) : null;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: true, note: "Webhook received in mock mode" });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata || {};
      const shliachId = metadata.shliachId;

      console.log(`Payment succeeded for intent ${paymentIntent.id}, shliachId: ${shliachId}, amount: ${paymentIntent.amount}`);

      if (shliachId) {
        const docRef = doc(db, "shluchim", shliachId);
        const existingSnap = await getDoc(docRef);
        const now = new Date().toISOString();

        if (existingSnap.exists()) {
          // Autonomous update to PAID & COMPLETED in Firestore
          await setDoc(docRef, {
            paymentStatus: "PAID",
            registrationStatus: "COMPLETED",
            stripePaymentIntentId: paymentIntent.id,
            paidAt: now,
            updatedAt: now,
          }, { merge: true });
        } else {
          // Autonomous safety net: Create full Shliach document directly from Stripe payment metadata
          // Guarantees 100% that no paid Shliach is ever lost even if browser crashed or disconnected!
          const displayName = metadata.shliachName || "הרב השליח";
          const nameParts = displayName.split(/\s+/).filter(Boolean);
          const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : displayName;
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

          await setDoc(docRef, {
            id: shliachId,
            firstName,
            lastName,
            hebrewName: displayName,
            email: metadata.email || "",
            phone: metadata.phone || "",
            country: metadata.country || "לא צוין",
            city: metadata.city || "לא צוין",
            passportOrId: metadata.passportOrId || "",
            arrivalDate: metadata.arrivalDate || "2026-11-04",
            arrivalTime: metadata.arrivalTime || "12:00",
            departureDate: metadata.departureDate || "2026-11-09",
            departureTime: metadata.departureTime || "12:00",
            preferredRoommates: "",
            specialRequests: "",
            needsChildrenAccommodation: (Number(metadata.childrenCount) || 0) > 0,
            childrenNames: [],
            childrenCount: Number(metadata.childrenCount) || 0,
            paymentStatus: "PAID",
            amountPaid: Number(metadata.amountPaid) || (paymentIntent.amount / 100),
            currency: "USD",
            paidAt: now,
            receptionVisible: false,
            checkedIn: false,
            blockCheckIn: false,
            registrationStatus: "COMPLETED",
            stripePaymentIntentId: paymentIntent.id,
            createdAt: now,
            updatedAt: now,
          });
          console.log(`Safety-net autonomous Shliach document created for ${shliachId}`);
        }

        // Autonomous confirmation email dispatch
        if (metadata.email) {
          try {
            const emailData = {
              shliachName: metadata.shliachName || "הרב השליח",
              city: metadata.city || "",
              country: metadata.country || "",
              arrivalDate: "2026-11-03",
              departureDate: "2026-11-09",
              registrationId: shliachId,
              totalPrice: Number(metadata.amountPaid) || 30,
            };

            let customSubject = "אישור הרשמה לכינוס השלוחים העולמי ה׳תשפ״ז";
            let htmlContent = "";

            try {
              const tmplSnap = await getDoc(doc(db, "settings", "emailTemplates"));
              if (tmplSnap.exists()) {
                const data = tmplSnap.data();
                const list = data.templates as any[];
                const customTmpl = Array.isArray(list)
                  ? list.find((t: any) => t.id === "template-registration-confirmation")
                  : data["template-registration-confirmation"];
                if (customTmpl?.htmlContent) {
                  htmlContent = renderEmailTemplate(customTmpl.htmlContent, emailData);
                  if (customTmpl.subject) {
                    customSubject = renderEmailTemplate(customTmpl.subject, emailData);
                  }
                }
              }
            } catch (err) {
              console.warn("Could not load custom email template from Firestore in webhook:", err);
            }

            if (!htmlContent) {
              htmlContent = generateRegistrationConfirmationHtml(emailData);
            }

            const defaultScriptUrl = "https://script.google.com/macros/s/AKfycbxro-pYisdZbi_3s591yS4MnuX7UMzoAmPM210u1Q7Tli4tABa_0yrJe28tNBRfguE2Aw/exec";
            const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL || defaultScriptUrl;
            const apiKey = process.env.EMAIL_RELAY_API_KEY || "KINUS_RELAY_SECRET_KEY_770";

            await fetch(scriptUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apiKey,
                to: metadata.email,
                subject: customSubject,
                htmlBody: htmlContent,
              }),
            });
          } catch (emailErr) {
            console.error("Autonomous webhook email dispatch notice:", emailErr);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
