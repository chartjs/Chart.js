describe('Plugin.filler', function() {
	function decodedFillValues(chart) {
		return chart.data.datasets.map(function(dataset, index) {
			var meta = chart.getDatasetMeta(index) || {};
			expect(meta.$filler).toBeDefined();
			return meta.$filler.fill;
		});
	}

	describe('auto', jasmine.fixture.specs('plugin.filler'));

	describe('dataset.fill', function() {
		it('should support boundaries', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: 'origin'},
						{fill: 'start'},
						{fill: 'end'},
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual(['origin', 'start', 'end']);
		});

		it('should support absolute dataset index', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: 1},
						{fill: 3},
						{fill: 0},
						{fill: 2},
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual([1, 3, 0, 2]);
		});

		it('should support relative dataset index', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: '+3'},
						{fill: '-1'},
						{fill: '+1'},
						{fill: '-2'},
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual([
				3, // 0 + 3
				0, // 1 - 1
				3, // 2 + 1
				1, // 3 - 2
			]);
		});

		it('should handle default fill when true (origin)', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: true},
						{fill: false},
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual(['origin', false]);
		});

		it('should ignore self dataset index', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: 0},
						{fill: '-0'},
						{fill: '+0'},
						{fill: 3},
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual([
				false, // 0 === 0
				false, // 1 === 1 - 0
				false, // 2 === 2 + 0
				false, // 3 === 3
			]);
		});

		it('should ignore out of bounds dataset index', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: -2},
						{fill: 4},
						{fill: '-3'},
						{fill: '+1'},
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual([
				false, // 0 - 2 < 0
				false, // 1 + 4 > 3
				false, // 2 - 3 < 0
				false, // 3 + 1 > 3
			]);
		});

		it('should ignore invalid values', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: 'foo'},
						{fill: '+foo'},
						{fill: '-foo'},
						{fill: '+1.1'},
						{fill: '-2.2'},
						{fill: 3.3},
						{fill: -4.4},
						{fill: NaN},
						{fill: Infinity},
						{fill: ''},
						{fill: null},
						{fill: []},
						{fill: {}},
						{fill: function() {}}
					]
				}
			});

			expect(decodedFillValues(chart)).toEqual([
				false, // NaN (string)
				false, // NaN (string)
				false, // NaN (string)
				false, // float (string)
				false, // float (string)
				false, // float (number)
				false, // float (number)
				false, // NaN
				false, // !isFinite
				false, // empty string
				false, // null
				false, // array
				false, // object
				false, // function
			]);
		});
	});

	describe('options.plugins.filler.propagate', function() {
		it('should compute propagated fill targets if true', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: 'start', hidden: true},
						{fill: '-1', hidden: true},
						{fill: 1, hidden: true},
						{fill: '-2', hidden: true},
						{fill: '+1'},
						{fill: '+2'},
						{fill: '-1'},
						{fill: 'end', hidden: true},
					]
				},
				options: {
					plugins: {
						filler: {
							propagate: true
						}
					}
				}
			});


			expect(decodedFillValues(chart)).toEqual([
				'start', // 'start'
				'start', // 1 - 1 -> 0 (hidden) -> 'start'
				'start', // 1 (hidden) -> 0 (hidden) -> 'start'
				'start', // 3 - 2 -> 1 (hidden) -> 0 (hidden) -> 'start'
				5,       // 4 + 1
				'end',   // 5 + 2 -> 7 (hidden) -> 'end'
				5,       // 6 - 1 -> 5
				'end',   // 'end'
			]);
		});

		it('should preserve initial fill targets if false', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: 'start', hidden: true},
						{fill: '-1', hidden: true},
						{fill: 1, hidden: true},
						{fill: '-2', hidden: true},
						{fill: '+1'},
						{fill: '+2'},
						{fill: '-1'},
						{fill: 'end', hidden: true},
					]
				},
				options: {
					plugins: {
						filler: {
							propagate: false
						}
					}
				}
			});

			expect(decodedFillValues(chart)).toEqual([
				'start', // 'origin'
				0,       // 1 - 1
				1,       // 1
				1,       // 3 - 2
				5,       // 4 + 1
				7,       // 5 + 2
				5,       // 6 - 1
				'end',   // 'end'
			]);
		});

		it('should prevent recursive propagation', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [
						{fill: '+2', hidden: true},
						{fill: '-1', hidden: true},
						{fill: '-1', hidden: true},
						{fill: '-2'}
					]
				},
				options: {
					plugins: {
						filler: {
							propagate: true
						}
					}
				}
			});

			expect(decodedFillValues(chart)).toEqual([
				false, // 0 + 2 -> 2 (hidden) -> 1 (hidden) -> 0 (loop)
				false, // 1 - 1 -> 0 (hidden) -> 2 (hidden) -> 1 (loop)
				false, // 2 - 1 -> 1 (hidden) -> 0 (hidden) -> 2 (loop)
				false, // 3 - 2 -> 1 (hidden) -> 0 (hidden) -> 2 (hidden) -> 1 (loop)
			]);
		});
	});
});
