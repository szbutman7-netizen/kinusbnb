export interface RegistrationEmailData {
  shliachName: string;
  city: string;
  country?: string;
  arrivalDate: string;
  departureDate: string;
  registrationId?: string;
  totalPrice?: number;
  specialRequests?: string;
  preferredRoommates?: string;
  childrenNames?: string[];
  needsChildrenAccommodation?: boolean;
}

export function generateRegistrationConfirmationHtml(data: RegistrationEmailData): string {
  const {
    shliachName,
    city,
    country,
    arrivalDate,
    departureDate,
    registrationId,
    totalPrice = 30,
    specialRequests,
    preferredRoommates,
    childrenNames = [],
    needsChildrenAccommodation = false,
  } = data;

  const locationStr = [city, country].filter(Boolean).join(", ") || "מקום שליחותכם";
  const whatsappUrl = "https://wa.me/13474542013";
  const supportEmail = "contact@kinus.org";
  const portalUrl = "https://kinusbed.vercel.app/";

  const childrenRows = needsChildrenAccommodation && childrenNames.length > 0
    ? `<tr>
        <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9; width: 35%;">ילדים נלווים:</td>
        <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${childrenNames.join(", ")}</td>
      </tr>`
    : "";

  const roommatesRow = preferredRoommates
    ? `<tr>
        <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9; width: 35%;">שותפים מבוקשים:</td>
        <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${preferredRoommates}</td>
      </tr>`
    : "";

  const requestsRow = specialRequests
    ? `<tr>
        <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9; width: 35%;">בקשות מיוחדות:</td>
        <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${specialRequests}</td>
      </tr>`
    : "";

  const regIdRow = registrationId
    ? `<tr>
        <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9; width: 35%;">מספר סימוכין:</td>
        <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 700; font-family: monospace; border-bottom: 1px solid #f1f5f9;">${registrationId}</td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>אישור הרשמה לכינוס השלוחים העולמי</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #f1f5f9; padding: 30px 12px;">
    <!-- Container -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(11, 26, 48, 0.08); border: 1px solid #e2e8f0; border-collapse: separate;">
      
      <!-- Top Gold Line -->
      <tr>
        <td style="height: 5px; background: linear-gradient(90deg, #b89742, #E8D8A8, #b89742); font-size: 0; line-height: 0;">&nbsp;</td>
      </tr>

      <!-- Hero Header -->
      <tr>
        <td style="background-color: #0B1A30; background: linear-gradient(135deg, #0B1A30 0%, #15305B 100%); padding: 34px 28px 30px; text-align: center; color: #ffffff;">
          <!-- Kinus Logo / Emblem -->
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px;">
            <tr>
              <td style="background: rgba(232, 216, 168, 0.12); border: 1.5px solid rgba(232, 216, 168, 0.4); border-radius: 50%; padding: 12px; width: 64px; height: 64px; text-align: center; vertical-align: middle;">
                <img src="https://kinusbed.vercel.app/assets/kinus-emblem.svg" alt="כינוס השלוחים" width="60" height="60" style="display: block; margin: 0 auto; border: 0;" />
              </td>
            </tr>
          </table>

          <div style="color: #E8D8A8; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
            ב״ה • מחלקת אירוח ולינה
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">
            כינוס השלוחים העולמי ה׳תשפ״ז
          </h1>
          <div style="color: #cbd5e1; font-size: 13px; font-weight: 500;">
            אישור קבלת הרשמה למערך הלינה
          </div>
        </td>
      </tr>

      <!-- Main Body Content -->
      <tr>
        <td style="padding: 32px 28px; color: #1e293b; font-size: 15px; line-height: 1.65;">
          
          <!-- Greeting -->
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #0B1A30;">
            שלום עליכם כבוד הרב <strong style="color: #0B1A30; font-size: 17px;">${shliachName}</strong> שי׳,
            <br>
            <span style="font-size: 14px; color: #64748b;">שליח כ״ק אדמו״ר ב${locationStr}</span>
          </p>

          <p style="margin: 0 0 20px 0; color: #334155;">
            אנו שמחים לאשר כי פרטי הרשמתך למערך האירוח והלינה של כינוס השלוחים העולמי נקלטו בהצלחה במערכת.
          </p>

          <!-- Registration Details Table Box -->
          <div style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; margin: 22px 0;">
            <div style="background-color: #102444; color: #E8D8A8; padding: 10px 16px; font-size: 13px; font-weight: 700; border-bottom: 1px solid #1e3a8a;">
              📋 פרטי הרישום שנקלטו:
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; text-align: right;">
              <tbody>
                ${regIdRow}
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9; width: 35%;">שם השליח:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${shliachName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">מקום שליחות:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${locationStr}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">מועדי שהות:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                    הגעה: <strong>${arrivalDate}</strong> | עזיבה: <strong>${departureDate}</strong>
                  </td>
                </tr>
                ${childrenRows}
                ${roommatesRow}
                ${requestsRow}
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-size: 13px;">דמי השתתפות:</td>
                  <td style="padding: 10px 14px; color: #047857; font-size: 13px; font-weight: 700;">
                    ✓ שולם בהצלחה ($${totalPrice})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Notice 1: Beds Commitment & Refund Notice -->
          <div style="background-color: #fffbeb; border-right: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 22px 0; color: #92400e;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #78350f;">
              ⚠️ הודעה חשובה בעניין סידורי הלינה:
            </div>
            <div style="font-size: 13px; line-height: 1.6; color: #92400e;">
              אין בהרשמה התחייבות לקבלת מיטה. צוות הכינוס עושה את מיטב המאמצים לדאוג למיטות עבור כל הנרשמים. נעדכן בעז״ה בזמן הקרוב אם נוכל לספק עבורכם מקום לינה, ובמידה ולא נוכל נבצע החזר מלא על דמי ההרשמה.
            </div>
          </div>

          <!-- Notice 2: Reception Desk in Jewish Children's Museum -->
          <div style="background-color: #eff6ff; border-right: 4px solid #2563eb; border-radius: 8px; padding: 14px 16px; margin: 22px 0; color: #1e40af;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #1e3a8a;">
              🔑 עמדת הקבלה וקבלת מפתח:
            </div>
            <div style="font-size: 13px; line-height: 1.6; color: #1e40af;">
              עמדת הקבלה תפעל לאורך ימי הכינוס בבניין המוזיאון הסמוך ל-770 (Jewish Children's Museum). בהגעתכם יש לגשת לעמדת הקבלה ולהזדהות בשמכם לקבלת המפתח ופרטי החדר.
            </div>
          </div>

          <!-- Action Buttons / Links -->
          <div style="margin: 30px 0 20px; text-align: center;">
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
              <tr>
                <!-- WhatsApp Button -->
                <td style="padding: 6px;">
                  <a href="${whatsappUrl}" target="_blank" style="background-color: #102444; color: #E8D8A8; text-decoration: none; padding: 12px 22px; border-radius: 12px; font-size: 13px; font-weight: 700; display: inline-block; border: 1px solid rgba(232, 216, 168, 0.4); box-shadow: 0 4px 12px rgba(16, 36, 68, 0.15);">
                    💬 פנייה למוקד בוואטסאפ
                  </a>
                </td>
                <!-- Email Support Button -->
                <td style="padding: 6px;">
                  <a href="mailto:${supportEmail}?subject=פנייה בנושא הרשמה ללינה - ${encodeURIComponent(shliachName)}" target="_blank" style="background-color: #f8fafc; color: #1e293b; text-decoration: none; padding: 12px 22px; border-radius: 12px; font-size: 13px; font-weight: 700; display: inline-block; border: 1px solid #cbd5e1;">
                    ✉️ שליחת מייל למענה
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <!-- Signoff -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #334155; line-height: 1.6;">
            בברכת הצלחה רבה בשליחות הקדושה ולהתראות בחצרות קדשנו,
            <br>
            <strong style="color: #0B1A30; font-size: 15px;">צוות הכינוס — מחלקת אירוח ולינה</strong>
          </div>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 28px; text-align: center; color: #94a3b8; font-size: 12px;">
          <div style="margin-bottom: 6px; font-weight: 600; color: #64748b;">
            כינוס השלוחים העולמי תשפ״ז • 788 Eastern Parkway, Brooklyn NY, 11213
          </div>
          <div>
            למעבר לאתר הרשמי: 
            <a href="${portalUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">
              kinusbed.vercel.app
            </a>
          </div>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>`;
}
