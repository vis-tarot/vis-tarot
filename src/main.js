// load in the major arcana data, make it available in the global name space
let majorArcanaData = null;
let majorArcanaLoaded = false;
fetch('./data/major_arcana.json')
  .then(d => d.json())
  .then(d => {
    majorArcanaData = d;
    majorArcanaLoaded = true;
  });

/**
 * Compute the cards in the deck
 *
 * data - the the data be analyzed by the system
 */
function computeCards(data) {
  // TODO add the minor arcana content
  return shuffle(majorArcanaData).map((x, idx) => ({
    // eslint appears to not like this line
    ...x,
    pos: idx,
    index: Math.random(),
    // for now reversed is hard to read, so its disabled
    // reversed: Math.random() > 0.5
    reversed: false
  }));
}

/**
 * add text to a target query selector
 *
 * queryString - the selector to be queried
 * description - the text to be added
 */
function setDescription(queryString, description) {
  document.querySelector(queryString).innerHTML = description;
}

/**
 * the main method of the application, all subsequent calls should eminante from here
 */
function main() {
  // the state container
  const state = {
    layout: null,
    data: null,
    datasetName: null,
    loading: false,
    cards: []
  };

  // initialize everything
  const svg = d3.select('#main-container');
  const container = document.querySelector('.main-content');
  const {height, width} = container.getBoundingClientRect();

  // update the state of the system based on changed inputs
  function stateUpdate() {
    // if layout and data aren't specified don't do anything
    if (!(state.layout && state.data)) {
      return;
    }
    // compute the cards
    state.cards = computeCards(state.data);

    // remove the placeholder content
    const placeHolder = document.querySelector('#load-msg');
    if (placeHolder) {
      placeHolder.remove();
    }

    // size the svg correctly
    svg.attr('height', height).attr('width', width);

    // draw the layout
    buildLayout(svg, state.layout, state.cards);
  }

  // listener for the layout selector
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

  // listener for the data selector
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

  // TODO add listeners that allow user to upload a file here
}

// start the application after the content has loaded
document.addEventListener('DOMContentLoaded', main);
