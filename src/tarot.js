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
 * middleContent - function to construct the content in the middle of the card
 */
function cardCommon(domNode, card, scales, middleContent) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  // tooltip defined after the container, but the container needs referece to it shruggie
  let tooltipNode = null;

  const container = d3
    .select(domNode)
    .attr('id', `card-${card.pos}`)
    .on('mousemove', function tooltip() {
      const [xPos, yPos] = d3.mouse(this);
      tooltipNode
        .style('display', 'block')
        .style('transform', `translate(${xPos}px, ${yPos}px)`);
    })
    .on('mouseout', () => tooltipNode.style('display', 'none'));

  container.selectAll('*').remove();
  let cardContainer = container
    .append('div')
    .style('height', `${yWindow(h)}px`)
    .style('width', `${xWindow(w)}px`);

  // reverse trans not current used
  const reverseTrans = `rotate(-180) translate(-${xWindow(w)}, -${yWindow(h)})`;
  cardContainer
    .attr('class', `cardfront-container`)
    .style('transform', card.reversed ? reverseTrans : '');
  // background
  cardContainer.append('div').attr('class', 'cardfront-background');

  cardContainer = cardContainer.append('div').attr('class', 'cardfront-main');
  // label
  cardContainer
    .append('div')
    .attr('class', 'cardfront-label')
    .text(d =>
      card.suit === 'major arcana'
        ? `${toRomanNumeral(d.cardnum)}. ${d.tradname}`
        : card.cardtitle
    );

  middleContent(cardContainer, card, scales);

  // main label
  if (card.suit === 'major arcana') {
    cardContainer
      .append('div')
      .style('height', `${yWindow(h) * 0.2}px`)
      .style('width', `${xWindow(w)}px`)
      .html(() => `<div class="card-title">${card.cardtitle}</div>`);
  }
  //
  // const TOOLTIP_WIDTH = 200;
  // const TOOLTIP_HEIGHT = 100;
  tooltipNode = cardContainer
    // .append('div')
    // .attr('class', 'tooltip-container')
    // .style(
    //   'transform',
    //   `translate(${xWindow(w / 2) - TOOLTIP_WIDTH / 2}, ${yWindow(h) -
    //     TOOLTIP_HEIGHT / 2})`
    // )
    .append('div')
    .attr('class', 'tooltip')
    // .style('height', `${TOOLTIP_HEIGHT}px`)
    // .style('width', `${TOOLTIP_WIDTH}px`)

    .html(`<div><b>${card.cardtitle}</b>: ${card.tip}</div>`);
}

/**
 * Constructs a minor aracana card
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function minorArcana(domNode, card, {xWindow, yWindow}) {
  const {h, w} = getCardHeightWidth();

  domNode
    .append('div')
    .style('height', `${yWindow(h)}`)
    .style('width', `${xWindow(w)}`)
    .attr('class', 'vega-container')
    .append('div')
    .attr('class', 'lds-dual-ring');

  console.log('???', card);
  const spec = CHART_LOOKUP[card.charttype](
    card.dims,
    yWindow(h) * 0.8,
    xWindow(w),
    'per_game_data'
  );
  setTimeout(() => {
    vegaEmbed(`#card-${card.pos} .vega-container`, spec, {actions: false})
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
 */
function majorArcana(domNode, card) {
  domNode
    .append('div')
    .attr('class', 'major-arcana-img-container')
    .append('img')
    .attr('src', `assets/major-arcana-imgs/${card.image}`);
}

/**
 * Inspects the card object to determine what type of card should be rendered and then does that
 *
 * domNode - the dom node that is relevent to the card
 * card - an object containing the cards data
 * scales - an object of the scales for positioning things
 */
function renderAppropriateCard(domNode, card, scales) {
  cardCommon(
    domNode,
    card,
    scales,
    card.suit === 'major arcana' ? majorArcana : minorArcana
  );
}
