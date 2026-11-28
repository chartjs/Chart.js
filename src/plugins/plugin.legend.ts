import defaults from '../core/core.defaults.js';
import Element from '../core/core.element.js';
import layouts from '../core/core.layouts.js';
import {addRoundedRectPath, drawPointLegend, renderText} from '../helpers/helpers.canvas.js';
import {
  _isBetween,
  _isClickEvent,
  callback as call,
  clipArea,
  getRtlAdapter,
  isArray,
  overrideTextDirection,
  restoreTextDirection,
  toFont,
  toPadding,
  unclipArea,
  valueOrDefault,
} from '../helpers/index.js';
import {_alignStartEnd, _textX, _toLeftRightCenter} from '../helpers/helpers.extras.js';
import {toTRBLCorners} from '../helpers/helpers.options.js';
import type {AnyObject} from '../types/basic.js';
import type {
  Chart,
  ChartArea,
  ChartEvent,
  ChartType,
  FontSpec,
  LayoutItem,
  LayoutPosition,
  LegendItem,
  LegendOptions,
  TextAlign,
} from '../types/index.js';

type PublicLegendOptions = LegendOptions<ChartType>;
type WithResolvedFont<T> = Omit<T, 'font'> & {font: Partial<FontSpec>};
type LegendCallback<R = void> = (this: Legend, ...args: unknown[]) => R;

/**
 * The legend options as the plugin reads them. They are resolved, so a font is
 * an object and not a scriptable option, and a title may have several lines.
 * The callbacks are only handed to `callback()`, which takes them untyped.
 */
interface LegendOpts extends Omit<PublicLegendOptions, 'labels' | 'title' | 'onClick' | 'onHover' | 'onLeave' | 'textDirection'> {
  labels: WithResolvedFont<Omit<PublicLegendOptions['labels'], 'generateLabels'>> & {generateLabels: LegendCallback<LegendItem[]>};
  title: WithResolvedFont<Omit<PublicLegendOptions['title'], 'text'>> & {text: string | string[]};
  onClick: LegendCallback;
  onHover: LegendCallback;
  onLeave: LegendCallback;
  textDirection: 'ltr' | 'rtl';
  events?: string[];
}

type LegendLabelOptions = LegendOpts['labels'];
type LegendFont = ReturnType<typeof toFont>;

/**
 * What every legend item shares: the label font and the symbol, resolved once
 * in `fit()` so that drawing uses what the items were laid out with.
 */
interface LegendLabelLayout {
  font: LegendFont;
  boxWidth: number;
  boxHeight: number;
  /** The height of a one-line item. */
  itemHeight: number;
  /** The symbol is a point style, else a box. */
  usePointStyle: boolean;
  pointStyleWidth: number;
}

/**
 * Where a legend item sits and how large it is. `fit()` stores the size, the
 * row (horizontal legend) or column (vertical legend) and the text width;
 * `adjustHitBoxes()` moves the box to its position on the canvas and stores
 * where the symbol and the text are drawn. Drawing reads only these.
 */
interface LegendHitBox {
  left: number;
  top: number;
  width: number;
  height: number;
  row?: number;
  col?: number;
  /**
   * @private
   */
  _text: {
    /** The width `fit()` measured. */
    width: number;
    /** Where the first line is drawn, after right-to-left mirroring. */
    x: number;
    y: number;
    align: CanvasTextAlign;
  };
  /**
   * The symbol's top left corner, or its center when the labels use point
   * styles, after right-to-left mirroring.
   * @private
   */
  _symbol: {
    x: number;
    y: number;
  };
}

interface LegendColumnSize {
  width: number;
  height: number;
}

