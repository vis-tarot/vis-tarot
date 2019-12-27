console.log(faces);
// spray additional data into the global name space
let tarotData = {};
let tarotDataLoaded = false;
fetch('./data/tarot-data.json')
  .then(d => d.json())
  .then(d => {
    dataLoaded = true;
    tarotData = d;
  });

function drawCardSpaces(svg, cards, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();

  const containers = svg.selectAll('.cardspacecontainer').data(cards);
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
      d =>
        d.rotate && `translate(${-xWindow(w) / 2}, ${yWindow(w)}) rotate(-90)`
    )
    .attr('width', xWindow(w))
    .attr('height', yWindow(h))
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
    .attr('transform', d => `translate(${xWindow(0.95)},${yWindow(0.6) - 100})`)
    .attr('width', 200)
    .attr('height', 100)
    .append('xhtml:div')
    .html('Click the deck to draw a card');
}

function drawCard(card) {
  console.log('TODO, ADD MECHANISM FOR DRAWING CARD FRONTS');
}

function drawCards(svg, cards, scales, positions) {
  console.log(cards);
  const {h, w} = getCardHeightWidth();
  const {xWindow, yWindow} = scales;
  let nextCardIdx = 0;
  cards.forEach((card, idx) => {
    card.x = 0.95 + (idx / 81) * 0.03;
    card.y = 0.6 + (idx / 81) * 0.03;
  });
  const t = d3
    .transition()
    .duration(750)
    .ease(d3.easeLinear);
  const cardJoin = svg.selectAll('.card').data(cards, d => `${d.index}`);
  const card = cardJoin
    .enter()
    .append('g')
    .attr('class', 'card')
    .attr('transform', d => `translate(${xWindow(d.x)},${yWindow(d.y)})`)
    .on('click', function(d) {
      const nextCardPos = positions[nextCardIdx];
      if (!nextCardPos) {
        return;
      }
      const cardFront = findAppropriateCard(nextCardPos, d);
      cardFront(this, d, scales);
      d3.select(this)
        .transition(t)
        .attr('transform', d => {
          const xPos = xWindow(nextCardPos.x);
          const yPos = yWindow(nextCardPos.y);
          if (!nextCardPos.rotate) {
            return `translate(${xPos},${yWindow(nextCardPos.y)})`;
          }
          return `translate(${xPos - 0.5 * xWindow(w)},${yPos +
            xWindow(w) * 1.12}) rotate(-90)`;
        });
      nextCardIdx += 1;
    });
  cardJoin.exit().remove();

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

const layoutMethod = {
  'Celtic Cross': celticCross,
  'Three Card': threeCard,
  'One Card': oneCard
};

function buildLayout(svg, layout, cards) {
  // clear the contents of teh previous layout
  svg.selectAll('*').remove();
  const {scales, positions} = layoutMethod[layout](svg);
  drawSidebar(svg, scales);
  drawCardSpaces(svg, positions, scales);
  drawCards(svg, cards, scales, positions);
}

function removePlaceHolder() {
  const placeHolder = document.querySelector('#load-msg');
  if (placeHolder) {
    placeHolder.remove();
  }
}
