import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, subject, htmlBody, apiKey } = await req.json();

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL;
    const configuredApiKey = apiKey || process.env.EMAIL_RELAY_API_KEY || "KINUS_RELAY_SECRET_KEY_770";

    if (!to || !subject || !htmlBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, htmlBody" },
        { status: 400 }
      );
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
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Email relay failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to relay email" },
      { status: 500 }
    );
  }
}
