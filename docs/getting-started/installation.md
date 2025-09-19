# Installation

## npm

[![npm](https://img.shields.io/npm/v/chart.js.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chart.js)
[![npm](https://img.shields.io/npm/dm/chart.js.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chart.js)

```sh
npm install chart.js
```

## CDN

### CDNJS

[![cdnjs](https://img.shields.io/cdnjs/v/Chart.js.svg?style=flat-square&maxAge=600)](https://cdnjs.com/libraries/Chart.js)

Chart.js built files are available on [CDNJS](https://cdnjs.com/):

<https://cdnjs.com/libraries/Chart.js>

### jsDelivr

[![jsdelivr](https://img.shields.io/npm/v/chart.js.svg?label=jsdelivr&style=flat-square&maxAge=600)](https://cdn.jsdelivr.net/npm/chart.js@latest/dist/) [![jsdelivr hits](https://data.jsdelivr.com/v1/package/npm/chart.js/badge)](https://www.jsdelivr.com/package/npm/chart.js)

Chart.js built files are also available through [jsDelivr](https://www.jsdelivr.com/):

<https://www.jsdelivr.com/package/npm/chart.js?path=dist>

## Security Considerations

When loading Chart.js from a CDN, it's recommended to use **Subresource Integrity (SRI)** to protect against tampered or malicious scripts. Here are secure examples:

### CDNJS with SRI

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.min.js" 
        integrity="sha512-n/G+dROKbKL3GVngGWmWfwK0yPctjZQM752diVYnXZtD/48agpUKLIn0xDQL9ydZ91x6BiOmTIFwWjjFi2kEFg==" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer">
</script>
```

### jsDelivr with SRI

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.min.js" 
        integrity="sha512-n/G+dROKbKL3GVngGWmWfwK0yPctjZQM752diVYnXZtD/48agpUKLIn0xDQL9ydZ91x6BiOmTIFwWjjFi2kEFg==" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer">
</script>
```

**Benefits of SRI:**
- Prevents execution of tampered scripts from CDNs
- Protects against supply chain attacks
- Ensures script integrity in production environments

You can generate integrity hashes for any Chart.js version using tools like [SRI Hash Generator](https://www.srihash.org/) or find them on [cdnjs.com](https://cdnjs.com/libraries/Chart.js).

## GitHub

[![github](https://img.shields.io/github/release/chartjs/Chart.js.svg?style=flat-square&maxAge=600)](https://github.com/chartjs/Chart.js/releases/latest)

You can download the latest version of [Chart.js on GitHub](https://github.com/chartjs/Chart.js/releases/latest).

If you download or clone the repository, you must [build](../developers/contributing.md#building-and-testing) Chart.js to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is **strongly** advised.
