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

var generateAllMinorArcana = function(data) {
  values.reverse();
  const summary = profileFields(data);
  const pentacles = generatePentacles(data, summary);
  const wands = generateWands(data, summary);
  const cups = generateCups(data, summary);
  const swords = generateSwords(data, summary);

  const all = pentacles.concat(wands, cups, swords);
  console.log(all);
  return all;
};

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

//Variance of bar charts
var categoryVarianceStrength = function(data, x, y, groupFunc = 'mean') {

  const vals = dl
    .groupby(x)
    .summarize([{name: y, ops: [groupFunc], as: ['val']}])
    .execute(data);

  //Normalize values so fields with bigger numbers have bigger strengths.
  const range = dl.max(vals, 'val');
  vals.forEach(function(d){
    d.val/= range;
  });

  const barVar = dl.variance(vals, 'val');

  return barVar === 0 ? 0 : barVar;
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
    missing = field.unique.hasOwnProperty('')
      ? missing + field.unique['']
      : missing;
    const strength = field.count === 0 ? 0 : missing / field.count;
    const swordObj = {
      suit: 'swords',
      xDim: field.field,
      yDim: field.field,
      strength: strength,
      charttype: 'histogram',
      tip: 'This field has data quality issues.'
    };
    swords.push(swordObj);
  });

  //Remove fields with no nulls or missing values
  swords = swords.filter(d => d.strength > 0);

  //Sort in descending order of %missing.
  swords.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  swords = swords.length <= 14 ? swords : swords.filter((d, i) => i <= 13);
  swords.forEach(function(d, i) {
    const value = values[i];
    const suit = d.suit;
    d.cardtitle = `${value.capitalize()} of ${suit.capitalize()}`;
    d.cardvalue = value;
  });
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
      const pentacleObj = {
        suit: 'pentacles',
        xDim: field.field,
        yDim: field.field,
        charttype: 'boxplot',
        strength: strength,
        tip: 'There is at least one extreme value in this field.'
      };
      pentacles.push(pentacleObj);
    });

  //remove fields with no variation
  pentacles = pentacles.filter(d => d.strength > 0);

  //Sort in descending order of %missing.
  pentacles.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  pentacles =
    pentacles.length <= 14 ? pentacles : pentacles.filter((d, i) => i <= 13);
  pentacles.forEach(function(d, i) {
    const value = values[i];
    const suit = d.suit;
    d.cardtitle = `${value.capitalize()} of ${suit.capitalize()}`;
    d.cardvalue = value;
  });
  return pentacles;
};

//Build out our wands. The higher the variance in bar heights when categorical variables are aggregated,
// the higher position the field takes.
var generateWands = function(data, summary) {
  let wands = [];
  const qs = summary.filter(d => d.type == 'number' || d.type == 'integer');
  //only want nominal fields where there's at least some aggregation to do
  const ns = summary.filter(
    d =>
      (d.type == 'boolean' || d.type == 'string' || d.distinct == 2) &&
      d.distinct < d.count
  );

  //could potentially check median, max, min, stdev and so on but let's keep it simple for now.
  const funcs = ['mean', 'count'];

  //this sucks, stylistically.
  // I don't really want to build the correlation matrix though, since we're just grabbing the top n.
  funcs.forEach(function(func) {
    qs.forEach(function(y) {
      ns.forEach(function(x) {
        const strength = categoryVarianceStrength(data, x.field, y.field, func);
        const wandObj = {
          suit: 'wands',
          xDim: x.field,
          yDim: y.field,
          charttype: 'barchart',
          func: func,
          strength: strength,
          tip: 'There is high variably in values in these fields'
        };
        wands.push(wandObj);
      });
    });
  });

  //remove fields with no variation
  wands = wands.filter(d => d.strength > 0);

  //Sort in descending order of quasi-F statistic.
  wands.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  wands = wands.length <= 14 ? wands : wands.filter((d, i) => i <= 13);
  wands.forEach(function(d, i) {
    const value = values[i];
    const suit = d.suit;
    d.cardtitle = `${value.capitalize()} of ${suit.capitalize()}`;
    d.cardvalue = value;
  });
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
      const cupObj = {
        suit: 'cups',
        xDim: x.field,
        yDim: y.field,
        charttype: 'scatterplot',
        strength: strength,
        tip: 'These fields are highly correlated.'
      };
      cups.push(cupObj);
    });
  });

  //remove fields with no correlation, but also fields that are perfectly correlated
  cups = cups.filter(
    d => d.strength > 0 && isFinite(d.strength) && d.strength < 1
  );

  //Sort in descending order of quasi-F statistic.
  cups.sort(dl.comparator('-strength'));

  //Only return the top 13, since that's all the slots we have
  cups = cups.length <= 14 ? cups : cups.filter((d, i) => i <= 13);
  cups.forEach(function(d, i) {
    const value = values[i];
    const suit = d.suit;
    d.cardtitle = `${value.capitalize()} of ${suit.capitalize()}`;
    d.cardvalue = value;
  });
  return cups;
};
