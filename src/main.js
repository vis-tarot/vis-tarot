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

function addCardSpace(svg, label, x, y, height) {
  x = !x ? 0 : x;
  y = !y ? 0 : y;

  const size = 0.9 * height;
  let h = size;
  let w = (57.15 / 88.9) * size;

  var cardSpace = svg.append('g');

  cardSpace
    .append('rect')
    .attr('class', 'cardspace')
    .attr('x', x)
    .attr('y', y)
    .attr('width', w)
    .attr('height', h)
    .attr('fill', '#333');

  cardSpace
    .append('text')
    .attr('x', x + w / 2)
    .attr('y', y + h / 2)
    .attr('text-anchor', 'middle')
    .text(label);

  return cardSpace;
}

//Card spreads

//three card spread:
function threeCard(svg) {
  var labels = ['Background', 'Problem', 'Advice'];

  var svgWidth = parseInt(svg.style('width'));
  var svgHeight = parseInt(svg.style('height'));

  var offset = 5;

  var xScale = d3
    .scaleBand()
    .domain(labels)
    .range([offset, svgWidth - offset])
    .paddingOuter(0.1)
    .paddingInner(0.05);

  var cWidth = xScale.bandwidth();

  labels.forEach(function(d) {
    addCardSpace(svg, d, xScale(d), offset, cWidth);
  });
}

//celtic cross spread:
function celticCross(svg) {
  //Note that we're omitting the "covers"/"challenges"/"context" card here, since we need to treat it separately
  var labels = [
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
  var positions = [
    [1, 1.5],
    [2, 1.5],
    [1, 2.5],
    [1, 0.5],
    [0, 1.5],
    [3, 3],
    [3, 2],
    [3, 1],
    [3, 0]
  ];

  var svgWidth = parseInt(svg.style('width'));
  var svgHeight = parseInt(svg.style('height'));

  var offset = 5;

  var xScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3])
    .range([offset, svgWidth - offset])
    .paddingOuter(0.1)
    .paddingInner(0.05);

  var cWidth = xScale.bandwidth();

  var cHeight = (88.9 / 57.15) * cWidth;

  labels.forEach(function(d, i) {
    addCardSpace(
      svg,
      d,
      xScale(positions[i][0]),
      offset + cHeight * positions[i][1],
      cWidth
    );
  });

  //Deal with the rotated card that "Covers" the question
  var cover = addCardSpace(svg, 'Challenges', 0, 0, cWidth);
  let coverX = xScale(1) + cHeight / 2;
  let coverY = offset + cHeight * 1.25;
  cover.attr('transform', `translate(${coverX},${coverY}) rotate(90)`);

  //I need to do some math to figure out where this text should actually go.
  cover
    .select('text')
    .attr(
      'transform',
      `rotate(-90) translate(-${cHeight * 0.5},-${cWidth * 0.25})`
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
    case 'Three Card':
      threeCard(svg);
    case 'One Card':
      console.log('TODO!');
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

  const listener = key => ({target: value}) => {
    state[key] = value;
    stateUpdate();
    if (key === 'datasetName') {
      state.loading = true;
      d3.csv(`data/${state[key]}`).then(d => {
        state.loading = true;
        state.data = d;
        stateUpdate();
      });
    }
  };

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
