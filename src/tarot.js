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
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 * cardContent - function to construct the content in the middle of the card
 * dataset - array of objects
 */
function cardCommon(domNode, card, scales, cardContent, dataset) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth(scales);

  const container = d3
    .select(domNode)
    .attr('id', `card-${card.pos}`)
    .attr('class', 'card drawn-card')
    .on('mousemove', function tooltip() {
      const event = d3.event;
      const targetingChart = event.vegaType;
      const xPos = event.layerX;
      const yPos = event.layerY;
      d3.select('#tooltip')
        .style('display', targetingChart ? 'none' : 'block')
        .style('left', `${xPos}px`)
        .style('top', `${yPos}px`)
        .text(`${card.cardtitle}: ${card.tip}`);
    })
    .on('mouseout', () => d3.select('#tooltip').style('display', 'none'));

  container.selectAll('*').remove();
  const cardContainer = container
    .append('div')
    .style('height', `${yWindow(h)}px`)
    .style('width', `${xWindow(w)}px`);

  cardContainer
    .attr('class', `cardfront-container`)
    // reverse transform not current used, it can be, see main.js
    .style('transform', card.reversed ? 'rotate(-180deg)' : '');

  // background
  cardContainer.append('div').attr('class', 'cardfront-background');

  const mainCardContents = cardContainer
    .append('div')
    .attr('class', 'cardfront-main');
  // label
  mainCardContents
    .append('div')
    .attr('class', 'cardfront-label')
    .text(d =>
      card.suit === 'major arcana'
        ? `${toRomanNumeral(d.cardnum)}. ${d.tradname}`
        : card.cardtitle
    );
  cardContent(mainCardContents, card, scales, dataset);
}

/**
 * Constructs a minor aracana card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 * dataset - array of objects
 */
function minorArcana(domNode, card, scales, dataset) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth(scales);
  domNode
    .append('div')
    .style('height', `${yWindow(h)}`)
    .style('width', `${xWindow(w)}`)
    .attr('class', 'vega-container')
    .append('div')
    .attr('class', 'lds-dual-ring');

  console.log(card.charttype);
  const spec = CHART_LOOKUP[card.charttype](
    card.dimensions,
    yWindow(h) * 0.8,
    xWindow(w),
    dataset
  );
  setTimeout(() => {
    vegaEmbed(`#card-${card.pos} .vega-container`, spec, {
      actions: false,
      config: VEGA_CONFIG
      // renderer: 'svg'
    }).catch(console.error);
  }, 750);
  domNode
    .append('div')
    .attr('class', 'card-title card-title--minor-arcana')
    .text(card.cardMainTitle);
}

/**
 * Constructs a emojii card, placholder stuff
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function exampleCardFrontEmoji(domNode, card) {
  domNode
    .append('div')
    .attr('class', 'emoji-label')
    .style('text-anchor', 'middle')
    .style('font-size', 40)
    .text(emojii[card.pos % emojii.length]);
}

/**
 * Constructs a major aracana card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 * dataset - array of objects
 */
function majorArcana(domNode, card) {
  domNode
    .append('div')
    .attr('class', 'major-arcana-img-container')
    .append('img')
    .attr('src', `assets/major-arcana-imgs/${card.image}`);
  domNode
    .append('div')
    .attr('class', 'card-title card-title--major-arcana')
    .text(card.cardtitle);

  // just for making a figure
  domNode
    .append('div')
    .attr('class', 'card-tip')
    .text(card.tip);
}

/**
 * Inspects the card object to determine what type of card should be rendered and then does that
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 * dataset - array of objects
 */
function renderAppropriateCard(domNode, card, scales, dataset) {
  cardCommon(
    domNode,
    card,
    scales,
    card.suit === 'major arcana' ? majorArcana : minorArcana,
    dataset
  );
}
