# Accessible Charts

Chart.js charts are rendered on user provided `canvas` elements. Thus, it is up to the user to create the `canvas` element in a way that is accessible. The `canvas` element has support in all browsers and will render on screen but the `canvas` content will not be accessible to screen readers.

With `canvas`, the accessibility has to be added with `ARIA` attributes on the `canvas` element or added using internal fallback content placed within the opening and closing canvas tags.

This [website](http://pauljadam.com/demos/canvas.html) has a more detailed explanation of `canvas` accessibility as well as in depth examples.

## Examples

These are some examples of **accessible** `canvas` elements.

By setting the `role` and `aria-label`, this `canvas` now has an accessible name.

```html
<canvas id="goodCanvas1" width="400" height="100" aria-label="Hello ARIA World" role="img"></canvas>
```

This `canvas` element has a text alternative via fallback content.

```html
<canvas id="okCanvas2" width="400" height="100">
  <p>Hello Fallback World</p>
</canvas>
```

These are some bad examples of **inaccessible** `canvas` elements.

This `canvas` element does not have an accessible name or role.

```html
<canvas id="badCanvas1" width="400" height="100"></canvas>
```

This `canvas` element has inaccessible fallback content.

```html
<canvas id="badCanvas2" width="400" height="100">Your browser does not support the canvas element.</canvas>
```
