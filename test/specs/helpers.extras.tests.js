describe('Chart.helpers.extras', function() {
  it('should pass all arguments to a debounced function', async function() {
    var received;
    var debounced = Chart.helpers.debounce(function(first, second) {
      received = [first, second];
    }, 10);

    debounced('a', 'b');
    await new Promise(function(resolve) {
      setTimeout(resolve, 50);
    });

    expect(received).toEqual(['a', 'b']);
  });
});
