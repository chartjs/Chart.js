describe('Legend block tests', function() {
  describe('vertical legend titles', function() {
    const padding = {left: 7, right: 17};

    function measureTitleLine(chart, line) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = Chart.helpers.toFont(chart.legend.options.title.font).string;
      const width = ctx.measureText(line).width;
      ctx.restore();
      return width;
    }

    for (const position of ['left', 'right']) {
      for (const fontSize of [12, 24]) {
        it(`should fit a long title on the ${position} with font size ${fontSize}`, function() {
          const title = 'A title wider than the legend labels';
          const chart = window.acquireChart({
            type: 'doughnut',
            data: {
              labels: ['A', 'B'],
              datasets: [{data: [1, 2]}]
            },
            options: {
              plugins: {
                legend: {
                  position,
                  title: {display: true, text: title, font: {size: fontSize}, padding}
                }
              }
            }
          }, {canvas: {width: 1200, height: 400}});

          expect(chart.legend.width).toBe(measureTitleLine(chart, title) + padding.left + padding.right + 10);
          const widthWithTitle = chart.legend.width;
          chart.options.plugins.legend.title.display = false;
          chart.update();
          expect(chart.legend.width).toBeLessThan(widthWithTitle);
        });
      }
    }

    it('should fit the widest line of a multi-line title', function() {
      const widest = 'A title line wider than the legend labels';
      const chart = window.acquireChart({
        type: 'doughnut',
        data: {labels: ['A'], datasets: [{data: [1]}]},
        options: {
          plugins: {
            legend: {
              position: 'left',
              title: {display: true, text: ['Short', widest, 'Last line'], padding}
            }
          }
        }
      }, {canvas: {width: 1200, height: 400}});

      expect(chart.legend.width).toBe(measureTitleLine(chart, widest) + padding.left + padding.right + 10);
    });

    it('should respect maxWidth when the title is wider', function() {
      const chart = window.acquireChart({
        type: 'doughnut',
        data: {labels: ['A'], datasets: [{data: [1]}]},
        options: {
          plugins: {
            legend: {
              position: 'left',
              maxWidth: 100,
              title: {display: true, text: 'A title wider than the legend labels'}
            }
          }
        }
      }, {canvas: {width: 1200, height: 400}});

      expect(chart.legend.width).toBe(100);
    });
  });

  describe('title padding', function() {
    function titleX(position, legendPosition) {
      const chart = window.acquireChart({
        type: 'bar',
        data: {labels: [], datasets: [{label: 'a', data: []}, {label: 'b', data: []}]},
        options: {plugins: {legend: {
          position: legendPosition,
          title: {display: true, text: 'TITLE', position, padding: {left: 50, right: 10}}
        }}}
      });
      const spy = vi.spyOn(chart.ctx, 'fillText');
      chart.legend.drawTitle();
      const l = chart.legend;
      const inner = l.isHorizontal() ? Math.max(...l.lineWidths) : l.width;
      const left = l.isHorizontal() ? l.left + (l.width - inner) / 2 : l.left;
      return {x: spy.mock.calls.find(a => a[0] === 'TITLE')[1], left, inner};
    }
    ['top', 'left'].forEach(legendPosition => {
      it(`offsets start by padding.left, legend ${legendPosition}`, function() {
        const r = titleX('start', legendPosition);
        expect(r.x).toBeCloseTo(r.left + 50, 3);
      });
      it(`offsets end by padding.right, legend ${legendPosition}`, function() {
        const r = titleX('end', legendPosition);
        expect(r.x).toBeCloseTo(r.left + r.inner - 10, 3);
      });
      it(`shifts center by (left - right) / 2, legend ${legendPosition}`, function() {
        const r = titleX('center', legendPosition);
        expect(r.x).toBeCloseTo(r.left + r.inner / 2 + (50 - 10) / 2, 3);
      });
    });
  });

  it('should have the correct default config', function() {
    expect(Chart.defaults.plugins.legend).toEqual({
      display: true,
      position: 'top',
      align: 'center',
      fullSize: true,
      reverse: false,
      weight: 1000,

      // a callback that will handle
      onClick: expect.any(Function),
      onHover: null,
      onLeave: null,

      labels: {
        color: expect.any(Function),
        boxWidth: 40,
        padding: 10,
        generateLabels: expect.any(Function)
      },

      title: {
        color: expect.any(Function),
        display: false,
        position: 'center',
        text: '',
      }
    });
  });

  it('should update bar chart correctly', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'miter',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          data: []
        }],
        labels: []
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: 'crossRot',
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }]);
  });

  it('should update line chart correctly', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'round',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'round',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          fill: false,
          data: []
        }],
        labels: []
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: 'round',
      lineDash: [2, 2],
      lineDashOffset: 5.5,
      lineJoin: 'miter',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'round',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }]);
  });

  it('should take the dataset dash for a line point style', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'solid',
          data: []
        }, {
          label: 'dashed',
          borderDash: [6, 3],
          borderDashOffset: 4,
          data: []
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'line'
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems.map(function(item) {
      return item.lineDash;
    })).toEqual([[], [6, 3]]);
    expect(chart.legend.legendItems.map(function(item) {
      return item.lineDashOffset;
    })).toEqual([0, 4]);
  });

  it('should leave other point styles solid', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'dashed',
          borderDash: [6, 3],
          data: []
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems[0].lineDash).toBeUndefined();
  });

  it('should reverse correctly', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'round',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'round',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          fill: false,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            reverse: true
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'round',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: 'round',
      lineDash: [2, 2],
      lineDashOffset: 5.5,
      lineJoin: 'miter',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should filter items', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'miter',
          data: [],
          legendHidden: true,
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderRadius: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              filter: function(legendItem, data) {
                var dataset = data.datasets[legendItem.datasetIndex];
                return !dataset.legendHidden;
              }
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 0,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: 'crossRot',
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }]);
  });

  it('should sort items', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'round',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          data: []
        }, {
          label: 'dataset2',
          hidden: true,
          borderJoinStyle: 'round',
          data: []
        }, {
          label: 'dataset3',
          borderWidth: 10,
          borderColor: 'green',
          pointStyle: 'crossRot',
          fill: false,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              sort: function(a, b) {
                return b.datasetIndex > a.datasetIndex ? 1 : -1;
              }
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset3',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 10,
      strokeStyle: 'green',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 2
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: true,
      lineCap: 'butt',
      lineDash: [],
      lineDashOffset: 0,
      lineJoin: 'round',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 1
    }, {
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: 'round',
      lineDash: [2, 2],
      lineDashOffset: 5.5,
      lineJoin: 'miter',
      lineWidth: 3,
      strokeStyle: 'rgba(0,0,0,0.1)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should not throw when the label options are missing', function() {
    var makeChart = function() {
      window.acquireChart({
        type: 'bar',
        data: {
          datasets: [{
            label: 'dataset1',
            backgroundColor: '#f31',
            borderCapStyle: 'butt',
            borderDash: [2, 2],
            borderDashOffset: 5.5,
            data: []
          }],
          labels: []
        },
        options: {
          plugins: {
            legend: {
              labels: false,
            }
          }
        }
      });
    };
    expect(makeChart).not.toThrow();
  });

  it('should not draw legend items outside of the chart bounds', function() {
    var chart = window.acquireChart(
      {
        type: 'line',
        data: {
          datasets: [1, 2, 3].map(function(n) {
            return {
              label: 'dataset' + n,
              data: []
            };
          }),
          labels: []
        },
        options: {
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      },
      {
        canvas: {
          width: 512,
          height: 105
        }
      }
    );

    // Check some basic assertions about the test setup
    expect(chart.width).toBe(512);
    expect(chart.legend.legendHitBoxes.length).toBe(3);

    // Check whether any legend items reach outside the established bounds
    chart.legend.legendHitBoxes.forEach(function(item) {
      expect(item.left + item.width).toBeLessThanOrEqual(chart.width);
    });
  });

  it('should draw legend with multiline labels', function() {
    const chart = window.acquireChart({
      type: 'doughnut',
      data: {
        labels: [
          'ABCDE',
          [
            'ABCDE',
            'ABCDE',
          ],
          [
            'Some Text',
            'Some Text',
            'Some Text',
          ],
          'ABCDE',
        ],
        datasets: [
          {
            label: 'test',
            data: [
              73.42,
              18.13,
              7.54,
              0.9,
              0.0025,
              1.8e-5,
            ],
            backgroundColor: [
              '#0078C2',
              '#56CAF5',
              '#B1E3F9',
              '#FBBC8D',
              '#F6A3BE',
              '#4EC2C1',
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'rect',
            },
            position: 'right',
            align: 'center',
            maxWidth: 860,
          },
        },
        aspectRatio: 3,
      },
    });

    // Check some basic assertions about the test setup
    expect(chart.legend.legendHitBoxes.length).toBe(4);

    // Check whether any legend items reach outside the established bounds
    chart.legend.legendHitBoxes.forEach(function(item) {
      expect(item.left + item.width).toBeLessThanOrEqual(chart.width);
    });
  });

  ['left', 'right'].forEach(function(position) {
    it('should fit the widest line of a multiline ' + position + ' legend label', function() {
      const chart = window.acquireChart({
        type: 'doughnut',
        data: {
          labels: [['WWW', 'iiiiiiii']],
          datasets: [{data: [1]}]
        },
        options: {
          plugins: {
            legend: {
              position,
              labels: {
                font: {family: 'Arial'}
              }
            }
          }
        }
      });

      const ctx = chart.ctx;
      ctx.font = Chart.helpers.toFont(chart.legend.options.labels.font).string;
      expect(ctx.measureText('WWW').width).toBeGreaterThan(ctx.measureText('iiiiiiii').width);

      const multilineWidth = chart.legend.width;
      const multilineHitboxWidth = chart.legend.legendHitBoxes[0].width;
      chart.data.labels[0] = 'WWW';
      chart.update();

      expect(multilineWidth).toBeCloseTo(chart.legend.width, 5);
      expect(multilineHitboxWidth).toBeCloseTo(chart.legend.legendHitBoxes[0].width, 5);
    });
  });

  describe('labels that are not strings', function() {
    // Draws a pie chart and returns its hit boxes and the text the legend drew.
    function drawPie(labels, position) {
      const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');
      const chart = window.acquireChart({
        type: 'pie',
        data: {
          labels,
          datasets: [{data: labels.map(() => 1)}]
        },
        options: {
          animation: false,
          plugins: {
            legend: {position}
          }
        }
      });
      const drawn = fillText.mock.calls.map(([text, x, y]) => ({text: String(text), x, y}));
      fillText.mockRestore();
      const hitBoxes = chart.legend.legendHitBoxes.map(({left, top, width, height}) => ({left, top, width, height}));
      const labelOpts = chart.legend.options.labels;
      const lineHeight = Chart.helpers.toFont(labelOpts.font).lineHeight;
      return {hitBoxes, drawn, lineHeight, padding: labelOpts.padding};
    }

    function expectFinite(values) {
      values.forEach(function(value) {
        expect(Number.isFinite(value)).toBe(true);
      });
    }

    ['left', 'right'].forEach(function(position) {
      it('should lay out and draw numeric labels in a ' + position + ' legend', function() {
        let result;
        expect(function() {
          result = drawPie([2010, 2011], position);
        }).not.toThrow();

        expect(result.hitBoxes.length).toBe(2);
        result.hitBoxes.forEach(function(hitBox) {
          expectFinite([hitBox.left, hitBox.top, hitBox.width, hitBox.height]);
        });
        expect(result.drawn.map(({text}) => text)).toEqual(['2010', '2011']);
        result.drawn.forEach(function({x, y}) {
          expectFinite([x, y]);
        });

        // A number takes the same room as the same text given as a string.
        expect(result).toEqual(drawPie(['2010', '2011'], position));
      });

      it('should show a numeric label as one line next to a multi-line label in a ' + position + ' legend', function() {
        // The second line of the array is its widest.
        const result = drawPie([['A', 'WWWWWWWW'], 2010, 'C'], position);
        const asStrings = drawPie([['A', 'WWWWWWWW'], '2010', 'C'], position);
        const widestOnly = drawPie(['WWWWWWWW', 2010, 'C'], position);

        expect(result.drawn.map(({text}) => text)).toEqual(['A', 'WWWWWWWW', '2010', 'C']);
        expect(result).toEqual(asStrings);
        // The array is as wide as its widest line.
        expect(result.hitBoxes[0].width).toBe(widestOnly.hitBoxes[0].width);
        expect(result.hitBoxes[0].width).toBeGreaterThan(result.hitBoxes[2].width);
        // The array is two lines tall, the number one line, like the string.
        const {hitBoxes, drawn, lineHeight, padding} = result;
        expect(hitBoxes[0].height).toBeCloseTo(2 * lineHeight, 10);
        expect(hitBoxes[0].height).toBeGreaterThan(hitBoxes[1].height);
        expect(hitBoxes[1].height).toBe(hitBoxes[2].height);
        // The number is drawn below both lines of the array and the padding.
        const [lineA, lineB, number] = drawn;
        expect(lineB.y).toBeCloseTo(lineA.y + lineHeight, 10);
        expect(number.y).toBeCloseTo(lineA.y + 2 * lineHeight + padding, 10);
      });
    });
  });

  it('should draw items with a custom boxHeight', function() {
    var chart = window.acquireChart(
      {
        type: 'line',
        data: {
          datasets: [{
            label: 'dataset1',
            data: []
          }],
          labels: []
        },
        options: {
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxHeight: 40
              }
            }
          }
        }
      },
      {
        canvas: {
          width: 512,
          height: 105
        }
      }
    );
    const hitBox = chart.legend.legendHitBoxes[0];
    expect(hitBox.height).toBe(40);
  });

  // Draws the chart and returns the legend's symbols and texts in drawing order.
  function drawLegendItems(chart) {
    const {ctx, legend} = chart;
    const symbols = [];
    const texts = [];
    const rect = ctx.rect.bind(ctx);
    vi.spyOn(ctx, 'rect').mockImplementation(function(x, y, width, height) {
      if (width === legend.options.labels.boxWidth) {
        symbols.push({left: x, right: x + width, x: x + width / 2, y: y + height / 2});
      }
      rect(x, y, width, height);
    });
    const fillText = ctx.fillText.bind(ctx);
    vi.spyOn(ctx, 'fillText').mockImplementation(function(text, x, y, maxWidth) {
      if (legend.legendItems.some(item => item.text === text)) {
        const width = ctx.measureText(text).width;
        const left = x - (ctx.textAlign === 'center' ? width / 2 : ctx.textAlign === 'right' ? width : 0);
        texts.push({text, left, right: left + width, y});
      }
      fillText(text, x, y, maxWidth);
    });

    chart.draw();

    return {symbols, texts};
  }

  it('should give an item without a text alignment the one of the labels', function() {
    const chart = window.acquireChart({
      type: 'line',
      data: {labels: [], datasets: [{data: []}]},
      options: {plugins: {legend: {labels: {
        textAlign: 'right',
        generateLabels: () => [{text: 'own', textAlign: 'center'}, {text: 'none'}]
      }}}}
    });

    expect(chart.legend.legendItems.map(item => item.textAlign)).toEqual(['center', 'right']);
  });

  ['top', 'left'].forEach(function(position) {
    it('should center a point style at the right-to-left start of the items in a ' + position + ' legend', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {labels: [], datasets: [{label: 'first', data: []}, {label: 'second', data: []}]},
        options: {plugins: {legend: {position, rtl: true, labels: {usePointStyle: true, textAlign: 'left'}}}}
      });
      const centers = [];
      vi.spyOn(chart.ctx, 'arc').mockImplementation(function(x, y) {
        centers.push({x, y});
      });

      chart.draw();

      const {legendHitBoxes, _labelLayout: {boxWidth}} = chart.legend;
      expect(centers.length).toBe(2);
      centers.forEach(function(center, i) {
        // In right-to-left the symbol sits at the right end of the item.
        const hitbox = legendHitBoxes[i];
        expect(center.x).toBeCloseTo(hitbox.left + hitbox.width - boxWidth / 2, 5);
      });
    });

    it('should keep the symbol of the layout when usePointStyle changes without an update in a ' + position + ' legend', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {labels: [], datasets: [{label: 'first', data: []}]},
        options: {animation: false, plugins: {legend: {position}}}
      });
      const {symbols: laidOut} = drawLegendItems(chart);
      vi.restoreAllMocks();
      const arc = vi.spyOn(chart.ctx, 'arc');

      // The legend's resolved options, which the next update replaces.
      chart.legend.options.labels.usePointStyle = true;
      const {symbols} = drawLegendItems(chart);

      expect(arc).not.toHaveBeenCalled();
      expect(symbols).toEqual(laidOut);
    });

    it('should center a box lower than the font on the text in a ' + position + ' legend', function() {
      const chart = window.acquireChart({
        type: 'line',
        data: {labels: [], datasets: [{label: 'first', data: []}, {label: 'second', data: []}]},
        options: {plugins: {legend: {position, labels: {boxHeight: 4, font: {size: 20}}}}}
      });
      const {symbols, texts} = drawLegendItems(chart);

      expect(symbols.length).toBe(2);
      symbols.forEach(function(symbol, i) {
        expect(symbol.y).toBeCloseTo(texts[i].y, 5);
      });
    });
  });

  // The hit box runs from the leftmost to the rightmost edge of what is drawn.
  function expectHitBoxToCover(hitbox, symbol, text) {
    expect(hitbox.left).toBeCloseTo(Math.min(symbol.left, text.left), 0);
    expect(hitbox.left + hitbox.width).toBeCloseTo(Math.max(symbol.right, text.right), 0);
  }

  for (const position of ['left', 'right', 'top', 'bottom']) {
    for (const textAlign of ['left', 'center', 'right']) {
      for (const rtl of [false, true]) {
        it(`should hit test the full ${position} legend label with ${textAlign} alignment and rtl=${rtl}`, function() {
          const chart = window.acquireChart({
            type: 'line',
            data: {
              datasets: ['Short', 'A much longer dataset label'].map(label => ({label, data: []}))
            },
            options: {
              plugins: {legend: {position, rtl, labels: {textAlign}}}
            }
          }, {canvas: {width: 600, height: 300}});
          const {legend} = chart;
          const {symbols, texts} = drawLegendItems(chart);

          expect(symbols.length).toBe(2);
          expect(texts.length).toBe(2);
          const {left, right, y} = texts[0];
          expect(legend._getLegendItemAt(symbols[0].x, symbols[0].y)).toBe(legend.legendItems[0]);
          expect(legend._getLegendItemAt(left + 1, y)).toBe(legend.legendItems[0]);
          expect(legend._getLegendItemAt(right - 1, y)).toBe(legend.legendItems[0]);
          for (let i = 0; i < 2; i++) {
            expectHitBoxToCover(legend.legendHitBoxes[i], symbols[i], texts[i]);
          }
        });
      }
    }
  }

  it('should use a legend item text alignment before the global label alignment for hit testing', function() {
    const chart = window.acquireChart({
      type: 'line',
      data: {datasets: []},
      options: {
        plugins: {
          legend: {
            position: 'right',
            labels: {
              textAlign: 'left',
              generateLabels: () => [
                {text: 'A much longer dataset label'},
                {text: 'Short', textAlign: 'right'}
              ]
            }
          }
        }
      }
    });
    const {legend} = chart;
    const hitbox = legend.legendHitBoxes[1];
    expect(legend._getLegendItemAt(legend.right - 1, hitbox.top + hitbox.height / 2)).toBe(legend.legendItems[1]);
  });

  for (const [count, columns] of [[12, 2], [20, 3]]) {
    for (const textAlign of ['right', 'center']) {
      it(`should keep ${textAlign} aligned items of a ${columns}-column legend in their own column`, function() {
        const chart = window.acquireChart({
          type: 'line',
          data: {
            datasets: Array.from({length: count}, (_, i) => ({label: 'Item ' + i, data: []}))
          },
          options: {
            plugins: {legend: {position: 'right', labels: {textAlign}}}
          }
        }, {canvas: {width: 1600, height: 200}});
        const {legend} = chart;
        const {columnSizes} = legend;
        const {boxWidth} = legend.options.labels;
        const halfFontSize = Chart.helpers.toFont(legend.options.labels.font).size / 2;
        const {symbols, texts} = drawLegendItems(chart);
        const hitboxes = legend.legendHitBoxes;

        // Items 0-7 fill the first column, item 8 starts the second one.
        expect(columnSizes.length).toBe(columns);
        expect(hitboxes[7].col).toBe(0);
        expect(hitboxes[8].col).toBe(1);
        expect(symbols.length).toBe(count);
        expect(texts.length).toBe(count);

        for (let i = 0; i < count; i++) {
          const col = hitboxes[i].col;
          const columnLeft = symbols[col * 8].left;
          // The text area ends at the next column's left edge minus the padding.
          const textEnd = col < columns - 1 ? columnLeft + columnSizes[col].width : legend.right;
          const textStart = symbols[i].left + boxWidth + halfFontSize;
          if (textAlign === 'right') {
            expect(texts[i].right).toBeCloseTo(textEnd, 0);
          } else {
            expect((texts[i].left + texts[i].right) / 2).toBeCloseTo((textStart + textEnd) / 2, 0);
          }
          expectHitBoxToCover(hitboxes[i], symbols[i], texts[i]);
        }
        expect(legend._getLegendItemAt(symbols[8].x, symbols[8].y)).toBe(legend.legendItems[8]);
        expect(legend._getLegendItemAt(texts[8].right - 1, symbols[8].y)).toBe(legend.legendItems[8]);
      });
    }
  }

  it('should cover right aligned text that is wider than a narrow vertical legend', function() {
    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{label: 'A much longer dataset label', data: []}]
      },
      options: {
        plugins: {legend: {position: 'right', maxWidth: 80, labels: {textAlign: 'right'}}}
      }
    }, {canvas: {width: 600, height: 300}});
    const {legend} = chart;
    const {symbols, texts} = drawLegendItems(chart);

    // The text ends at the legend's right edge and starts left of the symbol.
    expect(legend.width).toBe(80);
    expect(texts[0].right).toBeCloseTo(legend.right, 0);
    expect(texts[0].left).toBeLessThan(symbols[0].left);
    expectHitBoxToCover(legend.legendHitBoxes[0], symbols[0], texts[0]);
  });

  it('should update the hit boxes of a right legend whose generateLabels returns fewer items after the layout', function() {
    // fit() runs during the layout and sees 3 items. afterUpdate builds the
    // labels again and gets 1, so two hit boxes have no item.
    let laidOut = false;
    const generateLabels = function() {
      const count = laidOut ? 1 : 3;
      return Array.from({length: count}, (_, i) => ({text: 'item' + i, fillStyle: 'red'}));
    };

    let chart;
    expect(function() {
      chart = window.acquireChart({
        type: 'line',
        data: {datasets: [{data: []}]},
        plugins: [{
          id: 'shrinkLabels',
          beforeLayout() {
            laidOut = false;
          },
          afterLayout() {
            laidOut = true;
          }
        }],
        options: {
          animation: false,
          plugins: {legend: {position: 'right', labels: {generateLabels}}}
        }
      });
    }).not.toThrow();
    expect(chart.legend.legendHitBoxes.length).toBe(3);
    expect(chart.legend.legendItems.length).toBe(1);
  });

  it('should pick up the first item when the property is an array', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: ['#f31', '#666', '#14e'],
          borderWidth: [5, 10, 15],
          borderColor: ['red', 'green', 'blue'],
          data: []
        }],
        labels: []
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'red',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should use the borderRadius in the legend', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: ['#f31', '#666', '#14e'],
          borderWidth: [5, 10, 15],
          borderColor: ['red', 'green', 'blue'],
          borderRadius: 10,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              useBorderRadius: true,
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: 10,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'red',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should use the value for the first item when the property is a function', function() {
    var helpers = window.Chart.helpers;
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return helpers.color({r: value * 10, g: 0, b: 0}).rgbString();
          },
          borderWidth: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value;
          },
          borderColor: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return helpers.color({r: 255 - value * 10, g: 0, b: 0}).rgbString();
          },
          data: [5, 10, 15, 20]
        }],
        labels: ['A', 'B', 'C', 'D']
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: 'rgb(50, 0, 0)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'rgb(205, 0, 0)',
      pointStyle: undefined,
      rotation: undefined,
      textAlign: undefined,
      datasetIndex: 0
    }]);
  });

  it('should draw correctly when usePointStyle is true', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          borderWidth: 0,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointBackgroundColor: 'rgba(0,0,0,0.1)',
          pointBorderWidth: 5,
          pointBorderColor: 'green',
          data: []
        }, {
          label: 'dataset2',
          backgroundColor: '#f31',
          borderJoinStyle: 'miter',
          borderWidth: 2,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointRotation: 15,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'green',
      pointStyle: 'crossRot',
      rotation: 0,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 2,
      strokeStyle: '#f31',
      pointStyle: 'crossRot',
      rotation: 15,
      textAlign: undefined,
      datasetIndex: 1
    }]);
  });

  it('should draw correctly when usePointStyle is true and pointStyle override is set', function() {
    var chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          label: 'dataset1',
          backgroundColor: '#f31',
          borderCapStyle: 'butt',
          borderDash: [2, 2],
          borderDashOffset: 5.5,
          borderWidth: 0,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointBackgroundColor: 'rgba(0,0,0,0.1)',
          pointBorderWidth: 5,
          pointBorderColor: 'green',
          data: []
        }, {
          label: 'dataset2',
          backgroundColor: '#f31',
          borderJoinStyle: 'miter',
          borderWidth: 2,
          borderColor: '#f31',
          pointStyle: 'crossRot',
          pointRotation: 15,
          data: []
        }],
        labels: []
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'star'
            }
          }
        }
      }
    });

    expect(chart.legend.legendItems).toEqual([{
      text: 'dataset1',
      borderRadius: undefined,
      fillStyle: 'rgba(0,0,0,0.1)',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 5,
      strokeStyle: 'green',
      pointStyle: 'star',
      rotation: 0,
      textAlign: undefined,
      datasetIndex: 0
    }, {
      text: 'dataset2',
      borderRadius: undefined,
      fillStyle: '#f31',
      fontColor: '#666',
      hidden: false,
      lineCap: undefined,
      lineDash: undefined,
      lineDashOffset: undefined,
      lineJoin: undefined,
      lineWidth: 2,
      strokeStyle: '#f31',
      pointStyle: 'star',
      rotation: 15,
      textAlign: undefined,
      datasetIndex: 1
    }]);
  });

  it('should not crash when the legend defaults are false', function() {
    const oldDefaults = Chart.defaults.plugins.legend;

    Chart.defaults.set({
      plugins: {
        legend: false,
      },
    });

    var chart = window.acquireChart({
      type: 'doughnut',
      data: {
        datasets: [{
          label: 'dataset1',
          data: [1, 2, 3, 4]
        }],
        labels: ['', '', '', '']
      },
    });
    expect(chart).toBeDefined();

    Chart.defaults.set({
      plugins: {
        legend: oldDefaults,
      },
    });
  });

  it('should not read onClick from chart options', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'dataset',
          backgroundColor: 'red',
          borderColor: 'red',
          data: [120, 23, 24, 45, 51]
        }]
      },
      options: {
        responsive: true,
        onClick() { },
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
    expect(chart.legend.options.onClick).toBe(Chart.defaults.plugins.legend.onClick);
  });

  it('should read labels.color from chart options', function() {
    var chart = window.acquireChart({
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'dataset',
          backgroundColor: 'red',
          borderColor: 'red',
          data: [120, 23, 24, 45, 51]
        }]
      },
      options: {
        responsive: true,
        color: 'green',
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
    expect(chart.legend.options.labels.color).toBe('green');
    expect(chart.legend.options.title.color).toBe('green');
  });

  it('should not crash when defaults font changes before a render', function() {
    const defaultFont = Object.assign({}, Chart.defaults.font);
    const labels = Array.from({length: 8}, (_, i) => `L${i}`);
    const datasets = labels.map((_, i) => ({
      label: `dataset${i}`,
      data: [i + 1]
    }));

    const chart = acquireChart({
      type: 'bar',
      data: {
        labels: ['A'],
        datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    }, {
      canvas: {
        width: 256,
        height: 180
      }
    });

    try {
      Object.assign(Chart.defaults.font, {
        size: 42
      });

      expect(function() {
        chart.render();
      }).not.toThrow();
    } finally {
      Object.assign(Chart.defaults.font, defaultFont);
    }
  });

  ['top', 'bottom'].forEach(function(position) {
    it('should start the row after a three-line label below its third line in a ' + position + ' legend', function() {
      const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');
      const chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['A'],
          datasets: [
            {label: ['line 1', 'line 2', 'line 3'], data: [1]},
            {label: 'next row', data: [2]}
          ]
        },
        options: {animation: false, plugins: {legend: {position}}}
      }, {canvas: {width: 120, height: 300}});
      // The y each text was drawn at.
      const drawn = {};
      fillText.mock.calls.forEach(function(args) {
        drawn[args[0]] = args[2];
      });
      fillText.mockRestore();
      const {legend} = chart;
      const [multi, next] = legend.legendHitBoxes;
      const {lineHeight} = legend._labelLayout.font;

      expect(next.row).toBe(1);
      // The text of the next row is below the third line, and so is its hit box.
      expect(drawn['next row'] - lineHeight / 2).toBeGreaterThanOrEqual(drawn['line 3'] + lineHeight / 2);
      expect(multi.height).toBeCloseTo(3 * lineHeight, 5);
      expect(next.top).toBeGreaterThanOrEqual(multi.top + multi.height);
      // The legend is tall enough for both rows.
      expect(legend.bottom).toBeGreaterThanOrEqual(next.top + next.height);
    });
  });

  ['top', 'left'].forEach(function(position) {
    it('should make a multi-line item as tall as a box taller than its lines in a ' + position + ' legend', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['A'],
          datasets: [
            {label: ['a', 'b'], data: [1]},
            {label: 'next', data: [2]}
          ]
        },
        options: {animation: false, plugins: {legend: {position, labels: {boxHeight: 40}}}}
      }, {canvas: {width: 120, height: 300}});
      const [multi, next] = chart.legend.legendHitBoxes;

      expect(multi.height).toBe(40);
      // The next item, in the next row or below in the column, starts below the box.
      expect(next.top).toBeGreaterThanOrEqual(multi.top + 40);
    });
  });

  it('should make each row of a top legend as tall as its own tallest item', function() {
    const long = 'a label long enough to take a row of its own';
    const chart = window.acquireChart({
      type: 'bar',
      data: {
        labels: ['A'],
        datasets: [
          {label: ['three', 'line', 'label'], data: [1]},
          {label: 'short', data: [1]},
          {label: long, data: [1]},
          {label: long + '!', data: [1]}
        ]
      },
      options: {animation: false, plugins: {legend: {position: 'top'}}}
    }, {canvas: {width: 320, height: 400}});
    const {legendHitBoxes: boxes, _labelLayout: {font, itemHeight}, options: {labels: {padding}}} = chart.legend;

    expect(boxes.map(box => box.row)).toEqual([0, 0, 1, 2]);
    // The short item keeps its height; the row takes the three lines.
    expect(boxes[1].height).toBe(itemHeight);
    expect(boxes[1].top).toBe(boxes[0].top);
    expect(boxes[2].top - boxes[0].top).toBeCloseTo(3 * font.lineHeight + padding, 5);
    // The row after it is a one-line row again.
    expect(boxes[3].top - boxes[2].top).toBeCloseTo(itemHeight + padding, 5);
  });

  it('should keep the height of an empty top legend', function() {
    const chart = window.acquireChart({
      type: 'bar',
      data: {labels: ['A'], datasets: [{data: [1]}]},
      options: {plugins: {legend: {
        labels: {generateLabels: () => []},
        title: {display: true, text: 'Title'}
      }}}
    });
    const {legend} = chart;

    expect(legend.legendHitBoxes.length).toBe(0);
    // Only the title and the legend's fixed 10 pixels.
    expect(legend.height).toBe(legend._computeTitleHeight() + 10);
  });

  it('should make an array label in a top legend as wide as its widest line', function() {
    const chart = window.acquireChart({
      type: 'bar',
      data: {labels: ['A'], datasets: [{label: ['WWWW', 'i'], data: [1]}]},
      options: {plugins: {legend: {position: 'top'}}}
    });
    const {legend} = chart;
    const {font, boxWidth} = legend._labelLayout;
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = font.string;
    const widest = ctx.measureText('WWWW').width;
    // The array as one string, which is what was measured before.
    expect(widest).toBeLessThan(ctx.measureText('WWWW,i').width);
    ctx.restore();

    const width = boxWidth + font.size / 2 + widest;
    expect(legend.legendHitBoxes[0].width).toBeCloseTo(width, 5);
    expect(legend.lineWidths).toEqual([width + legend.options.labels.padding]);
  });

  it('should draw the labels in the font they were laid out with', function() {
    const defaultSize = Chart.defaults.font.size;
    const chart = acquireChart({
      type: 'bar',
      data: {labels: ['A'], datasets: [{label: 'first', data: [1]}]},
      options: {animation: false}
    });
    // The canvas normalizes the font string it is given.
    chart.ctx.font = Chart.helpers.toFont(chart.legend.options.labels.font).string;
    const laidOut = chart.ctx.font;
    const fonts = [];
    vi.spyOn(chart.ctx, 'fillText').mockImplementation(function(text) {
      if (text === 'first') {
        fonts.push(chart.ctx.font);
      }
    });

    try {
      // A render without an update keeps the layout, so the size must not change either.
      Chart.defaults.font.size = 42;
      chart.render();
    } finally {
      Chart.defaults.font.size = defaultSize;
    }

    expect(fonts).toEqual([laidOut]);
  });

  ['top', 'right'].forEach(function(position) {
    it('should draw a ' + position + ' legend whose generateLabels returns more items after the layout', function() {
      // fit() runs during the layout and sees 2 items. afterUpdate builds the
      // labels again and gets 30, so most of the drawn items have no hit box.
      let laidOut = false;
      const generateLabels = function() {
        const count = laidOut ? 30 : 2;
        return Array.from({length: count}, (_, i) => ({text: 'item' + i, fillStyle: 'red'}));
      };
      const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');

      let chart;
      expect(function() {
        chart = acquireChart({
          type: 'bar',
          data: {
            labels: ['A'],
            datasets: [{data: [1]}]
          },
          plugins: [{
            id: 'growLabels',
            beforeLayout() {
              laidOut = false;
            },
            afterLayout() {
              laidOut = true;
            }
          }],
          options: {
            responsive: false,
            animation: false,
            plugins: {
              legend: {
                position: position,
                labels: {generateLabels: generateLabels}
              }
            }
          }
        }, {
          canvas: {
            width: 256,
            height: 180
          }
        });
      }).not.toThrow();
      expect(chart.legend.legendHitBoxes.length).toBe(2);
      expect(chart.legend.legendItems.length).toBe(30);

      // Only the items that have a hit box are drawn.
      const drawn = fillText.mock.calls.map(args => args[0]).filter(text => text.startsWith('item'));
      expect(drawn).toEqual(['item0', 'item1']);
    });
  });

  ['top', 'left'].forEach(function(position) {
    it('should not measure text when drawing a ' + position + ' legend', function() {
      // fit() measures every item, so draw() only reads the hit boxes. A hidden
      // item is struck through, and that decoration still measures its line.
      const chart = acquireChart({
        type: 'bar',
        data: {
          labels: ['A'],
          datasets: [
            {label: 'first', data: [1]},
            {label: ['second', 'on two lines'], data: [2]},
            {label: 'third', data: [3]}
          ]
        },
        options: {
          animation: false,
          plugins: {
            legend: {
              position,
              title: {display: true, text: 'Title'}
            }
          }
        }
      });
      const measureText = vi.spyOn(chart.ctx, 'measureText');

      chart.draw();

      expect(measureText).not.toHaveBeenCalled();
    });
  });

  describe('wrapping within maxWidth and maxHeight', function() {
    function legendWith(position, legendOptions, count, text) {
      return window.acquireChart({
        type: 'bar',
        data: {labels: ['A'], datasets: Array.from({length: count}, (_, i) => ({label: text(i), data: [i]}))},
        options: {animation: false, plugins: {legend: {position, ...legendOptions}}}
      }, {canvas: {width: 600, height: 400}}).legend;
    }

    it('should wrap a right legend into columns within maxHeight', function() {
      const legend = legendWith('right', {maxHeight: 100}, 12, i => 'Dataset ' + i);
      const boxes = legend.legendHitBoxes;
      const first = boxes[0].top;

      expect(new Set(boxes.map(box => box.col)).size).toBeGreaterThanOrEqual(2);
      boxes.forEach(function(box) {
        expect(box.top + box.height - first).toBeLessThanOrEqual(100);
      });
      // The legend's box keeps the full height.
      expect(legend.height).toBe(legend.chart.height);
    });

    it('should wrap a top legend into rows within maxWidth', function() {
      const legend = legendWith('top', {maxWidth: 150}, 6, i => 'Dataset ' + i);
      const boxes = legend.legendHitBoxes;
      const rows = [...new Set(boxes.map(box => box.row))];

      expect(rows.length).toBeGreaterThanOrEqual(2);
      rows.forEach(function(row) {
        const inRow = boxes.filter(box => box.row === row);
        const left = Math.min(...inRow.map(box => box.left));
        const right = Math.max(...inRow.map(box => box.left + box.width));
        expect(right - left).toBeLessThanOrEqual(150);
      });
      // The legend's box keeps the full width.
      expect(legend.width).toBe(legend.chart.width);
    });

    // Items without text are exactly boxWidth + fontSize / 2 = 46 wide and
    // fontSize = 12 tall, so the sums below have no rounding.
    const emptyText = () => '';

    it('should not wrap a row whose width with its padding equals maxWidth', function() {
      // Two items and three paddings: 46 + 46 + 3 * 10.
      const legend = legendWith('top', {maxWidth: 122}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.row)).toEqual([0, 0, 1]);
    });

    it('should wrap a row one pixel wider than maxWidth', function() {
      const legend = legendWith('top', {maxWidth: 121}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.row)).toEqual([0, 1, 2]);
    });

    it('should not wrap a column whose height with its padding equals maxHeight', function() {
      // Two items and three paddings: 12 + 12 + 3 * 10.
      const legend = legendWith('right', {maxHeight: 54}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.col)).toEqual([0, 0, 1]);
    });

    it('should wrap a column one pixel taller than maxHeight', function() {
      const legend = legendWith('right', {maxHeight: 53}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.col)).toEqual([0, 1, 2]);
    });

    it('should count the title in maxHeight', function() {
      // Taller than an item and its padding, so that the third item would fit beside it.
      const title = {display: true, text: 'Title', padding: 20};
      const titleHeight = legendWith('right', {title}, 3, emptyText)._computeTitleHeight();
      const legend = legendWith('right', {maxHeight: 54 + titleHeight, title}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.col)).toEqual([0, 0, 1]);
    });

    it('should fit a top legend to maxWidth before the layout places it', function() {
      // The layout then gives the legend the full width of its box.
      const legend = legendWith('top', {maxWidth: 150}, 6, i => 'Dataset ' + i);
      legend.fit();

      expect(legend.width).toBe(150);
    });

    it('should put one item in each row when maxWidth is smaller than an item', function() {
      const legend = legendWith('top', {maxWidth: 30}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.row)).toEqual([0, 1, 2]);
    });

    it('should put every item in its own column when maxHeight is the title height', function() {
      const title = {display: true, text: 'Title'};
      const titleHeight = legendWith('right', {title}, 3, emptyText)._computeTitleHeight();
      const legend = legendWith('right', {maxHeight: titleHeight, title}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.col)).toEqual([0, 1, 2]);
    });

    it('should not limit the wrapping when maxWidth is 0', function() {
      const legend = legendWith('top', {maxWidth: 0}, 3, emptyText);

      expect(legend.legendHitBoxes.map(box => box.row)).toEqual([0, 0, 0]);
    });
  });

  describe('config update', function() {
    it('should update the options', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
      expect(chart.legend.options.display).toBe(true);

      chart.options.plugins.legend.display = false;
      chart.update();
      expect(chart.legend.options.display).toBe(false);
    });

    it('should update the associated layout item', function() {
      var chart = acquireChart({
        type: 'line',
        data: {},
        options: {
          plugins: {
            legend: {
              fullSize: true,
              position: 'top',
              weight: 150
            }
          }
        }
      });

      expect(chart.legend.fullSize).toBe(true);
      expect(chart.legend.position).toBe('top');
      expect(chart.legend.weight).toBe(150);

      chart.options.plugins.legend.fullSize = false;
      chart.options.plugins.legend.position = 'left';
      chart.options.plugins.legend.weight = 42;
      chart.update();

      expect(chart.legend.fullSize).toBe(false);
      expect(chart.legend.position).toBe('left');
      expect(chart.legend.weight).toBe(42);
    });

    it('should remove the legend if the new options are false', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        }
      });
      expect(chart.legend).not.toBe(undefined);

      chart.options.plugins.legend = false;
      chart.update();
      expect(chart.legend).toBe(undefined);
    });

    it('should create the legend if the legend options are changed to exist', function() {
      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          plugins: {
            legend: false
          }
        }
      });
      expect(chart.legend).toBe(undefined);

      chart.options.plugins.legend = {};
      chart.update();
      expect(chart.legend).not.toBe(undefined);
      expect(chart.legend.options).toEqualOptions(Object.assign({},
        // replace scriptable options with resolved values
        Chart.defaults.plugins.legend,
        {
          labels: {color: Chart.defaults.color},
          title: {color: Chart.defaults.color}
        }
      ));
    });
  });

  describe('callbacks', function() {
    it('should call onClick, onHover and onLeave at the correct times', async function() {
      var clickItem = null;
      var hoverItem = null;
      var leaveItem = null;

      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          plugins: {
            legend: {
              onClick: function(_, item) {
                clickItem = item;
              },
              onHover: function(_, item) {
                hoverItem = item;
              },
              onLeave: function(_, item) {
                leaveItem = item;
              }
            }
          }
        }
      });

      var hb = chart.legend.legendHitBoxes[0];
      var el = {
        x: hb.left + (hb.width / 2),
        y: hb.top + (hb.height / 2)
      };

      await triggerMouseEvent(chart, 'click', el);
      expect(clickItem).toBe(chart.legend.legendItems[0]);

      await triggerMouseEvent(chart, 'mousemove', el);
      expect(hoverItem).toBe(chart.legend.legendItems[0]);

      await triggerMouseEvent(chart, 'mousemove', chart.getDatasetMeta(0).data[0]);
      expect(leaveItem).toBe(chart.legend.legendItems[0]);
    });

    describe('one press', function() {
      // Presses and releases the mouse on the first legend item. Only the
      // events the chart listens to are sent, since only those are handled.
      async function pressFirstItem(chart) {
        const hb = chart.legend.legendHitBoxes[0];
        const point = {x: hb.left + hb.width / 2, y: hb.top + hb.height / 2};
        for (const type of ['mousedown', 'mouseup', 'click']) {
          if (chart.options.events.includes(type)) {
            await triggerMouseEvent(chart, type, point);
          }
        }
      }

      function countLegendClicks(events, legendEvents) {
        const onClick = vi.fn();
        const chart = acquireChart({
          type: 'line',
          data: {
            labels: ['A', 'B'],
            datasets: [{data: [1, 2]}]
          },
          options: {
            events,
            plugins: {
              legend: {events: legendEvents, onClick}
            }
          }
        });
        return {chart, onClick};
      }

      it('should call onClick once when the chart listens to both click and mouseup', async function() {
        const {chart, onClick} = countLegendClicks(['click', 'mouseup', 'mousedown', 'mousemove']);
        await pressFirstItem(chart);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].type).toBe('click');
      });

      it('should call onClick once on mouseup when the chart does not listen to click', async function() {
        const {chart, onClick} = countLegendClicks(['mouseup', 'mousemove']);
        await pressFirstItem(chart);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].type).toBe('mouseup');
      });

      it('should not call onClick on a right-click', async function() {
        const {chart, onClick} = countLegendClicks(['contextmenu', 'mouseup', 'mousemove']);
        const hb = chart.legend.legendHitBoxes[0];
        await triggerMouseEvent(chart, 'contextmenu', {x: hb.left + hb.width / 2, y: hb.top + hb.height / 2});
        expect(onClick).not.toHaveBeenCalled();
      });

      it('should call onClick on mouseup when only the legend events leave out click', async function() {
        const {chart, onClick} = countLegendClicks(['click', 'mouseup', 'mousemove'], ['mouseup']);
        await pressFirstItem(chart);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].type).toBe('mouseup');
      });
    });

    it('should call onLeave when the mouse leaves the canvas', async function() {
      var hoverItem = null;
      var leaveItem = null;
      var leaveCount = 0;

      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100]
          }]
        },
        options: {
          plugins: {
            legend: {
              onHover: function(_, item) {
                hoverItem = item;
              },
              onLeave: function(_, item) {
                leaveItem = item;
                leaveCount++;
              }
            }
          }
        }
      });

      var hb = chart.legend.legendHitBoxes[0];
      var el = {
        x: hb.left + (hb.width / 2),
        y: hb.top + (hb.height / 2)
      };

      await triggerMouseEvent(chart, 'mousemove', el);
      expect(hoverItem).toBe(chart.legend.legendItems[0]);

      await triggerMouseEvent(chart, 'mouseout');
      expect(leaveItem).toBe(chart.legend.legendItems[0]);
      expect(chart.legend._hoveredItem).toBeNull();

      await triggerMouseEvent(chart, 'mousemove', el);
      expect(chart.legend._hoveredItem).toBe(chart.legend.legendItems[0]);
      leaveItem = null;
      leaveCount = 0;

      await triggerMouseEvent(chart, 'mouseout', el);
      expect(leaveItem).toBe(chart.legend.legendItems[0]);
      expect(leaveCount).toBe(1);
      expect(chart.legend._hoveredItem).toBeNull();

      await triggerMouseEvent(chart, 'mouseout', el);
      expect(leaveCount).toBe(1);
    });


    it('should call onClick for the correct item when in RTL mode', async function() {
      var clickItem = null;

      var chart = acquireChart({
        type: 'line',
        data: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{
            data: [10, 20, 30, 100],
            label: 'dataset 1'
          }, {
            data: [10, 20, 30, 100],
            label: 'dataset 2'
          }]
        },
        options: {
          plugins: {
            legend: {
              onClick: function(_, item) {
                clickItem = item;
              },
            }
          }
        }
      });

      var hb = chart.legend.legendHitBoxes[0];
      var el = {
        x: hb.left + (hb.width / 2),
        y: hb.top + (hb.height / 2)
      };

      await triggerMouseEvent(chart, 'click', el);
      expect(clickItem).toBe(chart.legend.legendItems[0]);
    });

    it('should draw the last item when horizontal legend has align end and label widths cause floating point rounding', function() {
      var origMeasureText = CanvasRenderingContext2D.prototype.measureText;
      var origFillText = CanvasRenderingContext2D.prototype.fillText;
      var drawn = [];
      var widths = {Alpha: 40.2, Beta: 30.2};

      CanvasRenderingContext2D.prototype.measureText = function(text) {
        return text in widths ? {width: widths[text]} : origMeasureText.call(this, text);
      };
      CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
        if (text in widths) {
          drawn.push({text: text, x: x, y: y});
        }
        return origFillText.apply(this, arguments);
      };

      try {
        var chart = acquireChart({
          type: 'bar',
          data: {
            labels: ['a', 'b'],
            datasets: [
              {label: 'Alpha', data: [1, 2]},
              {label: 'Beta', data: [2, 1]},
            ]
          },
          options: {
            responsive: false,
            animation: false,
            plugins: {
              legend: {
                align: 'end',
                labels: {
                  boxWidth: 12,
                  padding: 10,
                  font: {size: 12}
                }
              }
            }
          }
        }, {
          canvas: {
            width: 600,
            height: 200
          }
        });

        expect(drawn.length).toBe(2);
        expect(drawn[0].text).toBe('Alpha');
        expect(isNaN(drawn[0].x)).toBe(false);
        expect(drawn[1].text).toBe('Beta');
        expect(isNaN(drawn[1].x)).toBe(false);
        // Beta stays on Alpha's row and inside the legend.
        expect(drawn[1].y).toBe(drawn[0].y);
        expect(drawn[1].x).toBeGreaterThan(drawn[0].x);
        expect(drawn[1].x).toBeLessThanOrEqual(chart.legend.right);
      } finally {
        CanvasRenderingContext2D.prototype.measureText = origMeasureText;
        CanvasRenderingContext2D.prototype.fillText = origFillText;
      }
    });
  });
});