const getBoxSize = (labelOpts: LegendLabelOptions, fontSize: number) => {
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

const itemsEqual = (a: LegendItem | null, b: LegendItem | null) => a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index;

function getAlignedHitBox(x: number, textWidth: number, boxWidth: number, fontSize: number, textAlign: TextAlign, right: number) {
  const textX = _textX(textAlign, x + boxWidth + fontSize / 2, right, false);
  const textLeft = textX - (textAlign === 'center' ? textWidth / 2 : textAlign === 'right' ? textWidth : 0);
  const left = Math.min(x, textLeft);
  // Cover both the symbol and the aligned text in LTR coordinates.
  return {left, width: Math.max(x + boxWidth, textLeft + textWidth) - left};
}

/**
 * The text alignment of an item: its own, or else the labels' one, which is
 * written back to the item because users read `legendItems[i].textAlign`.
 */
function applyItemTextAlign(item: LegendItem | undefined, labelAlign: TextAlign): TextAlign {
  // The labels are built again after fit(), so there can be fewer items than hit boxes.
  if (!item) {
    return labelAlign;
  }
  return item.textAlign || (item.textAlign = labelAlign);
}

/**
 * What `adjustHitBoxes()` reads once to place every item.
 */
interface ItemPlacement {
  layout: LegendLabelLayout;
  rtlHelper: ReturnType<typeof getRtlAdapter>;
  rtl: boolean;
}

/**
 * Store where an item's symbol and text are drawn.
 * @param placement - what every item shares
 * @param hitbox - the item's hit box, with its final top
 * @param textAlign - the alignment of the item's text
 * @param x - the left edge of the item, before right-to-left mirroring
 * @param right - the right end of the item's text area, before mirroring
 */
function placeItem({layout: {font, boxWidth, boxHeight, itemHeight, usePointStyle}, rtlHelper, rtl}: ItemPlacement, hitbox: LegendHitBox, textAlign: TextAlign, x: number, right: number) {
  const halfFontSize = font.size / 2;
  const y = hitbox.top;
  const realX = rtlHelper.x(x);
  const symbol = hitbox._symbol;
  const text = hitbox._text;

  if (usePointStyle) {
    symbol.x = rtlHelper.xPlus(realX, boxWidth / 2);
    symbol.y = y + halfFontSize;
  } else {
    // Center the box when it is lower than the font.
    symbol.x = rtlHelper.leftForLtr(realX, boxWidth);
    symbol.y = y + Math.max((font.size - boxHeight) / 2, 0);
  }

  // The canvas alignment, which is mirrored for right-to-left, places the text.
  text.align = rtlHelper.textAlign(textAlign);
  text.x = rtlHelper.x(_textX(text.align, x + boxWidth + halfFontSize, right, rtl));
  text.y = y + itemHeight / 2;
}

/**
 * Widen and move the hit box of a vertical legend item so that it covers the
 * symbol and the aligned text, then mirror it for right-to-left.
 * @param placement - what every item shares
 * @param hitbox - the item's hit box
 * @param textAlign - the alignment of the item's text
 * @param x - the left edge of the item, before right-to-left mirroring
 * @param right - the right end of the item's text area, before mirroring
 */
function coverAlignedText({layout: {font, boxWidth}, rtlHelper}: ItemPlacement, hitbox: LegendHitBox, textAlign: TextAlign, x: number, right: number) {
  const aligned = getAlignedHitBox(x, hitbox._text.width, boxWidth, font.size, textAlign, right);
  hitbox.width = aligned.width;
  hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(aligned.left), hitbox.width);
}
export class Legend extends Element<AnyObject, LegendOpts> implements LayoutItem {

  _added: boolean;
  // Contains hit boxes for each dataset (in dataset order)
  legendHitBoxes: LegendHitBox[];
  /**
   * @private
   */
  _hoveredItem: LegendItem | null;
  // Are we in doughnut mode which has a different data type
  doughnutMode: boolean;
  chart: Chart;
  ctx: CanvasRenderingContext2D;
  legendItems: LegendItem[];
  columnSizes: LegendColumnSize[];
  lineWidths: number[];
  maxHeight: number;
  maxWidth: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  height: number;
  width: number;
  _margins: ChartArea;
  position: LayoutPosition;
  weight: number;
  fullSize: boolean;
  /**
   * @private
   */
  _labelLayout: LegendLabelLayout;

  constructor(config: {ctx: CanvasRenderingContext2D; options: LegendOpts; chart: Chart}) {
    super();

    this._added = false;
    this.legendHitBoxes = [];
    this._hoveredItem = null;
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
    this._labelLayout = undefined;
  }

  update(maxWidth: number, maxHeight: number, margins: ChartArea) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins;

    this.setDimensions();
    this.buildLabels();
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
    const labelOpts = this.options.labels;
    let legendItems: LegendItem[] = call(labelOpts.generateLabels, [this.chart], this) || [];

    if (labelOpts.filter) {
      legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
    }

