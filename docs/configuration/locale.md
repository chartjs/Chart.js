# Locale

For applications where the numbers of ticks on scales must be formatted accordingly with a language sensitive number formatting, you can enable this kind of formatting by setting the `locale` option.

The locale is a string that is a [Unicode BCP 47 locale identifier](https://www.unicode.org/reports/tr35/tr35.html#BCP_47_Conformance).

A Unicode BCP 47 locale identifier consists of

  1. a language code,
  2. (optionally) a script code,
  3. (optionally) a region (or country) code,
  4. (optionally) one or more variant codes, and
  5. (optionally) one or more extension sequences,

with all present components separated by hyphens.

By default the chart is using the default locale of the platform which is running on.

## Configuration Options

Namespace: `options`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `locale` | `string` | `undefined` | a string with a BCP 47 language tag, leveraging on [INTL NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).
