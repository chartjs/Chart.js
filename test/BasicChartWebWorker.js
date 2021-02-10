// This file is a basic example of using a chart inside a web worker.
// All it creates a new chart from a transferred OffscreenCanvas and then assert that the correct platform type was
// used.

// Receives messages with data of type: { type: 'initialize', canvas: OffscreenCanvas }
// Sends messages with data of types: { type: 'success' } | { type: 'error', errorMessage: string }

// eslint-disable-next-line no-undef
importScripts('../src/chart.js');

onmessage = function(event) {
  try {
    const {type, canvas} = event.data;
    if (type !== 'initialize') {
      throw new Error('invalid message type received by worker: ' + type);
    }

    const chart = new Chart(canvas);
    if (!(chart.platform instanceof Chart.platforms.BasicPlatform)) {
      throw new Error('did not use basic platform for chart in web worker');
    }

    postMessage({type: 'success'});
  } catch (error) {
    postMessage({type: 'error', errorMessage: error.stack});
  }
};
