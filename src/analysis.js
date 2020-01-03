//Pentacles: outlier strength
// Visualization: histogram with red outlier glyph

//Wands: category variance
// Visualization: bar chart

//Cups: correlation
// Visualization: scatterplot

//Swords: missing data or nulls
// Visualization: histogram with nulls/missing data on the side

/*
Stuff that needs to be in our card objects
suit,
cardtitle: `${value.capitalize()} of ${suit.capitalize()}`,
cardvalue: idx,
tip: `This is the ${value} of ${suit}`,
charttype: CHARTTYPE_MAP[suit],
dims: {
  // xDim will be ignored if not used (e.g. in boxplot)
  xDim: chooseRandom(columnTypes.measure),
  yDim: chooseRandom(columnTypes.measure)
}
*/
var generateAllMinorArcana = function(data){
  const summary = profileFields(data);

  const pentacles = generatePentacles(data, summary);
  const wands = generateWands(data, summary);
  const cups = generateCups(data, summary);
  const swords = generateSwords(data, summary);

  const all = pentacles.concat(wands,cups,swords);
  console.log(all);
  return all;
}


//largest z score difference between values
var outlierStrength = function(data, accessor) {
  //largest z scores
  const stdev = dl.stdev(data, accessor);
  const min = dl.min(data, accessor);
  const max = dl.max(data, accessor);
  const mean = dl.mean(data, accessor);
  return stdev === 0
    ? 0
    : Math.max(Math.abs(min - mean) / stdev, Math.max(max - mean) / stdev);
};

//Ratio of intra-group variance / inter-group variance
var categoryVarianceStrength = function(data, x, y, groupFunc = 'mean') {
  const interSD = dl.stdev(data, y);

  const vals = dl
    .groupby(x)
    .summarize([{name: y, ops: [groupFunc], as: ['val']}])
    .execute(data);

  const intraSD = dl.stdev(vals, 'val');

  return interSD === 0 ? 0 : intraSD / interSD;
};

var profileFields = function(data) {
  const summary = dl.summary(data);
  const types = dl.type.inferAll(data);
  summary.forEach(d => (d.type = types[d.field]));

  return summary;
};

//Build out all of our swords. The more invalid/missing values, the higher position the field takes
var generateSwords = function(data, summary) {
  let swords = [];
  summary.forEach(function(field) {
    let missing = field.count === 0 ? 0 : field.missing;
    missing = field.unique.hasOwnProperty("") ? missing+field.unique[""] : missing;
    const strength = field.count === 0 ? 0 : missing / field.count;
    const swordObj = {suit: "swords", field: field.field, strength: strength};
    swords.push(swordObj);
  });

  //Remove fields with no nulls or missing values
  swords = swords.filter(d => d.strength > 0);

  //Sort in descending order of %missing.
  swords.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  swords = swords.length <= 13 ? swords : swords.filter((d, i) => i <= 12);
  return swords;
};

//Build out all of our pentacles. The more extreme the max/min is in terms of z-scores,
// the higher position the field takes
var generatePentacles = function(data, summary) {
  let pentacles = [];
  summary
    .filter(d => d.type == 'number' || d.type == 'integer')
    .forEach(function(field) {
      const strength = outlierStrength(data, field.field);
      const pentacleObj = {suit: "pentacles", field: field.field, strength: strength};
      pentacles.push(pentacleObj);
    });

  //remove fields with no variation
  pentacles = pentacles.filter(d => d.strength > 0);

  //Sort in descending order of %missing.
  pentacles.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  pentacles =
    pentacles.length <= 13 ? pentacles : pentacles.filter((d, i) => i <= 12);
  return pentacles;
};

//Build out our wands. The higher the variance in bar heights when categorical variables are aggregated,
// the higher position the field takes.
var generateWands = function(data, summary) {
  let wands = [];
  const qs = summary.filter(d => d.type == 'number' || d.type == 'integer');
  //only want nominal fields where there's at least some aggregation to do
  const ns = summary.filter(
    d => (d.type == 'boolean' || d.type == 'string') && d.uniques < d.length
  );

  //could potentially check median, max, min, stdev and so on but let's keep it simple for now.
  const funcs = ['mean', 'count'];

  //this sucks, stylistically.
  // I don't really want to build the correlation matrix though, since we're just grabbing the top n.
  funcs.forEach(function(func) {
    qs.forEach(function(y) {
      ns.forEach(function(x) {
        const strength = categoryVarianceStrength(data, x.field, y.field, func);
        const wandObj = {suit: "wands", x: x.field, y: y.field, func: func, strength: strength};
        wands.push(wandObj);
      });
    });
  });

  //remove fields with no variation
  wands = wands.filter(d => d.strength > 0);

  //Sort in descending order of quasi-F statistic.
  wands.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  wands = wands.length <= 13 ? wands : wands.filter((d, i) => i <= 12);
  return wands;
};

//Build out our cups. The higher the correlation between two fields, the higher the position.
var generateCups = function(data, summary) {
  let cups = [];
  const qs = summary.filter(d => d.type == 'number' || d.type == 'integer');
  qs.forEach(function(x, i) {
    //don't check self-correlation.
    qs.filter((d, j) => i != j).forEach(function(y) {
      const strength = dl.cor(data, x.field, y.field);
      const cupObj = {suit: "cups", x: x.field, y: y.field, strength: strength};
      cups.push(cupObj);
    });
  });

  //remove fields with no correlation, but also fields that are perfectly correlated
  cups = cups.filter(d => d.strength > 0 && isFinite(d.strength) && d.strength < 1);

  //Sort in descending order of quasi-F statistic.
  cups.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  cups = cups.length <= 13 ? cups : cups.filter((d, i) => i <= 12);
  return cups;
};
