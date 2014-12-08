var screenshotsShouldMatch = require('./helpers/screenshots-should-match');

describe('Polar Area Chart', function() {
  it('should render responsive polar area chart', function(done) {
    this.timeout(10000);

    screenshotsShouldMatch('polar-area.html', 'polar-area.png', done);
  });
});