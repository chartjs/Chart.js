
const intlCache = new Map<string, Intl.NumberFormat>();

function getNumberFormat(locale: string, options?: Intl.NumberFormatOptions) {
  options = options || {};
  const cacheKey = locale + JSON.stringify(options);
  let formatter = intlCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    intlCache.set(cacheKey, formatter);
  }
  return formatter;
}

export function formatNumber(num: number, locale: string, options?: Intl.NumberFormatOptions) {
  return getNumberFormat(locale, options).format(num);
}
