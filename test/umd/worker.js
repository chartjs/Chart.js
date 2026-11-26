// Classic web worker of the smoke suite (test/umd/umd.spec.js): loads the
// built bundle with importScripts, creates a chart on the OffscreenCanvas it is
// sent and checks that the chart chose the basic platform.

// Receives one message with data of type: { canvas: OffscreenCanvas }
// Sends messages with data of types: { type: 'success' } | { type: 'error', errorMessage: string }

// The same URL test/setup.umd.js loads in the page.
importScripts('/dist/chart.umd.min.js');

onmessage = function(event) {
  try {
    const {canvas} = event.data;
    const chart = new Chart(canvas);
    if (!(chart.platform instanceof Chart.platforms.BasicPlatform)) {
      throw new Error('did not use basic platform for chart in web worker');
    }

    postMessage({type: 'success'});
  } catch (error) {
    postMessage({type: 'error', errorMessage: error.stack});
  }
};
