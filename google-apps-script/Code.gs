/**
 * =========================================================================
 * כינוס השלוחים העולמי - Google Apps Script Email Relay
 * Official System Domain: https://kinusbed.vercel.app/
 * =========================================================================
 * 
 * הוראות התקנה:
 * 1. פתח פרוייקט חדש ב-Google Apps Script (https://script.google.com)
 * 2. הדבק את הקוד הזה בקובץ Code.gs
 * 3. לחץ על 'Deploy' (פריסה) -> 'New deployment' (פריסה חדשה)
 * 4. בחר 'Web app' (יישום אינטרנט):
 *    - Execute as: 'Me' (אני)
 *    - Who has access: 'Anyone' (כל אחד)
 * 5. אשר הרשאות שליחת מייל מחשבון ה-Google שלך.
 * 6. העתק את ה-Web App URL והדבק אותו בקובץ .env.local:
 *    GOOGLE_APPS_SCRIPT_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 *    EMAIL_RELAY_API_KEY=KINUS_RELAY_SECRET_KEY_770
 */

const SECRET_API_KEY = "KINUS_RELAY_SECRET_KEY_770";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJson({ success: false, error: "No post data received" }, 400);
    }

    const data = JSON.parse(e.postData.contents);

    // אימות מפתח אבטחה
    if (data.apiKey !== SECRET_API_KEY) {
      return responseJson({ success: false, error: "Unauthorized: Invalid API Key" }, 401);
    }

    const to = data.to;
    const subject = data.subject || "הודעה מכינוס השלוחים";
    let htmlBody = data.htmlBody || "";

    if (!to) {
      return responseJson({ success: false, error: "Missing recipient (to)" }, 400);
    }

    // הזרקת "ב״ה" בראש המייל אם אינו קיים
    if (!htmlBody.includes("ב״ה") && !htmlBody.includes("ב&quot;ה")) {
      htmlBody = '<div dir="rtl" style="text-align: left; font-size: 13px; color: #666; margin-bottom: 10px;">ב״ה</div>' + htmlBody;
    }

    // שליחת המייל דרך GmailApp
    GmailApp.sendEmail(to, subject, "", {
      htmlBody: htmlBody,
      name: "כינוס השלוחים העולמי"
    });

    // בדיקת מכסת שליחה יומית שנותרה
    const remainingQuota = MailApp.getRemainingDailyQuota();

    return responseJson({
      success: true,
      message: "Email sent successfully",
      remainingDailyQuota: remainingQuota
    }, 200);

  } catch (error) {
    return responseJson({
      success: false,
      error: error.toString()
    }, 500);
  }
}

function doGet(e) {
  const remainingQuota = MailApp.getRemainingDailyQuota();
  return responseJson({
    status: "online",
    service: "Kinus Shluchim Email Relay",
    remainingDailyQuota: remainingQuota
  }, 200);
}

function responseJson(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
