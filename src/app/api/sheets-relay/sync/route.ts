import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { shliach, apiKey, spreadsheetId } = await req.json();

    const defaultScriptUrl = "https://script.google.com/macros/s/AKfycbxro-pYisdZbi_3s591yS4MnuX7UMzoAmPM210u1Q7Tli4tABa_0yrJe28tNBRfguE2Aw/exec";
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL || defaultScriptUrl;
    const configuredApiKey = apiKey || process.env.EMAIL_RELAY_API_KEY || "KINUS_RELAY_SECRET_KEY_770";

    if (!shliach) {
      return NextResponse.json({ error: "Missing shliach payload" }, { status: 400 });
    }

    if (!scriptUrl) {
      return NextResponse.json({ success: true, mode: "mock" });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: configuredApiKey,
        action: "SYNC_SHLIACH",
        shliach,
        spreadsheetId: spreadsheetId || "1sUD4p-e84Edhu86KT0IiemlOuhiFknq9pfr1TygkllU",
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sheet sync relay notice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync to sheet" },
      { status: 500 }
    );
  }
}
