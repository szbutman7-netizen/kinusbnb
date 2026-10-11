# כינוס השלוחים העולמי – מערכת רישום, סליקה ואירוח לינה

מערכת מלאה ומתקדמת לרישום, סליקת כרטיסי אשראי וניהול לינה עבור שלוחי חב"ד בכינוס השלוחים העולמי.
המערכת מבוססת על עקרונות הארכיטקטורה המוכחים של **"תשרי קליק"**, ומותאמת במיוחד לכינוס השלוחים.

---

## 🌟 עיקרי המערכת

1. **טופס הרשמה ידידותי לשלוחים (`/`):**
   - טופס רב-שלבי (פרטי שליחות, זמני הגעה/עזיבה, שותפים מועדפים, בקשות מיוחדות).
   - סליקת Stripe מובנית בטופס ($180) בהצפנת SSL ברמת תקן PCI.
   - עמוד אישור (`/success`) עם כרטיס אישור להדפסה וקוד QR ייחודי לקבלה מהירה.

2. **חדר פיקוד ופורטל ניהול בקישור נפרד (`/admin`):**
   - כניסה מאובטחת באמצעות **חשבון Google** מבוססת רשימה מורשית (**Whitelist** ב-Firestore).
   - הגנת נעילה עצמית (Self-Lockout Protection) ובקרת הרשאות פרטנית לכל מסך (`NONE` / `VIEW` / `EDIT`).

3. **חמשת המסכים התפעוליים:**
   - **🏢 דירות ומיטות (`/admin/apartments`):** יצירת דירה עם יצירה אוטומטית של מיטות ב-Batch, מעקב תפוסה, קודי כניסה, קישורי Waze ומצב "פירוק וסגירה מרוכזת".
   - **👥 מאגר נרשמים (`/admin/shluchim`):** חיפוש חכם (Fuzzy Search, ניקוי קידומות טלפון), סינונים מרובים, הערות מנהל מהירות ודגל חסימת קבלה (`blockCheckIn`).
   - **🛏️ מסך שיבוץ אינטראקטיבי (`/admin/placement`):** תהליך 4 שלבים (בחירת שלוחים $\leftarrow$ בחירת דירת יעד $\leftarrow$ אישור וחשיפה לקבלה $\leftarrow$ מנהל תפוסה ויזואלי ברשת מיטות). סנכרון אטומי דו-כיווני.
   - **🎟️ עמדת קבלה וצ'ק-אין (`/admin/reception`):** ממשק מהיר למגע/מובייל, סריקת QR, צ'ק-אין בלחיצה אחת, התראת חסימה בולטת, וחשיפת פרטי דירה ושותפים רק אם אושר.
   - **✉️ שליחת מיילים (`/admin/emails`):** שליחה דרך **Google Apps Script Web App Relay** מחשבון ה-Google של הארגון, עורך תבניות HTML, תגיות דינמיות (`{shliach_name}`, `{apartment_name}` וכו'), הזרקת "ב״ה", שליחה במנות של 25 עם השהיה ומעקב מכסה יומית (1,500).
   - **🛡️ ניהול משתמשים (`/admin/users`):** הוספת מורשים, קביעת תפקידים והרשאות מסכים.

---

## 🚀 התקנה והרצה מקומית

1. **התקנת תלויות:**
   ```bash
   npm install
   ```

2. **הרצת שרת פיתוח:**
   ```bash
   npm run dev
   ```
   האתר יהיה זמין בכתובת: [http://localhost:3000](http://localhost:3000)

3. **בניית גרסת Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## ⚙️ הגדרת משתני סביבה (`.env.local`)

צור קובץ בשם `.env.local` בתיקיית השורש והזן את המפתחות (דוגמה מופיעה בקובץ `.env.example`):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kinusbnb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kinusbnb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kinusbnb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=351392334108
NEXT_PUBLIC_FIREBASE_APP_ID=1:351392334108:web:...

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Apps Script Email Relay
GOOGLE_APPS_SCRIPT_WEBAPP_URL=https://script.google.com/macros/s/.../exec
EMAIL_RELAY_API_KEY=KINUS_RELAY_SECRET_KEY_770

# Official Production Domain & Authorized Base URL
NEXT_PUBLIC_BASE_URL=https://kinusbed.vercel.app/
NEXT_PUBLIC_SITE_URL=https://kinusbed.vercel.app/
NEXT_PUBLIC_AUTHORIZED_DOMAIN=kinusbed.vercel.app
```

> **הערה חשובה לגבי דומיין מורשה (Authorized Domain):** 
> הדומיין הרשמי של המערכת הוא **`https://kinusbed.vercel.app/`**. 
> דומיין זה מוגדר ברשימת הדומיינים המורשים (Authorized Domains) ב-Firebase Authentication לצורך התחברות Google Sign-In מאובטחת, וכן ב-Vercel עבור פריסת היישום.

---

## 📬 פריסת ה-Email Relay ב-Google Apps Script

1. פתח פרויקט חדש ב-[Google Apps Script](https://script.google.com).
2. העתק את הקוד מתוך `google-apps-script/Code.gs` אל העורך.
3. לחץ על **Deploy** $\rightarrow$ **New deployment** ובחר **Web app**.
   - **Execute as:** `Me` (חשבון הגוגל של הארגון).
   - **Who has access:** `Anyone`.
4. אשר את הרשאות השליחה והעתק את כתובת ה-Web App לתוך `GOOGLE_APPS_SCRIPT_WEBAPP_URL`.

---

## ☁️ פריסה ב-Vercel

- **כתובת הייצור הרשמית:** [https://kinusbed.vercel.app/](https://kinusbed.vercel.app/)
- **שם הפרויקט ב-Vercel:** `kinusbed` (מוגדר בקובץ `.vercel/project.json`).
- **הגדרות סביבה:** יש לוודא שמשתנה `NEXT_PUBLIC_BASE_URL` מוגדר ב-Vercel כ-`https://kinusbed.vercel.app/`.
