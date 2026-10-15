import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, subject, htmlBody, apiKey } = await req.json();

    const defaultScriptUrl = "https://script.google.com/macros/s/AKfycbxro-pYisdZbi_3s591yS4MnuX7UMzoAmPM210u1Q7Tli4tABa_0yrJe28tNBRfguE2Aw/exec";
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL || defaultScriptUrl;
    const configuredApiKey = apiKey || process.env.EMAIL_RELAY_API_KEY || "KINUS_RELAY_SECRET_KEY_770";

    if (!to || !subject || !htmlBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, htmlBody" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof to !== "string" || !emailRegex.test(to.trim()) || to.length > 120) {
      return NextResponse.json({ error: "Invalid recipient email address" }, { status: 400 });
    }

    // Payload size guards
    if (typeof subject !== "string" || subject.length > 250) {
      return NextResponse.json({ error: "Subject exceeds maximum allowed length" }, { status: 400 });
    }
    if (typeof htmlBody !== "string" || htmlBody.length > 200000) {
      return NextResponse.json({ error: "Email body exceeds maximum allowed size" }, { status: 400 });
    }

    if (!scriptUrl) {
      // Development mock mode: simulate successful relay
      console.log(`[Email Relay Mock] Sending email to: ${to}, Subject: ${subject}`);
      return NextResponse.json({
        success: true,
        mode: "mock",
        message: `דוא"ל נשלח בהצלחה (מצב הדמיה - טרם הוגדר GOOGLE_APPS_SCRIPT_WEBAPP_URL)`
      });
    }

    // Call Google Apps Script Web App
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: configuredApiKey,
        to,
        subject,
        htmlBody,
      }),
    });

    const result = await response.json();
    if (!response.ok || (result && result.success === false)) {
      return NextResponse.json(
        { error: result?.error || "Failed to relay email via Google Apps Script" },
        { status: response.status >= 400 ? response.status : 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Email relay failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to relay email" },
      { status: 500 }
    );
  }
}
