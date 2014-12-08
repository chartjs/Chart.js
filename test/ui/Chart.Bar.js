var screenshotsShouldMatch = require('./helpers/screenshots-should-match');

describe('Bar Chart', function() {
  it('should render responsive bar chart', function(done) {
    this.timeout(10000);

    screenshotsShouldMatch('bar.html', 'bar.png', done);
  });
});