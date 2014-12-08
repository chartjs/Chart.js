var screenshotsShouldMatch = require('./helpers/screenshots-should-match');

describe('Pie Chart', function() {
  it('should render responsive pie chart', function(done) {
    this.timeout(10000);

    screenshotsShouldMatch('pie.html', 'pie.png', done);
  });
});