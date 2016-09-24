describe('Chart.Controller', function() {

	function processResizeEvent(chart, callback) {
		setTimeout(callback, 100);
	}

	describe('config.options.aspectRatio', function() {
		it('should use default "global" aspect ratio for render and display sizes', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: 'width: 620px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 620, dh: 310,
				rw: 620, rh: 310,
			});
		});

		it('should use default "chart" aspect ratio for render and display sizes', function() {
			var chart = acquireChart({
				type: 'doughnut',
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: 'width: 425px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 425, dh: 425,
				rw: 425, rh: 425,
			});
		});

		it('should use "user" aspect ratio for render and display sizes', function() {
			var chart = acquireChart({
				options: {
					responsive: false,
					aspectRatio: 3
				}
			}, {
				canvas: {
					style: 'width: 405px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 405, dh: 135,
				rw: 405, rh: 135,
			});
		});

		it('should NOT apply aspect ratio when height specified', function() {
			var chart = acquireChart({
				options: {
					responsive: false,
					aspectRatio: 3
				}
			}, {
				canvas: {
					style: 'width: 400px; height: 410px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 400, dh: 410,
				rw: 400, rh: 410,
			});
		});
	});

	describe('config.options.responsive: false', function() {
		it('should use default canvas size for render and display sizes', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: ''
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 150,
				rw: 300, rh: 150,
			});
		});

		it('should use canvas attributes for render and display sizes', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: '',
					width: 305,
					height: 245,
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 305, dh: 245,
				rw: 305, rh: 245,
			});
		});

		it('should use canvas style for render and display sizes (if no attributes)', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: 'width: 345px; height: 125px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 345, dh: 125,
				rw: 345, rh: 125,
			});
		});

		it('should use attributes for the render size and style for the display size', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: 'width: 345px; height: 125px;',
					width: 165,
					height: 85,
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 345, dh: 125,
				rw: 165, rh: 85,
			});
		});

		it('should NOT inject the resizer element', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			});

			var wrapper = chart.chart.canvas.parentNode;
			expect(wrapper.childNodes.length).toBe(1);
			expect(wrapper.firstChild.tagName).toBe('CANVAS');
		});
	});

	describe('config.options.responsive: true (maintainAspectRatio: false)', function() {
		it('should fill parent width and height', function() {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: 'width: 150px; height: 245px'
				},
				wrapper: {
					style: 'width: 300px; height: 350px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});
		});

		it('should resize the canvas when parent width changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});

			var wrapper = chart.chart.canvas.parentNode;
			wrapper.style.width = '455px';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 350,
					rw: 455, rh: 350,
				});

				wrapper.style.width = '150px';
				processResizeEvent(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 350,
						rw: 150, rh: 350,
					});

					done();
				});
			});
		});

		it('should resize the canvas when parent height changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});

			var wrapper = chart.chart.canvas.parentNode;
			wrapper.style.height = '455px';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 300, dh: 455,
					rw: 300, rh: 455,
				});

				wrapper.style.height = '150px';
				processResizeEvent(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 300, dh: 150,
						rw: 300, rh: 150,
					});

					done();
				});
			});
		});

		it('should NOT include parent padding when resizing the canvas', function(done) {
			var chart = acquireChart({
				type: 'line',
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'padding: 50px; width: 320px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 350,
				rw: 320, rh: 350,
			});

			var wrapper = chart.chart.canvas.parentNode;
			wrapper.style.height = '355px';
			wrapper.style.width = '455px';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				done();
			});
		});

		it('should resize the canvas when the canvas display style changes from "none" to "block"', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: 'display: none;'
				},
				wrapper: {
					style: 'width: 320px; height: 350px'
				}
			});

			var canvas = chart.chart.canvas;
			canvas.style.display = 'block';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 350,
					rw: 320, rh: 350,
				});

				done();
			});
		});

		it('should resize the canvas when the wrapper display style changes from "none" to "block"', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'display: none; width: 460px; height: 380px'
				}
			});

			var wrapper = chart.chart.canvas.parentNode;
			wrapper.style.display = 'block';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 460, dh: 380,
					rw: 460, rh: 380,
				});

				done();
			});
		});
	});

	describe('config.options.responsive: true (maintainAspectRatio: true)', function() {
		it('should fill parent width and use aspect ratio to calculate height', function() {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: true
				}
			}, {
				canvas: {
					style: 'width: 150px; height: 245px'
				},
				wrapper: {
					style: 'width: 300px; height: 350px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 490,
				rw: 300, rh: 490,
			});
		});

		it('should resize the canvas with correct apect ratio when parent width changes', function(done) {
			var chart = acquireChart({
				type: 'line', // AR == 2
				options: {
					responsive: true,
					maintainAspectRatio: true
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 150,
				rw: 300, rh: 150,
			});

			var wrapper = chart.chart.canvas.parentNode;
			wrapper.style.width = '450px';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 450, dh: 225,
					rw: 450, rh: 225,
				});

				wrapper.style.width = '150px';
				processResizeEvent(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 75,
						rw: 150, rh: 75,
					});

					done();
				});
			});
		});

		it('should NOT resize the canvas when parent height changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: true
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 320px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 160,
				rw: 320, rh: 160,
			});

			var wrapper = chart.chart.canvas.parentNode;
			wrapper.style.height = '455px';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 160,
					rw: 320, rh: 160,
				});

				wrapper.style.height = '150px';
				processResizeEvent(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 320, dh: 160,
						rw: 320, rh: 160,
					});

					done();
				});
			});
		});
	});

	describe('controller.destroy', function() {
		it('should restore canvas (and context) initial values', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					width: 180,
					style: 'width: 512px; height: 480px'
				},
				wrapper: {
					style: 'width: 450px; height: 450px; position: relative'
				}
			});

			var canvas = chart.chart.canvas;
			var wrapper = canvas.parentNode;
			wrapper.style.width = '475px';
			processResizeEvent(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 475, dh: 450,
					rw: 475, rh: 450,
				});

				chart.destroy();

				expect(canvas.getAttribute('width')).toBe('180');
				expect(canvas.getAttribute('height')).toBe(null);
				expect(canvas.style.width).toBe('512px');
				expect(canvas.style.height).toBe('480px');
				expect(canvas.style.display).toBe('');

				done();
			});
		});

		it('should remove the resizer element when responsive: true', function() {
			var chart = acquireChart({
				options: {
					responsive: true
				}
			});

			var wrapper = chart.chart.canvas.parentNode;
			var resizer = wrapper.firstChild;

			expect(wrapper.childNodes.length).toBe(2);
			expect(resizer.tagName).toBe('IFRAME');

			chart.destroy();

			expect(wrapper.childNodes.length).toBe(1);
			expect(wrapper.firstChild.tagName).toBe('CANVAS');
		});
	});
});
