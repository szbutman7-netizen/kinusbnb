"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "he" | "en";
export type Direction = "rtl" | "ltr";

export const translations = {
  he: {
    // Top Bar & Navbar
    title: "כינוס השלוחים העולמי",
    deptSubtitle: "מחלקת אירוח ולינה • תשפ״ז",
    navInfo: "מידע כללי",
    navRegister: "הרשמה ללינה",
    langSwitchAria: "בחירת שפת ממשק",
    langHebrew: "עברית",
    langEnglish: "English",

    // WhatsApp
    whatsappLabel: "פנייה בוואטסאפ",
    whatsappFullAria: "פנייה למענה אנושי בוואטסאפ",
    whatsappBannerTitle: "צריכים עזרה או מענה אנושי?",
    whatsappBannerSubtitle: "מוקד הלינה של הכינוס זמין עבורכם ישירות בוואטסאפ",
    whatsappButtonText: "פנייה בוואטסאפ",

    // Home Page
    traditionalBh: "",
    datesBanner: "כ״ג – ל׳ בחשוון תשפ״ז • 3 – 10 בנובמבר 2026 • ברוקלין, ניו יורק",
    heroTitle: "כינוס השלוחים העולמי",
    heroSubtitle: "מערך אירוח ולינה במהלך ימי הכינוס",
    heroDescription: "ברוכים הבאים למערכת הרישום והסדרת הלינה לקראת ימי הכינוס. דירות אירוח מרווחות ומסודרות בשכונת קראון הייטס בסמיכות לבית חיינו – 770.",
    heroRegisterCta: "להרשמה והסדרת מקום לינה",
    heroDetailsCta: "פרטי האירוח והסדרי הגעה",
    feeBadge: "דמי השתתפות: $30 לכל ימי הכינוס",

    // Pillars
    pillarsHeaderTag: "הסדרי האירוח",
    pillarsTitle: "אירוח בכבוד הראוי לשלוחים",
    feature1Title: "בסמיכות ל-770",
    feature1Desc: "דירות האירוח ממוקמות ברחבי שכונת קראון הייטס, במרחק הליכה קצר מ-770.",
    feature2Title: "תיאום שותפים לחדר",
    feature2Desc: "באפשרותכם לציין בטופס ההרשמה שמות שלוחים שתרצו ללון עימם, וצוות השיבוץ יעשה מאמץ לשבץ אתכם יחד.",
    feature3Title: "סליקה מאובטחת",
    feature3Desc: "תשלום מובנה ומוצפן באמצעות Stripe ברמת אבטחה בנקאית (PCI-DSS), עם אישור הרשמה מיידי הנשלח לדוא״ל.",

    // FAQ
    faqTitle: "מידע חשוב לקראת ההגעה",
    faq1Q: "מתי ניתן להגיע ולקבל את מפתח הדירה?",
    faq1A: "עמדת הקבלה תפעל לאורך ימי הכינוס בבניין המוזיאון הסמוך ל770, בהגעתכם יש לגשת לעמדת הקבלה ולהזדהות בשמכם לקבלת המפתח ופרטי החדר.",
    faq2Q: "מה כולל האירוח בדירה?",
    faq2A: "האירוח כולל מיטה מסודרת ומרווחת, כולל כרית ושמיכה, יש להביא מצעים איתכם.",
    faq3Q: "עד מתי ניתן להישאר בדירה?",
    faq3A: "הדירות נסגרות ביום שלישי בתאריך 10 בנובמבר (ל׳ בחשוון), לא נוכל לספק לינה מעבר לתאריך זה.",

    // Home Bottom CTA
    bottomCtaTitle: "הבטיחו את מקומכם בימי הכינוס",
    bottomCtaDesc: "מספר המיטות מוגבל. אנא הקדימו להירשם בהקדם כדי לאפשר לצוות השיבוץ להיערך בצורה המיטבית.",
    bottomCtaButton: "מעבר לטופס הרשמה מקוון",

    // Footer
    footerAddress: "מחלקת אירוח ולינה • 788 Eastern Parkway, Suite 301, Brooklyn NY, 11213",
    footerCopyright: "כינוס השלוחים העולמי תשפ״ז",

    // Register Page
    backToInfo: "חזרה למידע כללי על הכינוס",

    // Registration Form
    formBadge: "",
    formTitle: "אירוח ולינה בכינוס השלוחים",
    formYearSubtitle: "",
    formDeadlineNotice: "ניתן להירשם עד ליום י״ז חשוון 28 באוקטובר",
    formPrice: "$30",
    formPriceLabel: "לכל ימי הכינוס",
    optionalFieldsBadge: "שדות רשות",
    stepLabel1: "פרטי השליח",
    stepLabel2: "הגעה ושותפים",
    stepLabel3: "סליקה ואישור",

    // Step 1 Fields
    step1Header: "פרטים אישיים ומקום השליחות",
    firstNameLabel: "שם פרטי (באנגלית)",
    firstNamePlaceholder: "Menachem M.",
    lastNameLabel: "שם משפחה (באנגלית)",
    lastNamePlaceholder: "Cohen",
    hebrewNameLabel: "שם מלא בעברית",
    hebrewNamePlaceholder: "הרב מנחם מענדל כהן",
    emailLabel: "דוא״ל לקבלת אישור ופרטי הדירה",
    emailPlaceholder: "rabbi@chabad.org",
    phoneLabel: "מספר טלפון נייד",
    phonePlaceholder: "+1-718-555-0123",
    countryLabel: "מדינת השליחות (בחירה מתוך רשימה)",
    countrySelectDefault: "-- בחר מדינה --",
    countryOther: "ארץ אחרת (Other)",
    cityLabel: "עיר השליחות (טקסט חופשי)",
    cityPlaceholder: "לדוגמה: פריז / ניו יורק / ירושלים",
    passportLabel: "מספר דרכון או תעודת זהות (לזיהוי בעמדת הקבלה)",
    passportPlaceholder: "038291029",

    // Step 2 Fields
    step2Header: "זמני שהות ובקשות מיוחדות",
    datesNoticeTitle: "תאריכי הכינוס המורשים:",
    datesNoticeText: "הלינה והאירוח מתקיימים בין התאריכים: 3 – 10 בנובמבר 2026 (כ״ג – ל׳ בחשוון ה׳תשפ״ז).",
    arrivalDateLabel: "תאריך הגעה משוער",
    dateRangeHint: "",
    arrivalTimeLabel: "שעת הגעה משוערת",
    departureDateLabel: "תאריך עזיבה משוער",
    departureTimeLabel: "שעת עזיבה משוערת",
    roommatesLabel: "שותפים מבוקשים לחדר (אם ישנם שלוחים שתרצו ללון עימם)",
    roommatesPlaceholder: "לדוגמה: הרב לוי סגל, הרב יוסף כהן",
    roommatesHelp: "צוות השיבוץ יעשה מאמץ מרבי לשבץ אתכם יחד בהתאם למלאי הדירות.",
    specialRequestsLabel: "בקשות מיוחדות / צרכי נגישות",
    specialRequestsPlaceholder: "קומה נמוכה, מעלית, צרכי נגישות מיוחדים וכו'",

    // Children Accommodation
    childrenQuestionLabel: "האם אתה זקוק למקום לינה עבור ילדיך?",
    childrenOptionYes: "כן",
    childrenOptionNo: "לא",
    childrenPriceNotice: "שימו לב: כל ילד זה תוספת של $30 עבור לינה לכל ימי הכינוס.",
    childNameLabel: "שם הילד",
    childNamePlaceholder: "הזן שם מלא של הילד",
    addChildButton: "הוסף ילד נוסף",
    removeChildButton: "הסר",
    childrenSummaryLabel: "תוספת לינה עבור ילדים:",

    // Step 3 Fields
    step3Header: "תשלום מאובטח באמצעות Stripe",
    feeSummaryLabel: "דמי השתתפות באירוח ולינה (שליח):",
    feeSummaryAmount: "$30.00 USD",
    feeTotalLabel: "סה״כ לתשלום:",
    sslSecuredText: "סליקה מאובטחת SSL",
    cardDetailsHeader: "פרטי כרטיס אשראי",
    stripeEncryptionText: "Stripe 256-bit Encryption",
    cardNumberLabel: "מספר כרטיס",
    cardExpLabel: "תוקף (MM/YY)",
    cardCvcLabel: "CVC / קוד אבטחה",
    stripeNoticeText: "התשלום מועבר ישירות באמצעות Stripe ואינו נשמר בשרתי האתר. אישור תשלום יישלח מיד לדוא״ל שלך.",

    // Buttons
    btnBack: "חזור",
    btnNext: "המשך",
    btnSubmit: "בצע תשלום ואשר הרשמה",
    btnSubmitting: "מעבד תשלום...",

    // Validation
    valEmailInvalid: "נא להזין כתובת דוא״ל תקינה",
    valDatesOutOfRange: "תאריכי הלינה חייבים להיות בטווח הכינוס: 3 עד 10 בנובמבר 2026 (כ״ג – ל׳ בחשוון תשפ״ז)",
    valDepartureBeforeArrival: "תאריך עזיבה אינו יכול להיות מוקדם מתאריך הגעה",
    valGenericError: "אירעה שגיאה בעת ההרשמה, אנא נסו שוב.",

    // Success Page
    successTitle: "ההרשמה נקלטה בהצלחה!",
    successSubtitle: "אישור ההרשמה והלינה נשלחו אל תיבת הדוא״ל שלכם.",
    successCardBadge: "אישור הרשמה ולינה",
    successShliachDetails: "פרטי השליח:",
    successDefaultShliachName: "הרב השליח",
    successLocationPrefix: "שליח ב",
    successIdPrefix: "מספר מזהה / ת״ז:",
    successStayDates: "תאריכי שהות:",
    successPaymentStatus: "סטטוס תשלום:",
    successPaidStripe: "שולם ($30) ב-Stripe",
    successArrivalGuideTitle: "הנחיות להגעה וקליטה:",
    successArrivalGuideText: "עמדת הקבלה תפעל לאורך ימי הכינוס בבניין המוזיאון הסמוך ל770, בהגעתכם יש לגשת לעמדת הקבלה ולהזדהות בשמכם לקבלת המפתח ופרטי החדר.",
    successDisclaimerTitle: "שימו לב:",
    successDisclaimerText: "אין בהרשמה התחייבות לקבלת מיטה. צוות הכינוס עושה את מיטב המאמצים לדאוג למיטות עבור כל הנרשמים. נעדכן בעז״ה בזמן הקרוב אם נוכל לספק עבורכם מקום לינה, ובמידה ולא נוכל נבצע החזר מלא על דמי ההרשמה.",
    btnPrint: "הדפס אישור הרשמה",
    btnHome: "חזרה לדף הבית",
    loadingReceipt: "טוען אישור הרשמה...",

    // Form Closed State
    formClosedBadge: "ההרשמה סגורה",
    formClosedTitle: "ההרשמה ללינה סגורה כעת",
    formClosedSubtitle: "מחלקת האירוח והלינה • כינוס השלוחים תשפ״ז",
    formClosedDesc: "ההרשמה המקוונת לדירות ואירוח בכינוס השלוחים סגורה כעת לקבלת פניות חדשות. במידה ודרוש מענה דחוף או סיוע אישי, ניתן לפנות ישירות למוקד הלינה בוואטסאפ.",
    formClosedContactUs: "לבירורים דחופים וסיוע אישי:",

    // Date Picker
    dateSelectPlaceholder: "אנא בחר תאריך",
    hebrewOnlyError: "יש להזין שם בעברית בלבד",

    // Contact Us Block
    contactSectionTag: "יצירת קשר ופניות",
    contactSectionTitle: "צור קשר עם מוקד האירוח",
    contactSectionDesc: "לכל שאלה, בקשה מיוחדת או פנייה בנושא לינה בכינוס, אנא השאירו פרטים ונחזור אליכם בהקדם במייל.",
    contactNameLabel: "שם מלא",
    contactNamePlaceholder: "הרב לוי יצחק",
    contactEmailLabel: "כתובת דוא״ל למענה",
    contactEmailPlaceholder: "shliach@chabad.org",
    contactPhoneLabel: "טלפון נייד",
    contactPhonePlaceholder: "+1-718-555-0199",
    contactSubjectLabel: "נושא הפנייה",
    contactSubjectPlaceholder: "בירור לגבי שיבוץ דירה / צרכי נגישות",
    contactMessageLabel: "תוכן הפנייה",
    contactMessagePlaceholder: "פרטו את שאלתכם או בקשתכם כאן...",
    contactSubmitBtn: "שליחת פנייה למוקד",
    contactSubmittingBtn: "שולח פנייה...",
    contactSuccessAlert: "פנייתך נשלחה בהצלחה! צוות הכינוס ישיב בהקדם לדוא״ל שציינת.",
    contactErrorAlert: "אירעה שגיאה בשליחת הפנייה. אנא נסה שוב או פנה בוואטסאפ.",
  },
  en: {
    // Top Bar & Navbar
    title: "International Conference of Shluchim",
    deptSubtitle: "Hospitality & Housing Dept. • 5787",
    navInfo: "General Info",
    navRegister: "Housing Registration",
    langSwitchAria: "Select interface language",
    langHebrew: "עברית",
    langEnglish: "English",

    // WhatsApp
    whatsappLabel: "Message on WhatsApp",
    whatsappFullAria: "Contact live human support on WhatsApp",
    whatsappBannerTitle: "Need Assistance or Personal Guidance?",
    whatsappBannerSubtitle: "The Kinus Hospitality Desk is available for you directly on WhatsApp",
    whatsappButtonText: "Message on WhatsApp",

    // Home Page
    traditionalBh: "",
    datesBanner: "23 – 30 Cheshvan 5787 • November 3 – 10, 2026 • Brooklyn, New York",
    heroTitle: "International Conference of Shluchim",
    heroSubtitle: "Hospitality & Housing during the Kinus",
    heroDescription: "Welcome to the registration system for accommodations during the Kinus. Spacious and organized guest apartments located in Crown Heights, within short walking distance of 770.",
    heroRegisterCta: "Register for Accommodations",
    heroDetailsCta: "Accommodation Details & Arrival",
    feeBadge: "Registration Fee: $30 for all days of the Kinus",

    // Pillars
    pillarsHeaderTag: "Hospitality Arrangements",
    pillarsTitle: "Hosting with the Dignity Befitting the Shluchim",
    feature1Title: "Proximity to 770",
    feature1Desc: "Accommodations are located throughout Crown Heights, just a short walk to 770 Eastern Parkway.",
    feature2Title: "Roommate Coordination",
    feature2Desc: "You can request specific Shluchim to room with on the registration form, and our placement team will do their best to accommodate.",
    feature3Title: "Secure Payment",
    feature3Desc: "Fully encrypted payment powered by Stripe at bank-level security (PCI-DSS), with instant confirmation sent to your email.",

    // FAQ
    faqTitle: "Important Arrival Information",
    faq1Q: "When can I arrive and collect my room keys?",
    faq1A: "The reception desk will operate throughout the Kinus in the Museum building adjacent to 770. Upon arrival, please visit the desk and identify yourself by name to receive keys and room details.",
    faq2Q: "What is included in the apartment accommodations?",
    faq2A: "Accommodations include an orderly and spacious bed, with a pillow and blanket. Please bring your own bed linens.",
    faq3Q: "When is checkout?",
    faq3A: "Apartments close on Tuesday, November 10 (30 Cheshvan); we cannot provide accommodation beyond this date.",

    // Home Bottom CTA
    bottomCtaTitle: "Secure Your Place at the Kinus",
    bottomCtaDesc: "Space is limited. Please register early to help our placement team make the best possible arrangements.",
    bottomCtaButton: "Proceed to Online Registration",

    // Footer
    footerAddress: "Hospitality & Housing Department • 788 Eastern Parkway, Suite 301, Brooklyn NY, 11213",
    footerCopyright: "International Conference of Shluchim 5787",

    // Register Page
    backToInfo: "Back to General Information",

    // Registration Form
    formBadge: "",
    formTitle: "Housing & Accommodations for the Kinus",
    formYearSubtitle: "",
    formDeadlineNotice: "Registration is open until 17 Cheshvan / October 28",
    formPrice: "$30",
    formPriceLabel: "For all days of the Kinus",
    optionalFieldsBadge: "All fields optional",
    stepLabel1: "Shliach Info",
    stepLabel2: "Stay & Roommates",
    stepLabel3: "Payment & Confirm",

    // Step 1 Fields
    step1Header: "Personal Details & Place of Shlichus",
    firstNameLabel: "First Name (English)",
    firstNamePlaceholder: "Menachem M.",
    lastNameLabel: "Last Name (English)",
    lastNamePlaceholder: "Cohen",
    hebrewNameLabel: "Full Hebrew Name",
    hebrewNamePlaceholder: "הרב מנחם מענדל כהן",
    emailLabel: "Email (for confirmation & room details)",
    emailPlaceholder: "rabbi@chabad.org",
    phoneLabel: "Mobile Phone Number",
    phonePlaceholder: "+1-718-555-0123",
    countryLabel: "Country of Shlichus (select from list)",
    countrySelectDefault: "-- Select Country --",
    countryOther: "Other Country",
    cityLabel: "City of Shlichus (free text)",
    cityPlaceholder: "e.g., Paris / New York / Jerusalem",
    passportLabel: "Passport or National ID (for check-in verification)",
    passportPlaceholder: "038291029",

    // Step 2 Fields
    step2Header: "Dates of Stay & Special Requests",
    datesNoticeTitle: "Authorized Kinus Dates:",
    datesNoticeText: "Accommodations are provided strictly between: November 3 – 10, 2026 (23 – 30 Cheshvan 5787).",
    arrivalDateLabel: "Estimated Arrival Date",
    dateRangeHint: "",
    arrivalTimeLabel: "Estimated Arrival Time",
    departureDateLabel: "Estimated Departure Date",
    departureTimeLabel: "Estimated Departure Time",
    roommatesLabel: "Preferred Roommates (Shluchim you wish to room with)",
    roommatesPlaceholder: "e.g., Rabbi Levi Segal, Rabbi Yosef Cohen",
    roommatesHelp: "The placement team will make every effort to accommodate your rooming preferences based on apartment capacity.",
    specialRequestsLabel: "Special Requests / Accessibility Needs",
    specialRequestsPlaceholder: "Low floor, elevator access, special mobility requirements, etc.",

    // Children Accommodation
    childrenQuestionLabel: "Do you need accommodations for your children?",
    childrenOptionYes: "Yes",
    childrenOptionNo: "No",
    childrenPriceNotice: "Please note: Each child is an additional $30 for accommodation throughout the Kinus.",
    childNameLabel: "Child's Name",
    childNamePlaceholder: "Enter child's full name",
    addChildButton: "Add another child",
    removeChildButton: "Remove",
    childrenSummaryLabel: "Children accommodation fee:",

    // Step 3 Fields
    step3Header: "Secure Payment via Stripe",
    feeSummaryLabel: "Housing & Accommodation Fee (Shliach):",
    feeSummaryAmount: "$30.00 USD",
    feeTotalLabel: "Total Amount Due:",
    sslSecuredText: "SSL Secure Checkout",
    cardDetailsHeader: "Credit Card Information",
    stripeEncryptionText: "Stripe 256-bit Encryption",
    cardNumberLabel: "Card Number",
    cardExpLabel: "Expiration (MM/YY)",
    cardCvcLabel: "CVC / Security Code",
    stripeNoticeText: "Payment is processed directly via Stripe and never stored on our servers. A receipt and confirmation will be sent immediately to your email.",

    // Buttons
    btnBack: "Back",
    btnNext: "Next Step",
    btnSubmit: "Complete Payment & Confirm",
    btnSubmitting: "Processing Payment...",

    // Validation
    valEmailInvalid: "Please enter a valid email address",
    valDatesOutOfRange: "Dates must fall within the Kinus period: November 3 to 10, 2026 (23 – 30 Cheshvan 5787)",
    valDepartureBeforeArrival: "Departure date cannot be earlier than arrival date",
    valGenericError: "An error occurred during registration, please try again.",

    // Success Page
    successTitle: "Registration Confirmed!",
    successSubtitle: "Your housing confirmation and details have been sent to your email.",
    successCardBadge: "Housing Confirmation Receipt",
    successShliachDetails: "Shliach Information:",
    successDefaultShliachName: "The Shliach",
    successLocationPrefix: "Shliach in ",
    successIdPrefix: "Registration ID / Passport:",
    successStayDates: "Dates of Stay:",
    successPaymentStatus: "Payment Status:",
    successPaidStripe: "Paid ($30) via Stripe",
    successArrivalGuideTitle: "Arrival & Check-in Instructions:",
    successArrivalGuideText: "The reception desk will operate throughout the Kinus in the Museum building adjacent to 770. Upon arrival, please visit the desk and identify yourself by name to receive keys and room details.",
    successDisclaimerTitle: "Please Note:",
    successDisclaimerText: "Registration does not guarantee a bed. The Kinus committee is making every effort to arrange beds for all registered Shluchim. We will update you in the near future regarding availability; if we are unable to accommodate, a full refund of the registration fee will be issued.",
    btnPrint: "Print Confirmation",
    btnHome: "Return to Home Page",
    loadingReceipt: "Loading confirmation receipt...",

    // Form Closed State
    formClosedBadge: "Registration Closed",
    formClosedTitle: "Housing Registration is Currently Closed",
    formClosedSubtitle: "Hospitality & Housing Department • International Conference of Shluchim 5787",
    formClosedDesc: "Online housing registration for the International Conference of Shluchim is currently closed for new applications. If you require urgent assistance or personal coordination, please reach out to our team directly via WhatsApp.",
    formClosedContactUs: "For urgent inquiries & assistance:",

    // Date Picker
    dateSelectPlaceholder: "Please select date",
    hebrewOnlyError: "Please enter Hebrew name only",

    // Contact Us Block
    contactSectionTag: "Contact & Inquiries",
    contactSectionTitle: "Contact the Housing Office",
    contactSectionDesc: "For any questions, special requests, or housing inquiries, please leave your details below and we will get back to you promptly via email.",
    contactNameLabel: "Full Name",
    contactNamePlaceholder: "Rabbi Levi Yitzchok",
    contactEmailLabel: "Email Address for Reply",
    contactEmailPlaceholder: "shliach@chabad.org",
    contactPhoneLabel: "Mobile Phone",
    contactPhonePlaceholder: "+1-718-555-0199",
    contactSubjectLabel: "Subject",
    contactSubjectPlaceholder: "Inquiry regarding apartment placement / accessibility",
    contactMessageLabel: "Message",
    contactMessagePlaceholder: "Please describe your question or request here...",
    contactSubmitBtn: "Submit Inquiry to Office",
    contactSubmittingBtn: "Submitting inquiry...",
    contactSuccessAlert: "Your inquiry has been submitted successfully! The Kinus team will respond promptly to your email.",
    contactErrorAlert: "An error occurred submitting your inquiry. Please try again or reach out on WhatsApp.",
  }
};

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations["he"]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("he");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kinus_lang") as Language;
      if (saved === "he" || saved === "en") {
        setLanguageState(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("kinus_lang", lang);
    } catch (e) {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "he" ? "en" : "he");
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    }
  }, [language]);

  const direction: Direction = language === "he" ? "rtl" : "ltr";
  const isRtl = direction === "rtl";

  const t = (key: keyof typeof translations["he"]): string => {
    const dict = translations[language] || translations.he;
    return dict[key] || translations.he[key] || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRtl,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      <div dir={direction} className={isRtl ? "rtl" : "ltr"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
