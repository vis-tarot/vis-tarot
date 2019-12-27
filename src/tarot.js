const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const faces = ['Page', 'Knight', 'Queen', 'King'];
const emojii = [
  '🚘',
  '🔪',
  '🎖',
  '↩️',
  '💹',
  '👳',
  '📖',
  '👉',
  '🏄',
  '➡️',
  '💛',
  '👑',
  '🍄',
  '⚠️',
  '🔜',
  '🎒',
  '🐼',
  '🌿',
  '🐆',
  '👺',
  '👭'
];

/**
 * Build a vega-lite scatterplot
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * datasetName - the name of the dataset
 */
function scatterplot(dimensions, height, width, datasetName) {
  const {xDim, yDim} = dimensions;
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    transform: [],
    // TODO this should also support user uploaded dataset
    data: {url: `data/${datasetName}.csv`},
    mark: {type: 'circle', tooltip: true},
    encoding: {
      x: {
        field: xDim,
        type: 'quantitative',
        scale: {zero: false}
      },
      y: {
        field: yDim,
        type: 'quantitative',
        scale: {zero: false}
      }
    },
    height: height,
    width: width
  };
}

/**
 * Handles the parts of the card layout which are common to all cards.
 * Returns a d3 selection of the partially constructed card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function cardCommon(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const svg = d3.select(domNode).attr('id', `card-${card.pos}`);
  svg.selectAll('*').remove();
  const cardSvg = svg.append('g');

  cardSvg
    .attr('class', `cardfront-container`)
    .attr(
      'transform',
      card.reversed
        ? `rotate(-180) translate(-${xWindow(w)}, -${yWindow(h)})`
        : ''
    );
  cardSvg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .attr('stroke', 'black')
    .attr('stroke-width', 7)
    .attr('fill', 'white')
    .attr('rx', 10)
    .attr('rx', 10);

  cardSvg
    .append('text')
    .attr('x', xWindow(w / 2))
    .attr('y', yWindow(h * 0.1))
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .text(d => `${toRomanNumeral(d.cardnum)}. ${d.tradname}`);

  cardSvg
    .append('foreignObject')
    .attr('x', 0)
    .attr('y', yWindow(h * 0.8))
    .attr('height', yWindow(h) * 0.2)
    .attr('width', xWindow(w))
    .html(() => `<div class="card-title">${card.cardtitle}</div>`);

  const TOOLTIP_WIDTH = 200;
  const TOOLTIP_HEIGHT = 100;
  const toolTipContainer = cardSvg
    .append('g')
    .attr('class', 'tooltip-container')
    .attr(
      'transform',
      `translate(${xWindow(w / 2) - TOOLTIP_WIDTH / 2}, ${yWindow(h) -
        TOOLTIP_HEIGHT / 2})`
    );
  toolTipContainer
    .append('foreignObject')
    .attr('class', 'tooltip')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', TOOLTIP_HEIGHT)
    .attr('width', TOOLTIP_WIDTH)
    .html(
      () => `<div class="tooltip"><b>${card.cardtitle}</b>: ${card.tip}</div>`
    );
  return cardSvg;
}

/**
 * Constructs a minor aracana (TODO SUIT HERE) scatterplot
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function minorArcanaCupsScatterplot(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const cardSvg = cardCommon(domNode, card, scales);
  cardSvg
    .append('foreignObject')
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .html(() => `<div class="vega-container"></div>`);
  const examplexDim = 'Pg Assists';
  const exampleyDim = 'Pg Blocks';
  vegaEmbed(
    `#card-${card.pos} .vega-container`,
    scatterplot(
      {xDim: examplexDim, yDim: exampleyDim},
      yWindow(h) * 0.8,
      xWindow(w),
      'per_game_data'
    )
  )
    // .then(function(result) {
    //   // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    //   console.log('view', result);
    // })
    .catch(console.error);
}

/**
 * Constructs a emojii card, unused
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function exampleCardFrontEmoji(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const cardSvg = cardCommon(domNode, card, scales);
  cardSvg
    .append('text')
    .attr('x', xWindow(w / 2))
    .attr('y', yWindow(h * 0.5))
    .attr('text-anchor', 'middle')
    .attr('font-size', 40)
    .text(emojii[card.pos % emojii.length]);
}

/**
 * Constructs a major aracana card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function majorArcana(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const cardSvg = cardCommon(domNode, card, scales);

  cardSvg
    .append('foreignObject')
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .html(
      `<div class="major-arcana-img-container"><img src="assets/major-arcana-imgs/${card.image}"/></div>`
    );
}

/**
 * Inspects the card object to determine what type of card should be rendered and returns
 * a function for rendering that type of card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function renderAppropriateCard(domNode, card, scales) {
  return majorArcana(domNode, card, scales);
}
