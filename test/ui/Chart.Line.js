var screenshotsShouldMatch = require('./helpers/screenshots-should-match');

describe('Line Chart', function() {
  it('should render responsive line chart', function(done) {
    this.timeout(10000);

    screenshotsShouldMatch('line.html', 'line.png', done);
  });
});