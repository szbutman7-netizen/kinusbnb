/**
 * =========================================================================
 * כינוס השלוחים העולמי - סקריפט סנכרון נתונים לגוגל שיטס וממסר דוא״ל
 * Official System Domain: https://kinusbed.vercel.app/
 * =========================================================================
 * 
 * הוראות שימוש והתקנה:
 * אופציה א' (מומלצת ופשוטה ביותר - סקריפט מקושר ישירות לגיליון):
 * 1. פתח גיליון חדש ב-Google Sheets (https://sheets.new) ותן לו שם: "כינוס השלוחים - גיבוי נרשמים".
 * 2. בתפריט העליון של הגיליון, לחץ על: Extensions (הרחבות) -> Apps Script.
 * 3. מחק את מה שמופיע והדבק את כל הקוד הזה בקובץ Code.gs.
 * 4. לחץ על 'Deploy' (פריסה) -> 'New deployment' (פריסה חדשה).
 * 5. בחר 'Web app' (יישום אינטרנט):
 *    - Execute as: 'Me' (אני)
 *    - Who has access: 'Anyone' (כל אחד)
 * 6. אשר הרשאות שליחה וכתיבה לגיליון.
 * 7. העתק את ה-Web App URL לקובץ .env.local:
 *    GOOGLE_APPS_SCRIPT_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 *    EMAIL_RELAY_API_KEY=KINUS_RELAY_SECRET_KEY_770
 */

const SECRET_API_KEY = "KINUS_RELAY_SECRET_KEY_770";
const DEFAULT_SPREADSHEET_ID = "1sUD4p-e84Edhu86KT0IiemlOuhiFknq9pfr1TygkllU";

// כותרות העמודות בגיליון
const SHEET_HEADERS = [
  "מזהה רישום",
  "סטטוס רישום",
  "שם מלא (עברית)",
  "שם פרטי (אנגלית)",
  "שם משפחה (אנגלית)",
  "גיל",
  "מספר דרכון / ת״ז",
  "עיר שליחות",
  "מדינת שליחות",
  "טלפון נייד",
  "דוא״ל",
  "תאריך הגעה",
  "שעת הגעה",
  "תאריך עזיבה",
  "שעת עזיבה",
  "סטטוס תשלום",
  "סכום ששולם ($)",
  "לינת ילדים",
  "שמות ילדים",
  "שותפים מבוקשים",
  "בקשות מיוחדות",
  "זמן עדכון אחרון"
];

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

    const action = data.action || (data.shliach ? "SYNC_SHLIACH" : "SEND_EMAIL");

    // 1. פעולת סנכרון שליח / טיוטה לגיליון
    if (action === "SYNC_SHLIACH" && data.shliach) {
      const result = syncShliachToSheet(data.shliach, data.spreadsheetId);
      return responseJson({
        success: true,
        message: "Shliach synced to sheet successfully",
        row: result.row,
        actionTaken: result.actionTaken
      }, 200);
    }

    // 2. פעולת שליחת דוא״ל
    if (action === "SEND_EMAIL" || data.to) {
      const to = data.to;
      const subject = data.subject || "הודעה מכינוס השלוחים";
      const htmlBody = data.htmlBody || "";

      if (!to) {
        return responseJson({ success: false, error: "Missing recipient (to)" }, 400);
      }

      GmailApp.sendEmail(to, subject, "", {
        htmlBody: htmlBody,
        name: "כינוס השלוחים העולמי"
      });

      const remainingQuota = MailApp.getRemainingDailyQuota();

      return responseJson({
        success: true,
        message: "Email sent successfully",
        remainingDailyQuota: remainingQuota
      }, 200);
    }

    return responseJson({ success: false, error: "Unknown action" }, 400);

  } catch (error) {
    return responseJson({
      success: false,
      error: error.toString()
    }, 500);
  }
}

/**
 * כתיבה או עדכון שורה בגיליון לפי מספר דרכון/ת"ז
 */
function syncShliachToSheet(shliach, spreadsheetId) {
  let ss;
  const targetId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  if (targetId) {
    try {
      ss = SpreadsheetApp.openById(targetId);
    } catch (err) {
      console.warn("Could not open by ID, trying getActiveSpreadsheet:", err);
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      throw new Error("No active spreadsheet found. Please bind script to sheet or provide spreadsheetId.");
    }
  }

  const sheet = ss.getActiveSheet();

  // אם הגיליון ריק, הוסף את שורת הכותרות
  if (sheet.getLastRowNum() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#15305B");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  const cleanPassport = (shliach.passportOrId || "").toString().replace(/[\s-]/g, "").toUpperCase();
  const rows = sheet.getDataRange().getValues();
  let existingRowIndex = -1;

  // עמודה 7 היא דרכון/ת"ז (אינדקס 6)
  if (cleanPassport && rows.length > 1) {
    for (let i = 1; i < rows.length; i++) {
      const cellVal = (rows[i][6] || "").toString().replace(/[\s-]/g, "").toUpperCase();
      if (cellVal && cellVal === cleanPassport) {
        existingRowIndex = i + 1; // 1-indexed בגוגל שיטס
        break;
      }
    }
  }

  function cleanSheetCell(val) {
    if (val === null || val === undefined) return "";
    var str = String(val).trim();
    if (/^[=+@\-\t\r]/.test(str)) {
      return "'" + str;
    }
    return str;
  }

  // הכנת ערכי השורה
  const rowData = [
    cleanSheetCell(shliach.id),
    shliach.registrationStatus === "DRAFT" ? "טופס נטוש / טיוטה" : "הושלם",
    cleanSheetCell(shliach.hebrewName),
    cleanSheetCell(shliach.firstName),
    cleanSheetCell(shliach.lastName),
    shliach.age || "",
    cleanSheetCell(shliach.passportOrId),
    cleanSheetCell(shliach.city),
    cleanSheetCell(shliach.country),
    cleanSheetCell(shliach.phone),
    cleanSheetCell(shliach.email),
    cleanSheetCell(shliach.arrivalDate),
    cleanSheetCell(shliach.arrivalTime),
    cleanSheetCell(shliach.departureDate),
    cleanSheetCell(shliach.departureTime),
    cleanSheetCell(shliach.paymentStatus),
    Number(shliach.amountPaid) || 0,
    shliach.needsChildrenAccommodation ? "כן" : "לא",
    cleanSheetCell((shliach.childrenNames || []).join(", ")),
    cleanSheetCell(shliach.preferredRoommates),
    cleanSheetCell(shliach.specialRequests),
    new Date().toLocaleString("he-IL", { timeZone: "America/New_York" })
  ];

  if (existingRowIndex > 0) {
    // עדכון שורה קיימת
    sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
    return { row: existingRowIndex, actionTaken: "UPDATED" };
  } else {
    // הוספת שורה חדשה
    sheet.appendRow(rowData);
    return { row: sheet.getLastRow(), actionTaken: "APPENDED" };
  }
}

function doGet(e) {
  const remainingQuota = MailApp.getRemainingDailyQuota();
  return responseJson({
    status: "online",
    service: "Kinus Shluchim Multi-Sync Relay",
    remainingDailyQuota: remainingQuota
  }, 200);
}

function responseJson(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
