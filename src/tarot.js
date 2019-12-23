const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const faces = ['Page', 'Knight', 'Queen', 'King'];

function majorArcana(domNode, card, scales) {
  console.log(domNode);
}

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

function scatterplot(xDim, yDim, height, width, datasetName) {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    transform: [],
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

function cardCommon(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const cardSvg = d3.select(domNode).attr('id', `card-${card.pos}`);
  cardSvg.selectAll('*').remove();
  cardSvg.attr('class', 'cardfront-container');
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
    .attr('y', yWindow(h * 0.8))
    .attr('text-anchor', 'middle')
    .text('EXAMPLE');

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
    .html(d => `<div class="tooltip">INTERPRET ME</div>`);
  return cardSvg;
}

function exampleCardFrontScatterplot(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const cardSvg = cardCommon(domNode, card, scales);
  cardSvg
    .append('foreignObject')
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .html(d => `<div class="vega-container"></div>`);
  const examplexDim = 'Pg Assists';
  const exampleyDim = 'Pg Blocks';
  vegaEmbed(
    `#card-${card.pos} .vega-container`,
    scatterplot(
      examplexDim,
      exampleyDim,
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

// this function will select the appropriate design function
// a d3 chart if it's the minor arcana, and the major arcana emojii
// thing if it's major
let counter = 0;
function findAppropriateCard(card) {
  counter += 1;
  console.log(card);
  return counter % 2 ? exampleCardFrontEmoji : exampleCardFrontScatterplot;
}
