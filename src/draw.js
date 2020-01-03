// spray additional data into the global name space
let tarotData = {};
let tarotDataLoaded = false;
fetch('./data/tarot-data.json')
  .then(d => d.json())
  .then(d => {
    dataLoaded = true;
    tarotData = d;
  });

/**
 * draws the empty card spaces, including the tooltips
 *
 * container - the d3 selection for the full container pane
 * positions - an array of objects describing the positioning and metadata with the card spaces
 * scales - an object of scales
 */
function drawCardSpaces(container, positions, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth(scales);

  const containers = container.selectAll('.cardspacecontainer').data(positions);
  const cardContainers = containers
    .enter()
    .append('div')
    .style('transform', d => `translate(${xWindow(d.x)}px, ${yWindow(d.y)}px)`)
    .attr('class', 'cardcontainer')
    .on('mousemove', function tooltiper(d) {
      const event = d3.event;
      const xPos = event.layerX;
      const yPos = event.layerY;
      d3.select('#tooltip')
        .style('display', 'block')
        .style('left', `${xPos}px`)
        .style('top', `${yPos}px`)
        .text(tarotData.layouts[d.label] || 'TODO: TOOLTIP FILL IN');
    })
    .on('mouseout', function untip() {
      d3.select('#tooltip').style('display', 'none');
    });
  const cardSpace = cardContainers
    .append('div')
    .attr('class', 'cardspacecontainer');

  // outline
  cardSpace
    .append('div')
    .attr('class', 'cardspace')
    .style('transform', d => d.rotate && 'rotate(-90deg)')
    .style('width', `${xWindow(w) * 0.95}px`)
    .style('height', `${yWindow(h) * 0.95}px`);

  // title
  cardSpace
    .append('div')
    .attr('class', 'cardspace-title')
    .text(d => d.label);
}

/**
 * draws the cards themselves, also contains state relevant to how many cards have been drawn
 *
 * container - the d3 selection for the full container pane
 * cards - an array of object with each individual card data
 * scales - an object of scales
 * positions - an array of objects describing the positioning and metadata with the card spaces
 * dataset - array of objects
 */
function drawCards(container, positions, scales, cards, dataset) {
  const {h, w} = getCardHeightWidth(scales);
  const {xWindow, yWindow} = scales;
  // stateful incrementer of how deep into the draw we are, as the user draws more cards we increment this idx
  let nextCardIdx = 0;
  // the function governing the interaction with the card
  // card - an object describing a card
  function onCardClick(card) {
    const nextCardPos = positions[nextCardIdx];
    if (!nextCardPos) {
      return;
    }
    renderAppropriateCard(this, card, scales, dataset);
    d3.select(this)
      .transition(t)
      .style('left', null)
      .style('bottom', null)
      .style('transform', () => {
        const xPos = xWindow(nextCardPos.x);
        const yPos = yWindow(nextCardPos.y);
        const rotate = nextCardPos.rotate ? 90 : 0;
        return `translate(${xPos}px,${yPos}px) rotate(-${rotate}deg)`;
      });
    nextCardIdx += 1;
  }

  // give the cards initial positioning to make it look like are in a pile
  cards.forEach((card, idx) => {
    card.x = idx;
    card.y = idx;
  });

  // our transition for drawing cards
  const t = d3
    .transition()
    .duration(750)
    .ease(d3.easeLinear);

  // the draw code
  const cardJoin = container.selectAll('.card').data(cards, d => `${d.index}`);
  // card container
  const card = cardJoin
    .enter()
    .append('div')
    .attr('class', 'card')
    .style('left', '-275px')
    .style('bottom', '10%')
    .style('transform', d => `translate(${d.x}px,${d.y}px)`)
    .on('click', onCardClick);
  cardJoin.exit().remove();

  card
    .append('div')
    .attr('class', 'card-back')
    .style('height', `${yWindow(h)}px`)
    .style('width', `${xWindow(w)}px`)
    .append('img')
    .attr('src', './assets/card-back.png');
}

/**
 * The one card layout.
 * Works the same as the three card with two cards that are never drawn
 * container - the d3 selection for the full container pane
 */
function oneCard(container) {
  // TODO select what we want EXAMPLE to be instead
  const labels = ['*', 'EXAMPLE', '*'];
  const scales = makeScales(container, labels);
  return {
    scales,
    positions: [labels[1]].map(label => ({
      x: scales.xScale(label),
      y: 0.4,
      label
    }))
  };
}

/**
 * The three card layout
 * container - the d3 selection for the full container pane
 */
function threeCard(container) {
  const labels = ['Background', 'Problem', 'Advice'];
  const scales = makeScales(container, labels);
  return {
    scales,
    positions: labels.map(label => ({x: scales.xScale(label), y: 0.4, label}))
  };
}

/**
 * The celtic cross layout
 * container - the d3 selection for the full container pane
 */
function celticCross(container) {
  const positions = [
    {x: 1, y: 1.5, label: 'Present'},
    {x: 1, y: 1.9, label: 'Challenges', rotate: true},
    {x: 2, y: 1.5, label: 'Goal'},
    {x: 1, y: 2.5, label: 'Past'},
    {x: 1, y: 0.5, label: 'Context'},
    {x: 0, y: 1.5, label: 'Future'},
    {x: 3, y: 3, label: 'Influence'},
    {x: 3, y: 2, label: 'Environment'},
    {x: 3, y: 1, label: 'Mind'},
    {x: 3, y: 0, label: 'Outcome'}
  ];
  const scales = makeScales(container, [0, 1, 2, 3]);
  return {
    scales,
    positions: positions.map(({x, y, label, rotate}) => ({
      x: scales.xScale(x),
      y: y / 4,
      label,
      rotate
    }))
  };
}

const layoutMethod = {
  'Celtic Cross': celticCross,
  'Three Card': threeCard,
  'One Card': oneCard
};

/**
 * The main drawing step. Clears out previous content, identifies the relevant layout
 * draws everything
 *
 * container - the d3 selection for the full container pane
 * layout - a string specifying the layout
 * cards - an array of object with each individual card data
 * dataset - array of objects
 */
function buildLayout(container, layout, cards, dataset) {
  // clear the contents of teh previous layout
  container.selectAll('*').remove();
  const {scales, positions} = layoutMethod[layout](container);
  drawCardSpaces(container, positions, scales);

  //shuffle cards
  if (layout == 'One Card') {
    deck = shuffleCards(cards.minor);
  } else {
    // sub-sample the major arcana so that it mathces
    // number of possible minor arcana cards
    const samp_size =
      cards.major.length > cards.minor.length
        ? cards.minor.length
        : cards.major.length;
    const majorSubSample = cards.major.sample(samp_size); //
    deck = shuffleCards(majorSubSample.concat(cards.minor));
  }
  drawCards(container, positions, scales, deck, dataset);
}
