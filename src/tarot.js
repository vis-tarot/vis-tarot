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
    .text(d =>
      card.suit === 'major arcana'
        ? `${toRomanNumeral(d.cardnum)}. ${d.tradname}`
        : card.cardtitle
    );

  cardSvg
    .append('foreignObject')
    .attr('x', 0)
    .attr('y', yWindow(h * 0.8))
    .attr('height', yWindow(h) * 0.2)
    .attr('width', xWindow(w))
    .html(d =>
      card.suit === 'major arcana'
        ? `<div class="card-title">${d.cardtitle}</div>`
        : ''
    );

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
 * Constructs a minor aracana card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function minorArcana(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const cardSvg = cardCommon(domNode, card, scales);
  cardSvg
    .append('foreignObject')
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .html(
      () =>
        `<div class="vega-container"><div class="lds-dual-ring"></div></div>`
    );

  console.log('???', card);
  const spec = CHART_LOOKUP[card.charttype](
    card.dims,
    yWindow(h) * 0.8,
    xWindow(w),
    'per_game_data'
  );
  setTimeout(() => {
    vegaEmbed(`#card-${card.pos} .vega-container`, spec)
      // .then(function(result) {
      //   domNode.querySelector('.lds-dual-ring').remove();
      //   // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
      //   console.log('view', result);
      // })
      .catch(console.error);
  }, 750);
}

/**
 * Constructs a emojii card, placholder stuff
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
  console.log(card);
  switch (card.suit) {
    case 'pentacles':
    case 'swords':
    case 'wands':
    case 'cups':
      return minorArcana(domNode, card, scales);
    default:
    case 'major arcana':
      return majorArcana(domNode, card, scales);
  }
}
