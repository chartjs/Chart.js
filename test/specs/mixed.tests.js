describe('mixed chart', function() {

	fit('should draw all elements', function() {
		var randomScalingFactor = function() {
			return Math.random() * (200) - 100;
		};
		var sets = [];
		var childsTmp = [
			{type: 'scatter', color: '#f844'},
			{type: 'line', color: '#f484', fill: false},
			{type: 'bubble', color: '#8f44'},
			{type: 'bar', color: '#48f4'},
			{type: 'horizontalBar', color: '#84f4'},
		];
		childsTmp.forEach(function(child1) {
			childsTmp.forEach(function(child2) {
				childsTmp.forEach(function(child3) {
					sets.unshift({
						parents: ['bar'],
						childs: [child1, child2, child3],
					});
				});
			});
		});

		var size = 4;
		sets.forEach(function(set) {
			var parents = set.parents;
			var childs = set.childs;
			parents.forEach(function(parent) {
				var datasets = [];
				var childId = -1;
				var labels = [];
				childs.forEach(function(child) {
					childId++;
					var data = [];
					for (var i = 0; i < size; i++) {
						if (child.type === 'bubble') {
							data.push({x: randomScalingFactor(), y: randomScalingFactor(), r: Math.max(randomScalingFactor() / 2, 20)});
						} else if (child.type === 'scatter') {
							data.push({x: randomScalingFactor(), y: randomScalingFactor()});
						} else {
							data.push(randomScalingFactor());
						}
						if (childId === 0) {
							labels.push('label ' + (i + 1));
						}
					}
					datasets.push({
						type: child.type,
						label: child.type,
						borderColor: child.color,
						backgroundColor: child.color,
						data: data,
					});
					if (child.fill !== undefined) {
						datasets[datasets.length - 1].fill = child.fill;
					}
				});
				/* var div = document.createElement("div");
				var canvas = document.createElement("canvas");
				canvas.id = parent;
				div.appendChild(canvas);
				document.getElementById("container").appendChild(div); */
				var childListstr = '';
				childs.forEach(function(child) {
					childListstr += child.type + ', ';
				});
				childListstr = childListstr.slice(0, -2);
				var chart = null;
				chart = window.acquireChart({
					type: parent,
					data: {
						labels: labels,
						datasets: datasets,
					},
					options: {
						responsive: true,
						title: {
							display: true,
							text: 'Parent type : ' + parent + ' | Childs : ' + childListstr,
						},
						tooltips: {
							mode: 'index',
							intersect: true
						}
					}
				});

				var meta = chart.getDatasetMeta(0);
				spyOn(meta.dataset, 'draw');
				spyOn(meta.data[0], 'draw');
				spyOn(meta.data[1], 'draw');
				spyOn(meta.data[2], 'draw');
				spyOn(meta.data[3], 'draw');

				chart.update();

				expect(meta.data[0].draw.calls.count()).toBe(1);
				expect(meta.data[1].draw.calls.count()).toBe(1);
				expect(meta.data[2].draw.calls.count()).toBe(1);
				expect(meta.data[3].draw.calls.count()).toBe(1);

			});
		});
	});
});