    if (labelOpts.sort) {
      legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, this.chart.data));
    }

    if (this.options.reverse) {
      legendItems.reverse();
    }

    this.legendItems = legendItems;
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
    const font = toFont(labelOpts.font);
    const titleHeight = this._computeTitleHeight();
    const layout: LegendLabelLayout = this._labelLayout = {
      font,
      ...getBoxSize(labelOpts, font.size),
      usePointStyle: labelOpts.usePointStyle,
      pointStyleWidth: labelOpts.pointStyleWidth
    };

    let width: number, height: number;

    ctx.font = font.string;

    if (this.isHorizontal()) {
      width = this.maxWidth; // fill all the width
      height = this._fitRows(titleHeight, layout) + 10;
    } else {
      height = this.maxHeight; // fill all the height
      width = Math.max(this._fitCols(titleHeight, layout), this._computeTitleWidth()) + 10;
    }

    this.width = Math.min(width, options.maxWidth || this.maxWidth);
    this.height = Math.min(height, options.maxHeight || this.maxHeight);
  }

  /**
   * @private
   */
  _fitRows(titleHeight: number, layout: LegendLabelLayout) {
    const {ctx, maxWidth, legendItems, options: {labels: {padding}}} = this;
    const {font, boxWidth, itemHeight: lineItemHeight} = layout;
    const fontSize = font.size;
    const hitboxes: LegendHitBox[] = this.legendHitBoxes = [];
    // Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
    const lineWidths = this.lineWidths = [0];

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // A row is as tall as its tallest item; its items keep their own height.
    let row = 0;
    let top = 0;
    let rowHeight = 0;
    // A loop, not forEach: the row height changes with every item, and a
    // closure would keep it as an allocated number.
    for (let i = 0; i < legendItems.length; i++) {
      const legendItem = legendItems[i];
      // A one-line label is measured here: the helpers cost time and an allocation per item.
      const multiLine = isArray(legendItem.text);
      const textWidth = multiLine ? calculateTextWidth(legendItem, ctx) : ctx.measureText(legendItem.text as string).width;
      const itemWidth = boxWidth + (fontSize / 2) + textWidth;
      const itemHeight = multiLine ? calculateItemHeight(lineItemHeight, legendItem, font.lineHeight) : lineItemHeight;

      if (i > 0 && lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
        lineWidths.push(0);
        top += rowHeight + padding;
        rowHeight = 0;
        row++;
      }
      rowHeight = Math.max(rowHeight, itemHeight);

      // adjustHitBoxes() writes the positions; they start at 0 so that every hit box has one shape.
      hitboxes[i] = {
        left: 0, top, row, width: itemWidth, height: itemHeight,
        _text: {width: textWidth, x: 0, y: 0, align: 'left'},
        _symbol: {x: 0, y: 0}
      };

      lineWidths[lineWidths.length - 1] += itemWidth + padding;
    }

    return titleHeight + (legendItems.length ? top + rowHeight + padding : 0);
  }

  /**
   * @private
   */
  _fitCols(titleHeight: number, layout: LegendLabelLayout) {
    const {font, boxWidth, itemHeight: lineItemHeight} = layout;
    const {ctx, maxHeight, options: {labels: {padding}}} = this;
    const hitboxes: LegendHitBox[] = this.legendHitBoxes = [];
    const columnSizes: LegendColumnSize[] = this.columnSizes = [];
    const heightLimit = maxHeight - titleHeight;

    let totalWidth = padding;
    let currentColWidth = 0;
    let currentColHeight = 0;

    let left = 0;
    let col = 0;

    this.legendItems.forEach((legendItem, i) => {
      const textWidth = calculateTextWidth(legendItem, ctx);
      const itemWidth = boxWidth + (font.size / 2) + textWidth;
      const itemHeight = calculateItemHeight(lineItemHeight, legendItem, font.lineHeight);

      // If too tall, go to new column
      if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
        totalWidth += currentColWidth + padding;
        columnSizes.push({width: currentColWidth, height: currentColHeight}); // previous column size
        left += currentColWidth + padding;
        col++;
        currentColWidth = currentColHeight = 0;
      }

      // Store the hitbox width and height here. adjustHitBoxes() writes the final position.
      hitboxes[i] = {
        left, top: currentColHeight, col, width: itemWidth, height: itemHeight,
        _text: {width: textWidth, x: 0, y: 0, align: 'left'},
        _symbol: {x: 0, y: 0}
      };

      // Get max width
      currentColWidth = Math.max(currentColWidth, itemWidth);
      currentColHeight += itemHeight + padding;
    });

    totalWidth += currentColWidth;
    columnSizes.push({width: currentColWidth, height: currentColHeight}); // previous column size

    return totalWidth;
  }

  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const titleHeight = this._computeTitleHeight();
    const {legendHitBoxes: hitboxes, legendItems, options: {align, rtl, labels: {padding, textAlign: labelAlign}}} = this;
    const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
    const placement: ItemPlacement = {layout: this._labelLayout, rtlHelper, rtl};
    if (this.isHorizontal()) {
      let row = 0;
      let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
      for (let i = 0; i < hitboxes.length; i++) {
        const hitbox = hitboxes[i];
        if (row !== hitbox.row) {
          row = hitbox.row;
          left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
        }
        hitbox.top += this.top + titleHeight + padding;
        placeItem(placement, hitbox, applyItemTextAlign(legendItems[i], labelAlign), left, left + hitbox.width);
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
        left += hitbox.width + padding;
      }
    } else {
      let col = 0;
      let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
      for (let i = 0; i < hitboxes.length; i++) {
        const hitbox = hitboxes[i];
        if (hitbox.col !== col) {
          col = hitbox.col;
          top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
        }
        hitbox.top = top;
        // The left edge from fit(), before the aligned text moves the hit box.
        const x = hitbox.left + this.left + padding;
        const right = this._columnRight(x, col);
        const textAlign = applyItemTextAlign(legendItems[i], labelAlign);
        placeItem(placement, hitbox, textAlign, x, right);
        coverAlignedText(placement, hitbox, textAlign, x, right);
        top += hitbox.height + padding;
      }
    }
  }

  /**
   * End of a vertical legend column's text area: the next column's left edge
   * minus padding, or the legend's right edge for the last column.
   * @param x - the left edge of the column
   * @param col - the index of the column
   * @private
   */
  _columnRight(x: number, col: number) {
    const {columnSizes} = this;
    return col < columnSizes.length - 1 ? x + columnSizes[col].width : this.right;
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
    const {options: opts, ctx, legendHitBoxes: hitboxes} = this;
    const {font: labelFont, boxWidth, boxHeight, usePointStyle, pointStyleWidth} = this._labelLayout;
    const defaultColor = defaults.color;
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);

    this.drawTitle();

    // Canvas setup
    ctx.textAlign = rtlHelper.textAlign('left');
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 0.5;
    ctx.font = labelFont.string;

    // x and y are the center of a point style, else the box's top left corner.
    const drawLegendBox = function(x: number, y: number, legendItem: LegendItem) {
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

      if (usePointStyle) {
        const drawOptions = {
          radius: boxHeight * Math.SQRT2 / 2,
          pointStyle: legendItem.pointStyle,
          rotation: legendItem.rotation,
          borderWidth: lineWidth
        };

        // Draw pointStyle as legend symbol
        drawPointLegend(ctx, drawOptions, x, y, pointStyleWidth && boxWidth);
      } else {
        // Draw box as legend symbol
        const borderRadius = toTRBLCorners(legendItem.borderRadius);

        ctx.beginPath();

        if (Object.values(borderRadius).some(v => v !== 0)) {
          addRoundedRectPath(ctx, {
            x,
            y,
            w: boxWidth,
            h: boxHeight,
            radius: borderRadius,
          });
        } else {
          ctx.rect(x, y, boxWidth, boxHeight);
        }

        ctx.fill();
        if (lineWidth !== 0) {
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    overrideTextDirection(this.ctx, opts.textDirection);

    this.legendItems.forEach((legendItem, i) => {
      // Draw each item where adjustHitBoxes() placed it. An item without a
      // hit box was added after fit(), so there is no room for it.
      const hitbox = hitboxes[i];
      if (!hitbox) {
        return;
      }
      const {_symbol: symbol, _text: text} = hitbox;

      ctx.strokeStyle = legendItem.fontColor; // for strikethrough effect
      ctx.fillStyle = legendItem.fontColor; // render in correct colour

      drawLegendBox(symbol.x, symbol.y, legendItem);

      // Fill the actual label
      renderText(ctx, legendItem.text, text.x, text.y, labelFont, {
        strikethrough: legendItem.hidden,
        textAlign: text.align
      });
    });

    restoreTextDirection(this.ctx);
  }

  /**
   * @protected
   */
  drawTitle() {
    const opts = this.options;
    const titleOpts = opts.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);

    if (!titleOpts.display) {
      return;
    }

    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const ctx = this.ctx;
    const position = titleOpts.position;
    const halfFontSize = titleFont.size / 2;
    const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
    let y: number;

    // These defaults are used when the legend is vertical.
    // When horizontal, they are computed below.
    let left = this.left;
    let maxWidth = this.width;

    if (this.isHorizontal()) {
      // Move left / right so that the title is above the legend lines
      maxWidth = Math.max(...this.lineWidths);
      y = this.top + topPaddingPlusHalfFontSize;
      left = _alignStartEnd(opts.align, left, this.right - maxWidth);
    } else {
      // Move down so that the title is above the legend stack in every alignment
      const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
      y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
    }

    // Now that we know the left edge of the inner legend box, compute the correct
    // X coordinate from the title alignment, accounting for horizontal padding
    const x = _alignStartEnd(position, left + titlePadding.left, left + maxWidth - titlePadding.right);

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
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
  }

  /**
   * @private
   */
  _computeTitleWidth() {
    const {ctx, options: {title}} = this;
    if (!title.display) {
      return 0;
    }
    ctx.save();
    ctx.font = toFont(title.font).string;
    const lines: string[] = isArray(title.text) ? title.text : [title.text];
    let width = 0;
    for (const line of lines) {
      width = Math.max(width, ctx.measureText(line).width);
    }
    ctx.restore();
    return width + toPadding(title.padding).width;
  }

  /**
   * @private
   */
  _getLegendItemAt(x: number, y: number): LegendItem | null {
    let i: number, hitBox: LegendHitBox, lh: LegendHitBox[];

    if (_isBetween(x, this.left, this.right)
      && _isBetween(y, this.top, this.bottom)) {
      // See if we are touching one of the dataset boxes
      lh = this.legendHitBoxes;
      for (i = 0; i < lh.length; ++i) {
        hitBox = lh[i];

        if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width)
          && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) {
          // Touching an element
          return this.legendItems[i];
        }
      }
    }

    return null;
  }

  /**
   * Handle an event
   * @param e - The event to handle
   */
  handleEvent(e: ChartEvent) {
    const opts = this.options;
    if (!isListened(e, opts, this.chart)) {
      return;
    }

    // Chart event already has relative position in it
    const hoveredItem = e.type === 'mouseout' ? null : this._getLegendItemAt(e.x, e.y);

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

/**
 * Width of an item's label: its widest line.
 */
function calculateTextWidth(legendItem: LegendItem, ctx: CanvasRenderingContext2D) {
  const legendItemText = legendItem.text;
  if (!isArray<string>(legendItemText)) {
    return ctx.measureText(legendItemText).width;
  }
  let width = 0;
  for (const line of legendItemText) {
    width = Math.max(width, ctx.measureText(line).width);
  }
  return width;
}

/**
 * Height of an item: the larger of its symbol and its label, which is one line
 * for anything but an array, and one line per element for an array.
 * @param _itemHeight - the height of a one-line item, which covers the symbol
 */
function calculateItemHeight(_itemHeight: number, legendItem: LegendItem, fontLineHeight: number) {
  const text = legendItem.text;
  return isArray(text) ? Math.max(_itemHeight, fontLineHeight * text.length) : _itemHeight;
}

function isListened(e: ChartEvent, opts: LegendOpts, chart: Chart) {
  const type = e.type;
  if ((type === 'mousemove' || type === 'mouseout') && (opts.onHover || opts.onLeave)) {
    return true;
  }
  // A right-click does not run the legend's onClick. The legend listens to its
  // own events, or else the chart's, as in the chart's plugin event filter.
  const events = opts.events || chart.options.events;
  return Boolean(opts.onClick) && type !== 'contextmenu' && _isClickEvent(e, events);
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
    onClick(_e, legendItem, legend) {
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
          const itemPointStyle = pointStyle || style.pointStyle;
          // a line symbol stands for the dataset line but the point scope has no dash
          // on it so read that off the dataset element instead, markers stay solid
          const dashStyle = usePointStyle && itemPointStyle === 'line'
            ? meta.controller.getStyle(undefined)
            : style;

          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            fontColor: color,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: dashStyle.borderDash,
            lineDashOffset: dashStyle.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: (borderWidth.width + borderWidth.height) / 4,
            strokeStyle: style.borderColor,
            pointStyle: itemPointStyle,
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
