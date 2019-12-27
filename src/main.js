let majorArcanaData = null;
let majorArcanaLoaded = false;
fetch('./data/major_arcana.json')
  .then(d => d.json())
  .then(d => {
    majorArcanaData = d;
    majorArcanaLoaded = true;
  });

function computeCards(data) {
  return shuffle(majorArcanaData).map((x, idx) => ({
    // eslint-disable-line
    ...x,
    pos: idx,
    index: Math.random(),
    // for now reversed is hard to read, so its disabled
    // reversed: Math.random() > 0.5
    reversed: false
  }));
}

function setDescription(id, description) {
  document.querySelector(id).innerHTML = description;
}

// the main method of the application, all subsequent calls should eminante from here
function main() {
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
      state.cards = computeCards(state.data);
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

document.addEventListener('DOMContentLoaded', main);
