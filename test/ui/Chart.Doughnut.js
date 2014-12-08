var screenshotsShouldMatch = require('./helpers/screenshots-should-match');

describe('Doughnut Chart', function() {
  it('should render responsive doughnut chart', function(done) {
    this.timeout(10000);

    screenshotsShouldMatch('doughnut.html', 'doughnut.png', done);
  });
});