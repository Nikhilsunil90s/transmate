const currencyCharacterTest = /[$\xA2-\xA5\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/;
const currencyCharacters = {
  "U+0024": "USD", // DOLLAR SIGN	$	view
  "U+00A3": "GBP", // POUND SIGN	£	view
  "U+00A5": "JPY", // YEN SIGN	¥	view
  "U+0E3F": "THB", // THAI CURRENCY SYMBOL BAHT	฿	view
  "U+20A9": "KRW", // WON SIGN	₩	view
  "U+20AB": "VND", // DONG SIGN	₫	view
  "U+20AC": "EUR", // EURO SIGN	€	view
  "U+20B9": "INR", // INDIAN RUPEE SIGN	₹	view
  "U+20BA": "TRY", // TURKISH LIRA SIGN	₺	view
  "U+FFE1": "GBP", // WIDE POUND SIGN	£	view
  "U+FF04": "USD", // FULLWIDTH DOLLAR SIGN	＄	view
  "U+FFE5": "JPY" // FULLWIDTH YEN SIGN	￥	view
};

// !! yen is used for multiple countries... 3 digit codes are better!

export function splitCurrency(stringValue = "") {
  // parse currency value:
  let unit;
  const unitSign = stringValue.match(currencyCharacterTest)?.[0];
  if (unitSign) {
    unit =
      currencyCharacters[
        `U+${unitSign
          .codePointAt(0)
          .toString(16)
          .toUpperCase()
          .padStart(4)}`
      ];
  } else {
    unit = stringValue.match(/[A-Z]{3}/)?.[0];
  }
  const val = stringValue.match(/(\d+)/)?.[0];
  const value = val ? parseFloat(val) : undefined;

  return { value, unit };
}
