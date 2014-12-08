var screenshotsShouldMatch = require('./helpers/screenshots-should-match');

describe('Radar Chart', function() {
  it('should render responsive radar chart', function(done) {
    this.timeout(10000);

    screenshotsShouldMatch('radar.html', 'radar.png', done);
  });
});