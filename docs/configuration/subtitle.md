# Subtitle

Subtitle is a second title placed under the main title, by default. It has exactly the same configuration options with the main [title](./title.md).

## Subtitle Configuration

Namespace: `options.plugins.subtitle`. The global defaults for subtitle are configured in `Chart.defaults.plugins.subtitle`.

Exactly the same configuration options with [title](./title.md) are available for subtitle, the namespaces only differ.

## Example Usage

The example below would enable a title of 'Custom Chart Subtitle' on the chart that is created.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            subtitle: {
                display: true,
                text: 'Custom Chart Subtitle'
            }
        }
    }
});
```
