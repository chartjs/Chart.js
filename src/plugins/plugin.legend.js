import defaults from '../core/core.defaults.js';
import Element from '../core/core.element.js';
import layouts from '../core/core.layouts.js';
import {addRoundedRectPath, drawPointLegend, renderText} from '../helpers/helpers.canvas.js';
import {
  _isBetween,
  callback as call,
  clipArea,
  getRtlAdapter,
  overrideTextDirection,
  restoreTextDirection,
  toFont,
  toPadding,
  unclipArea,
  valueOrDefault,
} from '../helpers/index.js';
import {_alignStartEnd, _textX, _toLeftRightCenter} from '../helpers/helpers.extras.js';
import {toTRBLCorners} from '../helpers/helpers.options.js';
import {Color} from '@kurkle/color';

/**
 * @typedef { import('../types/index.js').ChartEvent } ChartEvent
 */

const getBoxSize = (labelOpts, fontSize) => {
  let {boxHeight = fontSize, boxWidth = fontSize} = labelOpts;

  if (labelOpts.usePointStyle) {
    boxHeight = Math.min(boxHeight, fontSize);
    boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
  }

  return {
    boxWidth,
    boxHeight,
    itemHeight: Math.max(fontSize, boxHeight)
  };
};

const itemsEqual = (a, b) => a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index;

export class Legend extends Element {

  /**
	 * @param {{ ctx: any; options: any; chart: any; }} config
	 */
  constructor(config) {
    super();

    this._added = false;

    // Contains hit boxes for each dataset (in dataset order)
    this.legendHitBoxes = [];

    /**
 		 * @private
 		 */
    this._hoveredItem = null;

    this.navigation = {
      active: false,
      page: 0,
      totalPages: 0,
      itemWidth: 0,
      itemHeight: 0,
      navWidth: 0,
      navHeight: 0,
      maxBlocks: 0,
      blocks: undefined,
      text: undefined,
      prev: undefined,
      next: undefined,
      legendItems: undefined,
      _width: 0,
      _height: 0,
      _maxWidth: 0,
      _maxHeight: 0,
    };

    // Are we in doughnut mode which has a different data type
    this.doughnutMode = false;

    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this.legendItems = undefined;
    this.columnSizes = undefined;
    this.lineWidths = undefined;
    this.maxHeight = undefined;
    this.maxWidth = undefined;
    this.top = undefined;
    this.bottom = undefined;
    this.left = undefined;
    this.right = undefined;
    this.height = undefined;
    this.width = undefined;
    this._margins = undefined;
    this.position = undefined;
    this.weight = undefined;
    this.fullSize = undefined;
  }

  update(maxWidth, maxHeight, margins) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins;

