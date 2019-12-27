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
 * svg - the d3 selection for the full svg pane
 * positions - an array of objects describing the positioning and metadata with the card spaces
 * scales - an object of scales
 */
function drawCardSpaces(svg, positions, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();

  const containers = svg.selectAll('.cardspacecontainer').data(positions);
  const cardContainers = containers
    .enter()
    .append('g')
    .attr('transform', d => `translate(${xWindow(d.x)}, ${yWindow(d.y)})`)
    .attr('class', 'cardcontainer');
  const cardSpace = cardContainers
    .append('g')
    .attr('class', 'cardspacecontainer');

  cardSpace
    .append('rect')
    .attr('class', 'cardspace')
    .attr(
      'transform',
      // TODO this is wrong and doesnt handle the sideways one right
      d =>
        (d.rotate &&
          `translate(${-xWindow(w) / 2}, ${yWindow(w)}) rotate(-90)`) ||
        `translate(${xWindow(w) * 0.05}, ${yWindow(h) * 0.05})`
    )
    .attr('width', xWindow(w) * 0.95)
    .attr('height', yWindow(h) * 0.95)
    .attr('fill', '#333');
  cardSpace
    .append('text')
    .attr('x', xWindow(w / 2))
    .attr('y', yWindow(h / 2))
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  const TOOLTIP_WIDTH = 200;
  const TOOLTIP_HEIGHT = 100;
  const toolTipContainer = cardSpace
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
    .html(d => `<div class="tooltip">${tarotData.layouts[d.label]}</div>`);
}

function drawSidebar(svg, scales) {
  const {xWindow, yWindow} = scales;
  svg
    .append('rect')
    .attr('x', xWindow(0.9))
    .attr('y', yWindow(0))
    .attr('height', yWindow(1))
    .attr('width', xWindow(1.2) - xWindow(0.9))
    .attr('fill', 'lightgray');

  svg
    .append('foreignObject')
    .attr(
      'transform',
      () => `translate(${xWindow(0.95)},${yWindow(0.6) - 100})`
    )
    .attr('width', 200)
    .attr('height', 100)
    .append('xhtml:div')
    .html('Click the deck to draw a card');
}

/**
 * draws the cards themselves, also contains state relevant to how many cards have been drawn
 *
 * svg - the d3 selection for the full svg pane
 * cards - an array of object with each individual card data
 * scales - an object of scales
 * positions - an array of objects describing the positioning and metadata with the card spaces
 */
function drawCards(svg, cards, scales, positions) {
  const {h, w} = getCardHeightWidth();
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
    renderAppropriateCard(this, card, scales);
    d3.select(this)
      .transition(t)
      .attr('transform', () => {
        const xPos = xWindow(nextCardPos.x);
        const yPos = yWindow(nextCardPos.y);
        if (!nextCardPos.rotate) {
          return `translate(${xPos},${yWindow(nextCardPos.y)})`;
        }
        return `translate(${xPos - 0.5 * xWindow(w)},${yPos +
          xWindow(w) * 1.12}) rotate(-90)`;
      });
    nextCardIdx += 1;
  }

  // give the cards initial positioning to make it look like are in a pile
  cards.forEach((card, idx) => {
    card.x = 0.95 + (idx / 81) * 0.03;
    card.y = 0.6 + (idx / 81) * 0.03;
  });

  // our transition for drawing cards
  const t = d3
    .transition()
    .duration(750)
    .ease(d3.easeLinear);

  // the draw code
  const cardJoin = svg.selectAll('.card').data(cards, d => `${d.index}`);
  // card container
  const card = cardJoin
    .enter()
    .append('g')
    .attr('class', 'card')
    .attr('transform', d => `translate(${xWindow(d.x)},${yWindow(d.y)})`)
    .on('click', onCardClick);
  cardJoin.exit().remove();

  // the border of the card
  card
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .attr('stroke', 'black')
    .attr('fill', 'black')
    .attr('rx', 10)
    .attr('rx', 10);
  // the background image on the card
  card
    .append('foreignObject')
    .attr('x', xWindow(h) * 0.02)
    .attr('y', yWindow(h) * 0.02)
    .attr('width', xWindow(w) * 0.94)
    .attr('height', yWindow(h) * 0.96)
    .append('xhtml:div')
    .attr('class', 'cardback-img')
    .append('img')
    .attr('src', './assets/card-back.png');
}

/**
 * The one card layout.
 * Works the same as the three card with two cards that are never drawn
 * svg - the d3 selection for the full svg pane
 */
function oneCard(svg) {
  // TODO select what we want EXAMPLE to be instead
  const labels = ['*', 'EXAMPLE', '*'];
  const scales = makeScales(svg, labels);
  return {
    scales,
    positions: [{x: scales.xScale('EXAMPLE'), y: 0.4, label: 'EXAMPLE'}]
  };
}

/**
 * The three card layout
 * svg - the d3 selection for the full svg pane
 */
function threeCard(svg) {
  const labels = ['Background', 'Problem', 'Advice'];
  const scales = makeScales(svg, labels);
  return {
    scales,
    positions: labels.map(label => ({x: scales.xScale(label), y: 0.4, label}))
  };
}

/**
 * The celtic cross layout
 * svg - the d3 selection for the full svg pane
 */
function celticCross(svg) {
  const positions = [
    {x: 1, y: 1.9, label: 'Challenges', rotate: true},
    {x: 1, y: 1.5, label: 'Present'},
    {x: 2, y: 1.5, label: 'Goal'},
    {x: 1, y: 2.5, label: 'Past'},
    {x: 1, y: 0.5, label: 'Context'},
    {x: 0, y: 1.5, label: 'Future'},
    {x: 3, y: 3, label: 'Querent'},
    {x: 3, y: 2, label: 'Environment'},
    {x: 3, y: 1, label: 'Mind'},
    {x: 3, y: 0, label: 'Outcome'}
  ];
  const scales = makeScales(svg, [0, 1, 2, 3]);
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
 * svg - the d3 selection for the full svg pane
 * layout - a string specifying the layout
 * cards - an array of object with each individual card data
 */
function buildLayout(svg, layout, cards) {
  // clear the contents of teh previous layout
  svg.selectAll('*').remove();
  const {scales, positions} = layoutMethod[layout](svg);
  drawSidebar(svg, scales);
  drawCardSpaces(svg, positions, scales);
  drawCards(svg, cards, scales, positions);
}
