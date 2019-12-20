console.log(faces);
// spray additional data into the global name space
let tarotData = {};
let tarotDataLoaded = false;
fetch('./src/tarot-data.json')
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
      const nextCard = positions[nextCardIdx];
      if (!nextCard) {
        return;
      }
      const cardFront = findAppropriateCard(nextCard);
      cardFront(this, d, scales);
      d3.select(this)
        .transition(t)
        .attr('transform', d => {
          const xPos = xWindow(nextCard.x);
          const yPos = yWindow(nextCard.y);
          if (!nextCard.rotate) {
            return `translate(${xPos},${yWindow(nextCard.y)})`;
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

function computeCards(data) {
  return [];
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

function setDescription(id, description) {
  document.querySelector(id).innerHTML = description;
}

function makeFakeCards() {
  return [...new Array(81)].map((_, idx) => ({
    pos: idx,
    index: Math.random()
  }));
}

// the main method of the application, all subsequent calls should eminante from here
function mainEntryPoint() {
  const state = {
    layout: null,
    data: null,
    datasetName: null,
    loading: false,
    cards: makeFakeCards()
  };
  const svg = d3.select('#main-container');
  const container = document.querySelector('.main-content');
  const {height, width} = container.getBoundingClientRect();

  function stateUpdate() {
    if (state.layout && state.data) {
      state.cards = makeFakeCards();
      removePlaceHolder();
      svg.attr('height', height).attr('width', width);
      buildLayout(svg, state.layout, state.cards);
      state.cards = computeCards([]);
    }
  }

  document
    .querySelector('#layout-selector')
    .addEventListener('change', event => {
      state.layout = event.target.value;
      // update the description text
      setDescription(
        '#layout-description',
        tarotData.layoutAnnotations[state.layout]
      );

      stateUpdate();
    });
  document
    .querySelector('#dataset-selector')
    .addEventListener('change', event => {
      const datasetName = event.target.value;
      // update the chosen name
      state.datasetName = datasetName;
      state.loading = true;

      // start loading the data
      d3.csv(`data/${datasetName}`).then(d => {
        state.loading = true;
        state.data = d;
        // TODO also do the data processing here
        stateUpdate();
      });

      // update the description text
      setDescription(
        '#dataset-description',
        tarotData.datasetAnnotations[state.datasetName]
      );
      stateUpdate();
    });
}

document.addEventListener('DOMContentLoaded', mainEntryPoint);
