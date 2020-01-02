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
  console.log(card);
  domNode
    .append('div')
    .style('height', `${yWindow(h)}`)
    .style('width', `${xWindow(w)}`)
    .attr('class', 'vega-container')
    .append('div')
    .attr('class', 'lds-dual-ring');

  const spec = CHART_LOOKUP[card.charttype](
    card.dims,
    yWindow(h) * 0.8,
    xWindow(w),
    dataset
  );
  setTimeout(() => {
    vegaEmbed(`#card-${card.pos} .vega-container`, spec, {
      actions: false
    }).catch(console.error);
  }, 750);
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
    .attr('class', 'card-title')
    .text(card.cardtitle);
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
