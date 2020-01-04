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
  // holds on to processed data so that if the user switches layouts we don't need to reprocess
  const computationCache = {};

  // initialize everything
  const mainContainer = d3.select('#main-container');
  const container = document.querySelector('.main-content');

  // update the state of the system based on changed inputs
  const stateUpdate = () =>
    new Promise(resolve => {
      // if layout and data aren't specified don't do anything
      if (!(state.layout && state.data)) {
        return;
      }
      d3.select('#load-msg').text('PROCESSING');
      // compute the cards
      // HACK: settime out allows the message alteration step to finish,
      // TODO: computation should happen in a worker
      setTimeout(() => {
        // if the computation has been cached, dont do it!
        if (computationCache[state.datasetName]) {
          resolve(computationCache[state.datasetName]);
          return;
        }
        // otherwise do the computation
        resolve(computeCards(state.data));
      }, 100);
    }).then(cards => {
      computationCache[state.datasetName] = cards;
      state.cards = cards;

      // remove the placeholder content
      const placeHolder = document.querySelector('#load-msg');
      if (placeHolder) {
        placeHolder.remove();
      }

      // size the mainContainer correctly
      const {height, width} = container.getBoundingClientRect();
      mainContainer.style('height', `${height}px`);
      mainContainer.style('width', `${width}px`);

      // draw the layout
      buildLayout(mainContainer, state.layout, state.cards, state.data);
    });
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
      state.datasetName = datasetName;
      // update the chosen name
      state.loading = true;

      // start loading the data
      d3.csv(`data/${datasetName}`).then(d => {
        state.loading = true;
        state.data = d;
        stateUpdate();
      });
      stateUpdate();
    });

  // listener for reset
  document
    .querySelector('#reset-button')
    .addEventListener('click', stateUpdate);

  // listener for data upload
  document.querySelector('#upload-file').addEventListener('change', event => {
    const file = event.target.files[0];
    state.datasetName = file.name;
    const reader = new FileReader();
    reader.onload = event => {
      const output = d3.csvParse(event.target.result);
      state.loading = true;
      state.data = output;
      stateUpdate();
    };

    reader.readAsText(file);
  });
  window.onresize = stateUpdate;
}

// start the application after the content has loaded
document.addEventListener('DOMContentLoaded', main);
