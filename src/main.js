// spray additional data into the global name space
let tarotData = {};
let tarotDataLoaded = false;
fetch('./src/tarot-data.json')
  .then(d => d.json())
  .then(d => {
    dataLoaded = true;
    tarotData = d;
  });

function makeScales(svg, labels) {
  const width = parseInt(svg.style('width'));
  const height = parseInt(svg.style('height'));
  const margin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  const xWindow = d3
    .scaleLinear()
    .domain([0, 1.2])
    .range([margin.left, width - margin.left - margin.right]);
  const yWindow = d3
    .scaleLinear()
    .domain([0, 1])
    .range([margin.top, height - margin.bottom - margin.top]);

  const xScale = d3
    .scaleBand()
    .domain(labels)
    .range([0.05, 1 - 0.05])
    .paddingOuter(0.1)
    .paddingInner(0.05);

  return {xScale, xWindow, yWindow};
}

// in our index coordins
function getCardHeightWidth() {
  const size = 0.2;
  let h = size;
  let w = (57.15 / 88.9) * size;
  return {h, w};
}

function drawCardSpaces(svg, cards, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();

  const containers = svg.selectAll('.cardspacecontainer').data(cards);
  const cardContainers = containers
    .enter()
    .append('g')
    .attr('transform', d => {
      return `translate(${xWindow(d.x)}, ${yWindow(d.y)})`;
      // if (!d.rotate) {
      // }
      // return `translate(${xWindow(d.x) + xWindow(w) * 1.5}, ${yWindow(
      //   d.y
      // )})  rotate(90)`;
    })
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

//Card spreads
function oneCard(svg) {
  // basically just the three card with two cards that are never drawn
  const labels = ['Background', 'EXAMPLE', 'Advice'];
  const scales = makeScales(svg, labels);
  return {
    scales,
    positions: [{x: scales.xScale('EXAMPLE'), y: 0.4, label: 'EXAMPLE'}]
  };
}

function threeCard(svg) {
  const labels = ['Background', 'Problem', 'Advice'];
  const scales = makeScales(svg, labels);
  return {
    scales,
    positions: labels.map(label => ({x: scales.xScale(label), y: 0.4, label}))
  };
}

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
  const cardJoin = svg.selectAll('.card').data(cards);
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
      drawCard(this);
      nextCardIdx += 1;
    });

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

function buildLayout(svg, layout, cards) {
  // clear the contents of teh previous layout
  svg.selectAll('*').remove();
  let generatedLayout = null;
  switch (layout) {
    case 'Celtic Cross':
      generatedLayout = celticCross(svg);
      break;
    case 'Three Card':
      generatedLayout = threeCard(svg);
      break;
    case 'One Card':
      generatedLayout = oneCard(svg);
      break;
  }
  const {scales, positions} = generatedLayout;
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

// the main method of the application, all subsequent calls should eminante from here
function mainEntryPoint() {
  const state = {
    layout: null,
    data: null,
    datasetName: null,
    loading: false,
    cards: [...new Array(81)].map((_, idx) => ({pos: idx}))
  };
  const svg = d3.select('#main-container');
  const container = document.querySelector('.main-content');
  const {height, width} = container.getBoundingClientRect();

  function stateUpdate() {
    if (state.layout && state.data) {
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