    this.setDimensions();
    this.buildLabels();
    this.buildNavigation();
    this.fit();
  }

  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = this._margins.left;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = this._margins.top;
      this.bottom = this.height;
    }
  }

  buildLabels() {
    const labelOpts = this.options.labels || {};
    let legendItems = call(labelOpts.generateLabels, [this.chart], this) || [];

    if (labelOpts.filter) {
      legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
    }

    if (labelOpts.sort) {
      legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, this.chart.data));
    }

    if (this.options.reverse) {
      legendItems.reverse();
    }

    this.navigation.legendItems = this.legendItems = legendItems;
    this._computeNavigation();
  }

  /**
   * @private
   */
  _resetNavigation() {
    if (this.navigation.active) {
      Object.assign(this.navigation, {
        active: false,
        page: 0,
        totalPages: 0,
        itemWidth: 0,
        itemHeight: 0,
        navWidth: 0,
        navHeight: 0,
        maxBlocks: 0,
        blocks: undefined,
        text: undefined,
        prev: undefined,
        next: undefined,
        legendItems: this.legendItems,
        _width: 0,
        _height: 0,
        _maxWidth: 0,
        _maxHeight: 0,
      });
    }
  }

  /**
   * @private
   */
  _computeNavigation() {
    const {ctx, options} = this;
    const {navigation: navOpts, labels: labelOpts} = options;

    if (!(navOpts && navOpts.display)) {
      this._resetNavigation();
      return;
    }
    const isHorizontal = this.isHorizontal();

    this.navigation.active = true;
    this.navigation.totalPages = 0;
    this.navigation._width = this.navigation._height = 0;
    this.navigation._maxWidth = this.navigation._maxHeight = 0;
    this.navigation.itemWidth = this.navigation.itemHeight = 0;
    this.navigation.maxBlocks = 0;

    const {arrowSize} = navOpts;
    const labelFont = toFont(labelOpts.font);
    const {boxWidth, itemHeight: _itemHeight} = getBoxSize(labelOpts, labelFont.size);
    const font = toFont(navOpts.font);

    const padding = toPadding(navOpts.padding);
    this.navigation.navHeight = Math.max(font.size, arrowSize) + padding.height;

    const grid = getGridAxis(navOpts.grid);

    // Find the largest width to keep all items the same width
    if (grid.x) {
      this.navigation.itemWidth = this.legendItems.reduce((max, legendItem) => {
        const width = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
        return Math.max(max, width);
      }, 0);
    }

    // Find the greatest height to keep all items the same height
    if (grid.y) {
      this.navigation.itemHeight = this.legendItems.reduce((max, legendItem) => {
        const height = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
        return Math.max(max, height);
      }, 0);
    }

    const titleHeight = this._computeTitleHeight();

    if (isHorizontal) {
      this._computeHorizontalNavigation(titleHeight, _itemHeight, boxWidth, labelFont);
    } else {
      this._computeVerticalNavigation(titleHeight, _itemHeight, boxWidth, labelFont);
    }

    this.navigation.blocks.forEach((block) => {
      this.navigation._maxWidth = Math.max(this.navigation._maxWidth, block.width);
      this.navigation._maxHeight = Math.max(this.navigation._maxHeight, block.height);
    });
  }

  /**
   * @private
   */
  _computeHorizontalNavigation(titleHeight, _itemHeight, boxWidth, labelFont) {
    const {labels: labelOpts, navigation: navOpts, maxHeight = this.maxHeight} = this.options;
    const {navHeight} = this.navigation;

    const widthLimit = this.maxWidth - labelOpts.padding;
    const rows = this.navigation.blocks = [{start: 0, end: 0, height: 0, width: 0, bottom: 0}];
    let maxItemHeight = 0;

    this.legendItems.forEach((legendItem, i) => {
      const {itemWidth, itemHeight} = this._getLegendItemSize(legendItem, boxWidth, _itemHeight, labelFont);
      let row = rows[rows.length - 1];

      if (row.width + itemWidth + labelOpts.padding > widthLimit) {
        rows.push(row = {start: i, end: i, height: 0, width: 0, bottom: 0});
      }

      row.end = i + 1;
      row.width += itemWidth + labelOpts.padding;
      row.height = Math.max(row.height, itemHeight + labelOpts.padding);
      row.bottom = (rows.length > 1 ? rows[rows.length - 2].bottom : 0) + row.height;
      maxItemHeight = Math.max(maxItemHeight, row.height);
    });

    const totalRows = rows.length;
    const maxRows = this.navigation.maxBlocks = Math.min(
      totalRows,
      navOpts.maxRows || Infinity,
      maxHeight ? Math.floor((maxHeight - navHeight - labelOpts.padding) / (maxItemHeight + labelOpts.padding)) || 1 : Infinity
    );

    this.navigation.totalPages = Math.ceil(totalRows / maxRows);

    // Find minimum height required to fit any page
    let height = 0;
    for (let i = 0; i < rows.length; i += maxRows) {
      const l = i > 0 ? rows[i - 1].bottom : 0;
      const r = rows[Math.min(i + maxRows - 1, rows.length - 1)].bottom;
      height = Math.max(height, r - l);
    }

    this.navigation._height = titleHeight + labelOpts.padding + height + navHeight + 10;
  }

  /**
   * @private
   */
  _computeVerticalNavigation(titleHeight, _itemHeight, boxWidth, labelFont) {
    const {labels: labelOpts, navigation: navOpts, maxWidth = this.maxWidth} = this.options;
    const {navHeight} = this.navigation;

    const heightLimit = this.maxHeight - titleHeight - navHeight - labelOpts.padding;
    const columns = this.navigation.blocks = [{start: 0, end: 0, height: 0, width: 0, right: 0}];
    let maxItemWidth = 0;

    this.legendItems.forEach((legendItem, i) => {
      const {itemWidth, itemHeight} = this._getLegendItemSize(legendItem, boxWidth, _itemHeight, labelFont);
      let col = columns[columns.length - 1];

      if (col.height + itemHeight + labelOpts.padding > heightLimit) {
        columns.push(col = {start: i, end: i, height: 0, width: 0, right: 0});
      }

      col.end = i + 1;
      col.height += itemHeight + labelOpts.padding;
      col.width = Math.max(col.width, itemWidth + labelOpts.padding);
      col.right = (columns.length > 1 ? columns[columns.length - 2].right : 0) + col.width;
      maxItemWidth = Math.max(maxItemWidth, col.width);
    });

    const totalCols = columns.length;

    const maxCols = this.navigation.maxBlocks = Math.min(
      totalCols,
      navOpts.maxCols || Infinity,
      maxWidth ? Math.floor((maxWidth - labelOpts.padding) / (maxItemWidth + labelOpts.padding)) || 1 : Infinity,
    );

    this.navigation.totalPages = Math.ceil(totalCols / maxCols);

    // Find minimum width required to fit any page
    let width = 0;
    for (let i = 0; i < columns.length; i += maxCols) {
      const l = i > 0 ? columns[i - 1].right : 0;
      const r = columns[Math.min(i + maxCols - 1, columns.length - 1)].right;
      width = Math.max(width, r - l);
    }

    const titleWidth = this._computeTitleWidth();
    this.navigation._width = Math.max(titleWidth, width) + 10;
  }

  buildNavigation() {
    const {ctx, options: {align, navigation: navOpts, labels: labelOpts}} = this;
    const {active, totalPages, navHeight} = this.navigation;

    if (!active) {
      return;
    }

    const font = toFont(navOpts.font);

    if (totalPages < 1 || (totalPages === 1 && navOpts.display === 'auto')) {
      this._resetNavigation();
      return;
    }

    const page = this.navigation.page = Math.max(0, Math.min(totalPages - 1, this.navigation.page));
    const text = this.navigation.text = `${page + 1}/${totalPages}`;

    ctx.save();
    ctx.font = font.string;
    const textWidth = ctx.measureText(text).width;
    ctx.restore();

    const padding = toPadding(navOpts.padding);
    const navWidth = this.navigation.navWidth = (navOpts.arrowSize * 2) + padding.width + textWidth + font.size;

    let left = this.left;
    let right = this.right;

    if (this.isHorizontal()) {
      const maxWidth = this.navigation._maxWidth + labelOpts.padding;
      left = _alignStartEnd(align, this.left, right - maxWidth);
      right = left + maxWidth;
    }

    const prev = this.navigation.prev = {
      x: _alignStartEnd(navOpts.align, left + padding.left, right - (navWidth - padding.left)),
      y: (this.top || 0) + this.height - navHeight + padding.top,
      width: navOpts.arrowSize,
      height: navOpts.arrowSize
    };
    this.navigation.next = {
      x: prev.x + navOpts.arrowSize + textWidth + font.size,
      y: prev.y,
      width: navOpts.arrowSize,
      height: navOpts.arrowSize
    };

    const {blocks: columns, maxBlocks: maxCols} = this.navigation;
    const startIdx = Math.min(columns.length - 1, page * maxCols);
    const endIdx = Math.min(columns.length - 1, startIdx + (maxCols - 1));
    const start = columns[startIdx].start;
    const end = columns[endIdx].end;
    this.navigation.legendItems = totalPages > 1 ? this.legendItems.slice(start, end) : this.legendItems;
  }

  /**
   * @private
   */
  _getLegendItemSize(legendItem, boxWidth, _itemHeight, labelFont) {
    const width = this._getLegendItemWidth(legendItem, boxWidth, labelFont);
    const height = this._getLegendItemHeight(legendItem, _itemHeight, labelFont);
    return {...width, ...height};
  }

  /**
   * @private
   */
  _getLegendItemWidth(legendItem, boxWidth, labelFont) {
    const hitboxWidth = calculateItemWidth(legendItem, boxWidth, labelFont, this.ctx);
    const itemWidth = this.navigation.itemWidth || hitboxWidth;
    return {itemWidth, hitboxWidth};
  }

  /**
   * @private
   */
  _getLegendItemHeight(legendItem, _itemHeight, labelFont) {
    const hitboxHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
    const itemHeight = this.navigation.itemHeight || hitboxHeight;
    return {itemHeight, hitboxHeight};
  }

  fit() {
    const {options, ctx} = this;

    // The legend may not be displayed for a variety of reasons including
    // the fact that the defaults got set to `false`.
    // When the legend is not displayed, there are no guarantees that the options
    // are correctly formatted so we need to bail out as early as possible.
    if (!options.display) {
      this.width = this.height = 0;
      return;
    }

    const labelOpts = options.labels;
    const labelFont = toFont(labelOpts.font);
    const fontSize = labelFont.size;
    const titleHeight = this._computeTitleHeight();
    const {boxWidth, itemHeight} = getBoxSize(labelOpts, fontSize);
    const isHorizontal = this.isHorizontal();

    let width, height;

    ctx.font = labelFont.string;

    if (isHorizontal) {
      width = this.maxWidth; // fill all the width
      height = this._fitRows(titleHeight, labelFont, boxWidth, itemHeight) + 10;
    } else {
      height = this.maxHeight; // fill all the height
      width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
    }

    const maxWidth = isHorizontal ? this.maxWidth : (options.maxWidth || this.maxWidth);
    const maxHeight = isHorizontal ? (options.maxHeight || this.maxHeight) : this.maxHeight;
    this.width = Math.min(this.navigation._width || width, maxWidth);
    this.height = Math.min(this.navigation._height || height, maxHeight);
  }

  /**
	 * @private
	 */
  _fitRows(titleHeight, labelFont, boxWidth, _itemHeight) {
    const {ctx, maxWidth, options: {labels: {padding}}} = this;
    const hitboxes = this.legendHitBoxes = [];
    // Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
    const lineWidths = this.lineWidths = [0];
    let totalHeight = titleHeight;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let row = 0;
    let top = 0;
    let currentLineHeight = 0;
    this.navigation.legendItems.forEach((legendItem, i) => {
      const {itemWidth, itemHeight, hitboxWidth, hitboxHeight} = this._getLegendItemSize(legendItem, boxWidth, _itemHeight, labelFont);

      if (i > 0 && lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
        lineWidths.push(0);

        totalHeight += currentLineHeight + padding;
        top += currentLineHeight + padding;
        row++;
        currentLineHeight = itemHeight;
      } else {
        currentLineHeight = Math.max(currentLineHeight, itemHeight);
      }

      hitboxes[i] = {left: 0, top, row, width: hitboxWidth, height: hitboxHeight, offsetWidth: itemWidth};
      lineWidths[lineWidths.length - 1] += itemWidth + padding;
    });

    totalHeight += currentLineHeight + padding;

    return totalHeight;
  }

  _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
    const {maxHeight, options: {labels: {padding}}} = this;
    const hitboxes = this.legendHitBoxes = [];
    const columnSizes = this.columnSizes = [];
    const heightLimit = maxHeight - titleHeight - this.navigation.navHeight;

    let totalWidth = padding;
    let currentColWidth = 0;
    let currentColHeight = 0;

    let left = 0;
    let col = 0;

    this.navigation.legendItems.forEach((legendItem, i) => {
      const {itemWidth, itemHeight, hitboxWidth, hitboxHeight} = this._getLegendItemSize(legendItem, boxWidth, _itemHeight, labelFont);

      // If too tall, go to new column
      if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
        totalWidth += currentColWidth + padding;
        columnSizes.push({width: currentColWidth, height: currentColHeight}); // previous column size
        left += currentColWidth + padding;
        col++;
        currentColWidth = currentColHeight = 0;
      }

      // Store the hitbox width and height here. Final position will be updated in `draw`
      hitboxes[i] = {left, top: currentColHeight, col, width: hitboxWidth, height: hitboxHeight, offsetHeight: itemHeight};

      // Get max width
      currentColWidth = Math.max(currentColWidth, itemWidth);
      currentColHeight += itemHeight + padding;
    });

    totalWidth += currentColWidth;
    columnSizes.push({width: currentColWidth, height: currentColHeight}); // previous column size

    const titleWidth = this._computeTitleWidth();
    totalWidth = Math.max(totalWidth, titleWidth);

    return totalWidth;
  }

  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const titleHeight = this._computeTitleHeight();
    const {legendHitBoxes: hitboxes, options: {align, labels: {padding}, rtl}} = this;
    const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
    if (this.isHorizontal()) {
      let row = 0;
      let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
      for (const hitbox of hitboxes) {
        if (row !== hitbox.row) {
          row = hitbox.row;
          left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
        }
        hitbox.top += this.top + titleHeight + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
        left += hitbox.offsetWidth + padding;
      }
    } else {
      const bottom = this.bottom - this.navigation.navHeight;

      let col = 0;
      let top = _alignStartEnd(align, this.top + titleHeight + padding, bottom - this.columnSizes[col].height);
      for (const hitbox of hitboxes) {
        if (hitbox.col !== col) {
          col = hitbox.col;
          top = _alignStartEnd(align, this.top + titleHeight + padding, bottom - this.columnSizes[col].height);
        }
        hitbox.top = top;
        hitbox.left += this.left + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
        top += hitbox.offsetHeight + padding;
      }
    }
  }

  isHorizontal() {
    return this.options.position === 'top' || this.options.position === 'bottom';
  }

  draw() {
    if (this.options.display) {
      const ctx = this.ctx;
      clipArea(ctx, this);

      this._draw();

      unclipArea(ctx);
    }
  }

  /**
	 * @private
	 */
  _draw() {
    const {options: opts, columnSizes, lineWidths, ctx} = this;
    const {align, labels: labelOpts} = opts;
    const defaultColor = defaults.color;
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const labelFont = toFont(labelOpts.font);
    const {padding} = labelOpts;
    const fontSize = labelFont.size;
    const halfFontSize = fontSize / 2;
    let cursor;

    this.drawTitle();

    // Canvas setup
    ctx.textAlign = rtlHelper.textAlign('left');
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 0.5;
    ctx.font = labelFont.string;

    const {boxWidth, boxHeight, itemHeight} = getBoxSize(labelOpts, fontSize);

    // current position
    const drawLegendBox = function(x, y, legendItem) {
      if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
        return;
      }

      // Set the ctx for the box
      ctx.save();

      const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
      ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
      ctx.lineCap = valueOrDefault(legendItem.lineCap, 'butt');
      ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
      ctx.lineJoin = valueOrDefault(legendItem.lineJoin, 'miter');
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);

      ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));

      if (labelOpts.usePointStyle) {
        // Recalculate x and y for drawPoint() because its expecting
        // x and y to be center of figure (instead of top left)
        const drawOptions = {
          radius: boxHeight * Math.SQRT2 / 2,
          pointStyle: legendItem.pointStyle,
          rotation: legendItem.rotation,
          borderWidth: lineWidth
        };
        const centerX = rtlHelper.xPlus(x, boxWidth / 2);
        const centerY = y + halfFontSize;

        // Draw pointStyle as legend symbol
        drawPointLegend(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
      } else {
        // Draw box as legend symbol
        // Adjust position when boxHeight < fontSize (want it centered)
        const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
        const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
        const borderRadius = toTRBLCorners(legendItem.borderRadius);

        ctx.beginPath();

        if (Object.values(borderRadius).some(v => v !== 0)) {
          addRoundedRectPath(ctx, {
            x: xBoxLeft,
            y: yBoxTop,
            w: boxWidth,
            h: boxHeight,
            radius: borderRadius,
          });
        } else {
          ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
        }

        ctx.fill();
        if (lineWidth !== 0) {
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const fillText = function(x, y, legendItem) {
      renderText(ctx, legendItem.text, x, y + (itemHeight / 2), labelFont, {
        strikethrough: legendItem.hidden,
        textAlign: rtlHelper.textAlign(legendItem.textAlign)
      });
    };

    // Horizontal
    const isHorizontal = this.isHorizontal();
    const titleHeight = this._computeTitleHeight();
    const bottom = this.bottom - this.navigation.navHeight;

    if (isHorizontal) {
      cursor = {
        x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
        y: this.top + padding + titleHeight,
        line: 0
      };
    } else {
      cursor = {
        x: this.left + padding,
        y: _alignStartEnd(align, this.top + titleHeight + padding, bottom - columnSizes[0].height),
        line: 0
      };
    }

    overrideTextDirection(this.ctx, opts.textDirection);

    let currentLineHeight = 0;
    this.navigation.legendItems.forEach((legendItem, i) => {
      ctx.strokeStyle = legendItem.fontColor; // for strikethrough effect
      ctx.fillStyle = legendItem.fontColor; // render in correct colour

      const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
      const width = this._getLegendItemWidth(legendItem, boxWidth, labelFont).itemWidth;
      const height = this._getLegendItemHeight(legendItem, itemHeight, labelFont).itemHeight + padding;
      let x = cursor.x;
      let y = cursor.y;

      rtlHelper.setWidth(this.width);

      if (isHorizontal) {
        if (i > 0 && x + width + padding > this.right) {
          y = cursor.y += currentLineHeight;
          cursor.line++;
          x = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
          currentLineHeight = 0;
        }
      } else if (i > 0 && y + height > bottom) {
        x = cursor.x = x + columnSizes[cursor.line].width + padding;
        cursor.line++;
        y = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, bottom - columnSizes[cursor.line].height);
      }

      const realX = rtlHelper.x(x);

      drawLegendBox(realX, y, legendItem);

      x = _textX(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl);

      // Fill the actual label
      fillText(rtlHelper.x(x), y, legendItem);

      if (isHorizontal) {
        cursor.x += width + padding;
      } else {
        cursor.y += height;
      }

      currentLineHeight = Math.max(currentLineHeight, height);
    });

    restoreTextDirection(this.ctx, opts.textDirection);

    this._drawNavigation();
  }

  /**
   * @private
   */
  _drawNavigation() {
    const {ctx, options: {navigation: navOpts}} = this;
    const {active, page, totalPages, maxBlocks, prev, next, text} = this.navigation;

    if (!active || (totalPages <= 1 && navOpts.display === 'auto')) {
      return;
    }

    const {arrowSize} = navOpts;
    const font = toFont(navOpts.font);
    const fontSize = font.size;
    const halfFontSize = fontSize / 2;
    const isHorizontal = this.isHorizontal();

    ctx.save();

    const drawArrow = (x, y, rotation = 0, color = navOpts.color) => {
      const [a, b, c] = getNavArrow(x, y, arrowSize, rotation);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.fill();
    };

    const rotation = isHorizontal && maxBlocks === 1 || !isHorizontal && maxBlocks > 1 ? 90 : 0;
    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;
    const colors = [navOpts.inactiveColor, navOpts.activeColor];
    drawArrow(prev.x + (arrowSize / 2), prev.y + (arrowSize / 2), 180 + rotation, colors[+hasPrev]);
    drawArrow(next.x + (arrowSize / 2), next.y + (arrowSize / 2), rotation, colors[+hasNext]);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = navOpts.color;
    ctx.fillStyle = navOpts.color;
    ctx.font = font.string;

    renderText(ctx, text, prev.x + arrowSize + halfFontSize, prev.y + (arrowSize / 2), font);
    ctx.restore();
  }

  /**
	 * @protected
	 */
  drawTitle() {
    const {ctx, options} = this;
    const {labels: labelOpts, title: titleOpts} = options;

    if (!titleOpts.display) {
      return;
    }

    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    const rtlHelper = getRtlAdapter(options.rtl, this.left, this.width);
    const position = titleOpts.position;
    const topPaddingPlusHalfFontSize = titlePadding.top + (titleFont.size / 2);
    let y;

    // These defaults are used when the legend is vertical.
    // When horizontal, they are computed below.
    let left = this.left;
    let maxWidth = this.width;

    if (this.isHorizontal()) {
      // Move left / right so that the title is above the legend lines
      maxWidth = (this.navigation._maxWidth || Math.max(...this.lineWidths)) + labelOpts.padding;
      y = this.top + topPaddingPlusHalfFontSize;
      left = _alignStartEnd(options.align, left, this.right - maxWidth);
    } else {
      // Move down so that the title is above the legend stack in every alignment
      const maxHeight = (this.navigation._maxHeight || this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0))
        + labelOpts.padding + this._computeTitleHeight() + this.navigation.navHeight;
      y = topPaddingPlusHalfFontSize + _alignStartEnd(options.align, this.top, this.bottom - maxHeight);
    }

    // Now that we know the left edge of the inner legend box, compute the correct
    // X coordinate from the title alignment
    const x = _alignStartEnd(position, left + titlePadding.left, left + (maxWidth - titlePadding.width));

    // Canvas setup
    ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = titleOpts.color;
    ctx.fillStyle = titleOpts.color;
    ctx.font = titleFont.string;

    renderText(ctx, titleOpts.text, x, y, titleFont);
  }

  /**
	 * @private
	 */
  _computeTitleHeight() {
    const titleOpts = this.options.title;

    if (!titleOpts.display) {
      return 0;
    }

    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    const titleText = titleOpts.text;

    let titleHeight = titleFont.lineHeight;
    if (titleText && typeof titleText !== 'string') {
      titleHeight *= titleText.length;
    }

    return titleHeight + titlePadding.height;
  }

  /**
	 * @private
	 */
  _computeTitleWidth() {
    const titleOpts = this.options.title;

    if (!titleOpts.display) {
      return 0;
    }

    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    let titleLongestText = titleOpts.text;

    if (titleLongestText && typeof titleLongestText !== 'string') {
      titleLongestText = titleLongestText.reduce((a, b) => a.length > b.length ? a : b);
    }

    this.ctx.save();
    this.ctx.font = titleFont.string;
    let titleWidth = this.ctx.measureText(titleLongestText).width;
    this.ctx.restore();

    return titleWidth + titlePadding.width;
  }

  /**
   * @private
   */
  _getNavigationDirAt(x, y) {
    const {prev, next} = this.navigation;

    if (!(prev && next)) {
      return 0;
    }

    const {arrowSize} = this.options.navigation;
    // Add a padding to the clickable area (30% of the arrow size)
    const padding = arrowSize * 0.3;

    if (_isBetween(x, prev.x - padding, prev.x + arrowSize + (padding / 2))
      && _isBetween(y, prev.y - padding, prev.y + arrowSize + padding)) {
      return -1;
    }
    if (_isBetween(x, next.x - (padding / 2), next.x + arrowSize + padding)
      && _isBetween(y, next.y - padding, next.y + arrowSize + padding)) {
      return 1;
    }

    return 0;
  }

  /**
	 * @private
	 */
  _getLegendItemAt(x, y) {
    let i, hitBox, lh;

    if (_isBetween(x, this.left, this.right)
      && _isBetween(y, this.top, this.bottom)) {
      // See if we are touching one of the dataset boxes
      lh = this.legendHitBoxes;
      for (i = 0; i < lh.length; ++i) {
        hitBox = lh[i];

        if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width)
          && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) {
          // Touching an element
          return this.navigation.legendItems[i];
        }
      }
    }

    return null;
  }

  /**
   * @private
   */
  _handleNavigationEvent(e) {
    if (e.type === 'click') {
      const dir = this._getNavigationDirAt(e.x, e.y);
      if (dir) {
        const {page, totalPages} = this.navigation;
        const lastPage = totalPages - 1;
        const newPage = this.navigation.page = Math.max(0, Math.min(lastPage, this.navigation.page + dir));

        if (newPage !== page) {
          this.buildNavigation();
          this.fit();
          this.adjustHitBoxes();
          this.chart.render();
        }
      }
    }
  }

  /**
	 * Handle an event
	 * @param {ChartEvent} e - The event to handle
	 */
  handleEvent(e) {
    if (this.navigation.totalPages > 1) {
      this._handleNavigationEvent(e);
    }

    const opts = this.options;
    if (!isListened(e.type, opts)) {
      return;
    }

    // Chart event already has relative position in it
    const hoveredItem = this._getLegendItemAt(e.x, e.y);

    if (e.type === 'mousemove' || e.type === 'mouseout') {
      const previous = this._hoveredItem;
      const sameItem = itemsEqual(previous, hoveredItem);
      if (previous && !sameItem) {
        call(opts.onLeave, [e, previous, this], this);
      }

      this._hoveredItem = hoveredItem;

      if (hoveredItem && !sameItem) {
        call(opts.onHover, [e, hoveredItem, this], this);
      }
    } else if (hoveredItem) {
      call(opts.onClick, [e, hoveredItem, this], this);
    }
  }
}

