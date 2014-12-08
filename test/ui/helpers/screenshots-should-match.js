var path = require('path');
var fs = require('fs');

var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;

var buffertools = require('buffertools');
var expect = require('chai').expect;

module.exports = function screenshotsShouldMatch(chartFile, expectedFile, done) {
  var outputFile = path.join(__dirname, '../../_tmp', expectedFile);
  var expectedPath = path.join(__dirname, '../fixtures', expectedFile);

  var childArgs = [
    path.join(__dirname, '../phantom/rasterize.js'),
    'test/ui/fixtures/' + chartFile,
    outputFile
  ];

  childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    if (err) {
      console.log(stderr);
    }

    expect(err).to.not.exist;

    var actual = fs.readFileSync(outputFile);
    var expected = fs.readFileSync(expectedPath);

    expect(buffertools.compare(expected, actual)).to.equal(0);

    done();
  });
};