/**
 * Hebrew Date & Gematria Formatting Utilities
 */

/**
 * Number to Hebrew Gematria letters with authentic Gershayim (e.g. 24 -> כ״ד, 15 -> ט״ו, 1 -> א׳)
 */
export function numberToHebrewGematria(num: number): string {
  if (typeof num !== 'number' || isNaN(num) || num <= 0 || !Number.isFinite(num)) {
    return String(num || '');
  }
  const intNum = Math.floor(num);

  // Special cases for 15 and 16
  if (intNum === 15) return 'ט״ו';
  if (intNum === 16) return 'ט״ז';

  const hundredsMap: [number, string][] = [
    [400, 'ת'],
    [300, 'ש'],
    [200, 'ר'],
    [100, 'ק']
  ];

  const tensMap: [number, string][] = [
    [90, 'צ'],
    [80, 'פ'],
    [70, 'ע'],
    [60, 'ס'],
    [50, 'נ'],
    [40, 'מ'],
    [30, 'ל'],
    [20, 'כ'],
    [10, 'י']
  ];

  const unitsMap: [number, string][] = [
    [9, 'ט'],
    [8, 'ח'],
    [7, 'ז'],
    [6, 'ו'],
    [5, 'ה'],
    [4, 'ד'],
    [3, 'ג'],
    [2, 'ב'],
    [1, 'א']
  ];

  let remainder = intNum;
  let result = '';

  for (const [val, letter] of hundredsMap) {
    while (remainder >= val) {
      result += letter;
      remainder -= val;
    }
  }

  if (remainder === 15) {
    result += 'טו';
    remainder = 0;
  } else if (remainder === 16) {
    result += 'טז';
    remainder = 0;
  } else {
    for (const [val, letter] of tensMap) {
      if (remainder >= val) {
        result += letter;
        remainder -= val;
        break;
      }
    }
    for (const [val, letter] of unitsMap) {
      if (remainder >= val) {
        result += letter;
        remainder -= val;
        break;
      }
    }
  }

  if (result.length === 1) {
    return `${result}׳`;
  } else if (result.length > 1) {
    return `${result.slice(0, -1)}״${result.slice(-1)}`;
  }
  return String(num);
}

/**
 * Convert Jewish Year (e.g. 5787) to Hebrew Gematria format (e.g. ה׳תשפ״ז)
 */
export function formatHebrewYear(yearNum: number): string {
  if (yearNum >= 5000 && yearNum < 6000) {
    const thousandsPrefix = "ה׳";
    const subYear = yearNum - 5000;
    const subYearGematria = numberToHebrewGematria(subYear);
    return `${thousandsPrefix}${subYearGematria}`;
  }
  return numberToHebrewGematria(yearNum);
}

/**
 * Standardize and clean Hebrew month names (e.g., "אב" -> "מנחם אב", "חשון" -> "מרחשון")
 */
export function formatHebrewMonthName(monthName: string): string {
  if (!monthName) return '';
  const cleaned = monthName.trim().replace(/\s+/g, ' ');

  if (cleaned === 'אב' || cleaned === 'חודש אב') {
    return 'מנחם אב';
  }
  if (cleaned === 'מרחשוון' || cleaned === 'חשון' || cleaned === 'בחשוון' || cleaned === 'בחשון') {
    return 'מרחשון';
  }
  if (cleaned === 'סיון' || cleaned === 'סיוון' || cleaned === 'בסיון' || cleaned === 'בסיוון') {
    return 'סיון';
  }
  if (/^ב?אדר\s*1$|^ב?אדר\s*א['׳]?$|^ב?אדר\s*ראשון$/i.test(cleaned)) {
    return 'אדר א׳';
  }
  if (/^ב?אדר\s*2$|^ב?אדר\s*ב['׳]?$|^ב?אדר\s*שני$/i.test(cleaned)) {
    return 'אדר ב׳';
  }
  if (cleaned.startsWith('ב') && cleaned.length > 3) {
    return cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Format date to comprehensive authentic Hebrew Calendar with full Gematria (e.g., "כ״ד מרחשון ה׳תשפ״ז")
 */
export function formatDateHebrewFull(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '-';
  try {
    let d: Date;
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (!trimmed) return '-';
      const parts = trimmed.split('T')[0].split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      } else {
        d = new Date(trimmed);
      }
    } else {
      d = new Date(dateInput);
    }

    if (isNaN(d.getTime())) return String(dateInput);

    const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const parts = formatter.formatToParts(d);
    const dayStr = parts.find(p => p.type === 'day')?.value || '';
    const monthStr = parts.find(p => p.type === 'month')?.value || '';
    const yearStr = parts.find(p => p.type === 'year')?.value || '';

    const parsedDay = parseInt(dayStr.replace(/\D/g, ''), 10);
    const hebrewDay = !isNaN(parsedDay) ? numberToHebrewGematria(parsedDay) : dayStr;

    const hebrewMonth = formatHebrewMonthName(monthStr);

    const parsedYear = parseInt(yearStr.replace(/\D/g, ''), 10);
    let hebrewYear = yearStr;
    if (!isNaN(parsedYear)) {
      hebrewYear = formatHebrewYear(parsedYear);
    } else if (yearStr && !yearStr.startsWith('ה׳') && !yearStr.startsWith("ה'")) {
      hebrewYear = `ה׳${yearStr}`;
    }

    return `${hebrewDay} ${hebrewMonth} ${hebrewYear}`.trim();
  } catch (e) {
    console.warn('Error in formatDateHebrewFull:', e);
    return String(dateInput);
  }
}

/**
 * Format date & time to traditional Hebrew Calendar (e.g., "כ״ד מרחשון ה׳תשפ״ז, 14:30")
 */
export function formatDateTimeToHebrewCalendar(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const datePart = formatDateHebrewFull(d);
    const timePart = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    return `${datePart}, ${timePart}`;
  } catch {
    return String(dateInput);
  }
}