function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
  let legendItemText = legendItem.text;
  if (legendItemText && typeof legendItemText !== 'string') {
    legendItemText = legendItemText.reduce((a, b) => a.length > b.length ? a : b);
  }
  return boxWidth + (labelFont.size / 2) + ctx.measureText(legendItemText).width;
}

function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
  let itemHeight = _itemHeight;
  if (legendItem.text && typeof legendItem.text !== 'string') {
    itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
  }
  return itemHeight;
}

function calculateLegendItemHeight(legendItem, fontLineHeight) {
  const labelHeight = legendItem.text ? legendItem.text.length : 0;
  return fontLineHeight * labelHeight;
}

function isListened(type, opts) {
  if ((type === 'mousemove' || type === 'mouseout') && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === 'click' || type === 'mouseup')) {
    return true;
  }
  return false;
}

function getNavArrow(cx, cy, size, rotation = 0) {
  const x1 = cx; const
    y1 = cy + (size / 2);
  const x2 = cx - size / 2; const
    y2 = cy - (size / 2);
  const x3 = cx + size / 2; const
    y3 = y2;

  const result = [
    {x: x1, y: y1},
    {x: x2, y: y2},
    {x: x3, y: y3}
  ];

  const radians = (Math.PI / 180) * rotation;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  result.forEach(item => {
    const nx = (cos * (item.x - cx)) + (sin * (item.y - cy)) + cx;
    const ny = (cos * (item.y - cy)) - (sin * (item.x - cx)) + cy;
    item.x = nx;
    item.y = ny;
  });

  return result;
}

