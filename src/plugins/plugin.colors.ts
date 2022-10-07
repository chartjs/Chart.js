import { Chart } from "../types";

const BORDER_COLORS = [
  '#36A2EB', // blue
  '#FF6384', // red
  '#FF9F40', // orange
  '#4BC0C0', // green
  '#FFCD56', // yellow
  '#9966FF', // purple
  '#C9CBCF', // grey
];

// Primary colors with 50% transparency, mixed with white
const BACKGROUND_COLORS = [
  '#9BD0F5', // blue
  '#FFB1C1', // red
  '#FFCF9F', // orange
  '#A5DFDF', // green
  '#FFE6AA', // yellow
  '#CCB3FF', // purple
  '#E4E5E7', // grey
];

function getBorderColor(i: number) {
  return BORDER_COLORS[i % BORDER_COLORS.length];
}

function getBackgroundColor(i: number) {
  return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
}

export default {
  id: 'colors',

  beforeLayout(chart: Chart) {
    chart.data.datasets.forEach((dataset, i) => {
      if (!dataset.borderColor) {
        dataset.borderColor = getBorderColor(i);
      }

      if (!dataset.backgroundColor) {
        dataset.backgroundColor = getBackgroundColor(i);
      }
    });
  },
};
