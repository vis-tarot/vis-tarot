/**
 * A single place where all of the relevant scales are made
 * returns an object of scales.
 *
 * the xWindow and yWindow scales refer to the full viewing pane, and use index coordinates (e.g. 0 to 1)
 *
 * container - the d3 selection for the full container pane
 * labels - an array of entities (strings, numbers whatever) to determine the behaviour of the band scale
 */
function makeScales(container, labels) {
  const width = parseInt(container.style('width'));
  const height = parseInt(container.style('height'));
  const margin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  const xWindow = d3
    .scaleLinear()
    .domain([0, 1])
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

/**
 * Util method for determining the size in index space of the cards, returns an object
 * scales object that comes from make scales
 */
function getCardHeightWidth(scales) {
  const DESIRED_WIDTH = 175;
  return {
    h: scales.yWindow.invert(DESIRED_WIDTH * (88.9 / 57.15)),
    w: scales.xWindow.invert(DESIRED_WIDTH)
  };
}

/**
 * The dumbest shuffling algo imaginable, returns a randomly shuffled copy of an array
 * arr - an array of anything to shuffle
 */
function shuffle(arr) {
  return arr.sort(() => Math.sign(Math.random() - 0.5));
}

const ROMAN_NUM_LOOKUP = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
  'XXII'
];
/**
 * The dumbest roman numeral generator, just a wrapper to a look up table
 */
function toRomanNumeral(idx) {
  return ROMAN_NUM_LOOKUP[idx];
}

// monkey patchting but was available as copy pasta so whatever
// https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

//moving card shuffling to a general purpose util
function shuffleCards(deck) {
  return shuffle(deck).map((x, idx) => ({
    // eslint appears to not like this line
    ...x,
    pos: idx,
    index: Math.random(),
    // for now reversed is hard to read, so its disabled
    // reversed: Math.random() > 0.5
    reversed: false
  }));
}

// Sampling without replacement
Array.prototype.sample = function(n) {
  return shuffleCards(this).slice(0, n);
};

/**
 * add text to a target query selector
 *
 * queryString - the selector to be queried
 * description - the text to be added
 */
function setDescription(queryString, description) {
  document.querySelector(queryString).innerHTML = description;
}
