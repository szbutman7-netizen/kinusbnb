"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

// Initialize Stripe outside of render cycle
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey && !publishableKey.includes("placeholder")
  ? loadStripe(publishableKey)
  : null;

interface StripePaymentSectionProps {
  amount: number;
  shliachDetails: any;
  childrenCount: number;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onError: (errMsg: string) => void;
  language: string;
  t: (key: any) => string;
}

function InnerPaymentForm({
  amount,
  isSubmitting,
  setIsSubmitting,
  onPaymentSuccess,
  onError,
  language,
  t,
}: {
  amount: number;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onError: (errMsg: string) => void;
  language: string;
  t: (key: any) => string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);
  const [elementError, setElementError] = useState<string | null>(null);

  const handleSubmitPayment = async () => {
    if (!stripe || !elements) {
      onError(language === "he" ? "מערכת הסליקה עדיין נטענת, אנא המתן..." : "Payment system is still loading...");
      return;
    }

    setIsSubmitting(true);
    setElementError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setElementError(submitError.message || "Validation error");
        onError(submitError.message || "Validation error");
        setIsSubmitting(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        const errorMsg = error.message || (language === "he" ? "התשלום נכשל. אנא בדוק את פרטי הכרטיס." : "Payment failed. Please check card details.");
        setElementError(errorMsg);
        onError(errorMsg);
        setIsSubmitting(false);
      } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        await onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        const errorMsg = language === "he"
          ? "נדרש אימות נוסף מול חברת האשראי. אנא השלם את האימות ונסה שנית."
          : "Additional authentication required by your bank. Please complete authentication and try again.";
        setElementError(errorMsg);
        onError(errorMsg);
        setIsSubmitting(false);
      } else {
        const errorMsg = language === "he"
          ? "התשלום לא אושר. אנא נסה שנית או השתמש באמצעי תשלום אחר."
          : "Payment was not approved. Please try again or use another payment method.";
        setElementError(errorMsg);
        onError(errorMsg);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      const msg = err.message || (language === "he" ? "אירעה שגיאה בביצוע התשלום" : "An error occurred during payment");
      setElementError(msg);
      onError(msg);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleTrigger = () => {
      handleSubmitPayment();
    };
    window.addEventListener("stripe-submit-trigger", handleTrigger);
    return () => {
      window.removeEventListener("stripe-submit-trigger", handleTrigger);
    };
  }, [stripe, elements]);

  return (
    <div className="space-y-4">
      <div className="border border-slate-700/80 rounded-2xl p-4 sm:p-5 bg-[#0B1E38]/90 space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-300 pb-1 border-b border-slate-700/60">
          <span className="font-semibold text-white flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#E8D8A8]" />
            {t("cardDetailsHeader")}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            {t("stripeEncryptionText")}
          </span>
        </div>

        {elementError && (
          <div className="flex items-center gap-2 p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{elementError}</span>
          </div>
        )}

        <div className="min-h-[160px]">
          <PaymentElement
            onReady={() => setIsReady(true)}
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-300 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{t("stripeNoticeText")}</span>
      </div>
    </div>
  );
}

export default function StripePaymentSection(props: StripePaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function createPaymentIntent() {
      setIsLoadingSecret(true);
      setInitError(null);

      try {
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shliachDetails: props.shliachDetails,
            childrenCount: props.childrenCount,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to initialize payment");
        }

        const data = await res.json();
        if (isMounted) {
          setClientSecret(data.clientSecret);
          setIsLoadingSecret(false);
        }
      } catch (err: any) {
        console.error("Error creating payment intent:", err);
        if (isMounted) {
          setInitError(err.message || "Failed to load payment form");
          setIsLoadingSecret(false);
          props.onError(err.message || "Failed to load payment form");
        }
      }
    }

    createPaymentIntent();

    return () => {
      isMounted = false;
    };
  }, [props.amount, props.childrenCount]);

  if (isLoadingSecret) {
    return (
      <div className="border border-slate-700/80 rounded-2xl p-8 bg-[#0B1E38]/80 flex flex-col items-center justify-center space-y-3 min-h-[220px]">
        <Loader2 className="w-8 h-8 text-[#E8D8A8] animate-spin" />
        <span className="text-xs text-slate-300 font-light">
          {props.language === "he" ? "מאתחל ערוץ סליקה מאובטח..." : "Initializing secure checkout channel..."}
        </span>
      </div>
    );
  }

  if (initError || !clientSecret) {
    return (
      <div className="border border-red-500/40 rounded-2xl p-6 bg-red-950/40 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-xs text-red-200">
          {initError || (props.language === "he" ? "לא ניתן לטעון את רכיב הסליקה כרגע." : "Unable to load checkout.")}
        </p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="border border-amber-500/40 rounded-2xl p-6 bg-amber-950/30 text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-[#E8D8A8] mx-auto" />
        <p className="text-xs text-amber-200">
          {props.language === "he"
            ? "מצב בדיקה מופעל (Stripe Test/Dev Mode). ניתן להמשיך באישור ההרשמה."
            : "Test/Dev mode active. You may proceed with registration confirmation."}
        </p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#E8D8A8",
        colorBackground: "#07142A",
        colorText: "#F8FAFC",
        colorDanger: "#F87171",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: "14px",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": {
          backgroundColor: "#07142A",
          border: "1px solid rgba(51, 65, 85, 0.8)",
          boxShadow: "none",
          padding: "11px 14px",
          color: "#FFFFFF",
          fontSize: "14px",
        },
        ".Input:focus": {
          border: "1px solid #E8D8A8",
          boxShadow: "0 0 0 1px #E8D8A8",
        },
        ".Tab": {
          backgroundColor: "rgba(16, 36, 68, 0.6)",
          border: "1px solid rgba(51, 65, 85, 0.8)",
          color: "#94A3B8",
        },
        ".Tab--selected": {
          backgroundColor: "#102444",
          borderColor: "#E8D8A8",
          color: "#E8D8A8",
        },
        ".Label": {
          color: "#CBD5E1",
          fontSize: "12px",
          fontWeight: "500",
          marginBottom: "6px",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <InnerPaymentForm
        amount={props.amount}
        isSubmitting={props.isSubmitting}
        setIsSubmitting={props.setIsSubmitting}
        onPaymentSuccess={props.onPaymentSuccess}
        onError={props.onError}
        language={props.language}
        t={props.t}
      />
    </Elements>
  );
}