function getGridAxis(grid) {
  const result = {x: false, y: false};

  if (grid) {
    if (typeof grid === 'boolean') {
      result.x = result.y = true;
    } else {
      result.x = !!grid.x;
      result.y = !!grid.y;
    }
  }

  return result;
}

export default {
  id: 'legend',

  /**
	 * For tests
	 * @private
	 */
  _element: Legend,

  start(chart, _args, options) {
    const legend = chart.legend = new Legend({ctx: chart.ctx, options, chart});
    layouts.configure(chart, legend, options);
    layouts.addBox(chart, legend);
  },

  stop(chart) {
    layouts.removeBox(chart, chart.legend);
    delete chart.legend;
  },

  // During the beforeUpdate step, the layout configuration needs to run
  // This ensures that if the legend position changes (via an option update)
  // the layout system respects the change. See https://github.com/chartjs/Chart.js/issues/7527
  beforeUpdate(chart, _args, options) {
    const legend = chart.legend;
    layouts.configure(chart, legend, options);
    legend.options = options;
  },

  // The labels need to be built after datasets are updated to ensure that colors
  // and other styling are correct. See https://github.com/chartjs/Chart.js/issues/6968
  afterUpdate(chart) {
    const legend = chart.legend;
    legend.buildLabels();
    legend.buildNavigation();
    legend.adjustHitBoxes();
  },


  afterEvent(chart, args) {
    if (!args.replay) {
      chart.legend.handleEvent(args.event);
    }
  },

  defaults: {
    display: true,
    position: 'top',
    align: 'center',
    fullSize: true,
    reverse: false,
    weight: 1000,

    // a callback that will handle
    onClick(e, legendItem, legend) {
      const index = legendItem.datasetIndex;
      const ci = legend.chart;
      if (ci.isDatasetVisible(index)) {
        ci.hide(index);
        legendItem.hidden = true;
      } else {
        ci.show(index);
        legendItem.hidden = false;
      }
    },

    onHover: null,
    onLeave: null,

    navigation: {
      color: (ctx) => ctx.chart.options.color,
      display: false,
      arrowSize: 12,
      maxCols: 1,
      maxRows: 3,
      padding: {
        x: 10,
        y: 10,
        top: 0
      },
      align: 'start',
      grid: true,
      activeColor: (ctx) => ctx.chart.options.color,
      inactiveColor: (ctx) => new Color(ctx.chart.options.color).alpha(0.4).rgbString(),
      font: {
        weight: 'bold',
        size: 14
      }
    },

    labels: {
      color: (ctx) => ctx.chart.options.color,
      boxWidth: 40,
      padding: 10,
      // Generates labels shown in the legend
      // Valid properties to return:
      // text : text to display
      // fillStyle : fill of coloured box
      // strokeStyle: stroke of coloured box
      // hidden : if this legend item refers to a hidden item
      // lineCap : cap style for line
      // lineDash
      // lineDashOffset :
      // lineJoin :
      // lineWidth :
      generateLabels(chart) {
        const datasets = chart.data.datasets;
        const {labels: {usePointStyle, pointStyle, textAlign, color, useBorderRadius, borderRadius}} = chart.legend.options;

        return chart._getSortedDatasetMetas().map((meta) => {
          const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
          const borderWidth = toPadding(style.borderWidth);

          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            fontColor: color,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: style.borderDash,
            lineDashOffset: style.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: (borderWidth.width + borderWidth.height) / 4,
            strokeStyle: style.borderColor,
            pointStyle: pointStyle || style.pointStyle,
            rotation: style.rotation,
            textAlign: textAlign || style.textAlign,
            borderRadius: useBorderRadius && (borderRadius || style.borderRadius),

            // Below is extra data used for toggling the datasets
            datasetIndex: meta.index
          };
        }, this);
      }
    },

    title: {
      color: (ctx) => ctx.chart.options.color,
      display: false,
      position: 'center',
      text: '',
    }
  },

  descriptors: {
    _scriptable: (name) => !name.startsWith('on'),
    labels: {
      _scriptable: (name) => !['generateLabels', 'filter', 'sort'].includes(name),
    }
  },
};
