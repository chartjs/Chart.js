import type {Chart, ChartArea, ChartMeta, Scale, TRBL} from '../types/index.js';

function getSizeForArea(scale: Scale, chartArea: ChartArea, field: keyof ChartArea) {
  return scale.options.clip ? scale[field] : chartArea[field];
}

function getDatasetArea(meta: ChartMeta, chartArea: ChartArea): TRBL {
  const {xScale, yScale} = meta;
  if (xScale && yScale) {
    return {
      left: getSizeForArea(xScale, chartArea, 'left'),
      right: getSizeForArea(xScale, chartArea, 'right'),
      top: getSizeForArea(yScale, chartArea, 'top'),
      bottom: getSizeForArea(yScale, chartArea, 'bottom')
    };
  }
  return chartArea;
}

export function getDatasetClipArea(chart: Chart, meta: ChartMeta): TRBL | false {
  const clip = meta._clip;
  if (clip.disabled) {
    return false;
  }
  const area = getDatasetArea(meta, chart.chartArea);

  return {
    left: clip.left === false ? 0 : area.left - (clip.left === true ? 0 : clip.left),
    right: clip.right === false ? chart.width : area.right + (clip.right === true ? 0 : clip.right),
    top: clip.top === false ? 0 : area.top - (clip.top === true ? 0 : clip.top),
    bottom: clip.bottom === false ? chart.height : area.bottom + (clip.bottom === true ? 0 : clip.bottom)
  };
}
