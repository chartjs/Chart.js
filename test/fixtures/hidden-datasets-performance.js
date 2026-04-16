const datasets = [];

for (let i = 0; i < 200; i++) {
  datasets.push({
    label: `Dataset ${i}`,
    data: Array.from({ length: 100 }, () => Math.random() * 100),
    hidden: i !== 0 // only 1 visible
  });
}

new Chart(ctx, {
  type: 'line',
  data: {
    labels: Array.from({ length: 100 }, (_, i) => i),
    datasets
  }
});
