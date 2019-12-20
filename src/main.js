function makeScales(svg, labels) {
  const width = parseInt(svg.style('width'));
  const height = parseInt(svg.style('height'));
  const xWindow = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, width]);
  const yWindow = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, height]);

  const xScale = d3
    .scaleBand()
    .domain(labels)
    .range([0.05, 1 - 0.05])
    .paddingOuter(0.1)
    .paddingInner(0.05);

  return {xScale, xWindow, yWindow};
}

function makeCard(svg, x, y, height) {
  x = !x ? 0 : x;
  y = !y ? 0 : y;

  let h = size;
  let w = (57.15 / 88.9) * height;

  let numCards = d3.selectAll('.card').size();

  svg
    .append('clipPath')
    .attr('id', 'card-clip' + numCards)
    .append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', w)
    .attr('height', h)
    .attr('rx', w / 20)
    .attr('rx', w / 20);

  var card = svg
    .append('g')
    .attr('clip-path', 'url(#card-clip' + numCards + ')');

  card
    .append('rect')
    .attr('class', 'card')
    .attr('x', x)
    .attr('y', y)
    .attr('width', w)
    .attr('height', h)
    .attr('fill', '#333');

  return card;
}

function addCardSpace(svg, label, x, y, height, scales) {
  const {xWindow, yWindow} = scales;
  // x = !x ? 0 : x;
  // y = !y ? 0 : y;
  const size = 0.3;
  let h = size;
  let w = (57.15 / 88.9) * size;

  var cardSpace = svg
    .append('g')
    .attr('transform', `translate(${xWindow(x)}, ${yWindow(y)})`)
    .attr('class', 'cardcontainer');

  cardSpace
    .append('rect')
    .attr('class', 'cardspace')
    .attr('width', xWindow(w))
    .attr('height', yWindow(h))
    .attr('fill', '#333');

  cardSpace
    .append('text')
    .attr('x', xWindow(w / 2))
    .attr('y', yWindow(h / 2))
    .attr('text-anchor', 'middle')
    .text(label);

  const TOOLTIP_WIDTH = 200;
  const TOOLTIP_HEIGHT = 200;
  const tooltipContainer = cardSpace
    .append('g')
    .attr('class', 'tooltip-container')
    .attr(
      'transform',
      `translate(${xWindow(w / 2) - TOOLTIP_WIDTH / 2}, ${yWindow(h) -
        TOOLTIP_HEIGHT / 2})`
    );

  const tooltipMsgContainer = tooltipContainer
    .append('foreignObject')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', TOOLTIP_HEIGHT)
    .attr('width', TOOLTIP_WIDTH);

  const exampleMsg =
    'COOL EXAMPLE MESSAGE JUST FOR THIS CARD WOW!! COOL EXAMPLE MESSAGE JUST FOR THIS CARD WOW!! COOL EXAMPLE MESSAGE JUST FOR THIS CARD WOW!!';
  tooltipMsgContainer.html(`<div class="tooltip">${exampleMsg}</div>`);

  return cardSpace;
}

//Card spreads
function oneCard(svg) {
  var labels = ['Background', 'EXAMPLE', 'Advice'];
  const scales = makeScales(svg, labels);
  const cWidth = scales.xScale.bandwidth();
  addCardSpace(svg, 'EXAMPLE', scales.xScale('EXAMPLE'), 0.05, cWidth, scales);
}

function threeCard(svg) {
  var labels = ['Background', 'Problem', 'Advice'];
  const scales = makeScales(svg, labels);
  const cWidth = scales.xScale.bandwidth();
  labels.forEach(label =>
    addCardSpace(svg, label, scales.xScale(label), 0.05, cWidth, scales)
  );
}

// Note that we're omitting the "covers"/"challenges"/"context" card here,
// since we need to treat it separately
const labels = [
  'Present',
  'Goal',
  'Past',
  'Context',
  'Future',
  'Querent',
  'Environment',
  'Mind',
  'Outcome'
];
const positions = [
  [1, 1.5],
  [2, 1.5],
  [1, 2.5],
  [1, 0.5],
  [0, 1.5],
  [3, 3],
  [3, 2],
  [3, 1],
  [3, 0]
].map(([x, y], i) => [x, y, labels[i]]);
//celtic cross spread:
function celticCross(svg) {
  const scales = makeScales(svg, [0, 1, 2, 3]);
  const {yWindow, xWindow, xScale} = scales;
  const cWidth = xScale.bandwidth();
  const cHeight = (88.9 / 57.15) * cWidth;

  positions.forEach(([x, y, label]) => {
    addCardSpace(
      svg,
      label,
      scales.xScale(x),
      0.05 + cHeight * y,
      cWidth,
      scales
    );
  });

  //Deal with the rotated card that "Covers" the question
  const cover = addCardSpace(svg, 'Challenges', 0, 0, cWidth, scales);
  const coverX = xScale(1) + cHeight / 2;
  const coverY = 0.05 + cHeight * 1.25;
  cover.attr(
    'transform',
    `translate(${xWindow(coverX)},${scales.yWindow(coverY)}) rotate(90)`
  );

  // TODO I need to do some math to figure out where this text should actually go.
  // TODO i'm not sure how to do this responsively.
  cover
    .select('text')
    .attr(
      'transform',
      `rotate(-90) translate(-${xWindow(cHeight * 0.5)},-${yWindow(
        cWidth * 0.25
      )})`
    );
}

function computeCards(data) {
  return [];
}

function buildLayout(svg, layout) {
  // clear the contents of teh previous layout
  svg.selectAll('*').remove();
  switch (layout) {
    case 'Celtic Cross':
      celticCross(svg);
      return;
    case 'Three Card':
      threeCard(svg);
      return;
    case 'One Card':
      oneCard(svg);
      return;
  }
}

function removePlaceHolder() {
  const placeHolder = document.querySelector('#load-msg');
  if (placeHolder) {
    placeHolder.remove();
  }
}

// the main method of the application, all subsequent calls should eminante from here
function mainEntryPoint() {
  const state = {
    layout: null,
    data: null,
    datasetName: null,
    loading: false,
    cards: []
  };
  const svg = d3.select('#main-container');
  const container = document.querySelector('.main-content');
  const {height, width} = container.getBoundingClientRect();

  function stateUpdate() {
    if (state.layout && state.data) {
      removePlaceHolder();
      svg.attr('height', height).attr('width', width);
      buildLayout(svg, state.layout);
      state.cards = computeCards([]);
    }
  }

  document
    .querySelector('#layout-selector')
    .addEventListener('change', event => {
      state.layout = event.target.value;
      stateUpdate();
    });
  document
    .querySelector('#dataset-selector')
    .addEventListener('change', event => {
      const datasetName = event.target.value;
      // update the chosen name
      state.datasetName = datasetName;
      state.loading = true;
      stateUpdate();
      // start loading the data
      d3.csv(`data/${datasetName}`).then(d => {
        state.loading = true;
        state.data = d;
        // TODO also do the data processing here
        stateUpdate();
      });
    });
}

document.addEventListener('DOMContentLoaded', mainEntryPoint);
