function x(ctx, {min = -Infinity, max = Infinity}) {
  return (ctx.p0.parsed.x >= min || ctx.p1.parsed.x >= min) && (ctx.p0.parsed.x < max && ctx.p1.parsed.x < max);
}

function y(ctx, {min = -Infinity, max = Infinity}) {
  return (ctx.p0.parsed.y >= min || ctx.p1.parsed.y >= min) && (ctx.p0.parsed.y < max || ctx.p1.parsed.y < max);
}

function xy(ctx, xr, yr) {
  return x(ctx, xr) && y(ctx, yr);
}

module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 7}, {x: 7, y: 8}],
        borderColor: 'black',
        segment: {
          borderColor: ctx => x(ctx, {min: 3, max: 4}) ? 'red' : y(ctx, {min: 5}) ? 'green' : xy(ctx, {min: 0}, {max: 1}) ? 'blue' : undefined,
          borderDash: ctx => x(ctx, {min: 3, max: 4}) || y(ctx, {min: 5}) ? [5, 5] : undefined,
        }
      }]
    },
    options: {
      scales: {
        x: {type: 'linear', display: false},
        y: {display: false}
      }
    }
  }
};
