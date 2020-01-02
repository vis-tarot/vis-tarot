//Pentacles: outlier strength
// Visualization: histogram with red outlier glyph

//Wands: non-normality
// Visualization: histogram

//Cups: correlation
// Visualization: scatterplot

//Swords: missing data or nulls
// Visualization: histogram with nulls/missing data on the side



//largest z score difference between values
var outlierStrength = function(data,accessor){
  //largest z scores
  const stdev = dl.stdev(data,accessor);
  const min = dl.min(data,accessor);
  const max = dl.max(data,accessor);
  const mean = dl.mean(data,accessor);
  return stdev===0 ? 0 : Math.max(Math.abs(min-mean)/stdev,Math.max(max-mean)/stdev);
}

//

var profileFields = function(data){
  const summary = dl.summary(data);
  const types = dl.type.inferAll(data);
  summary.forEach(d => d.type = types[d.field]);
  //returns array of summaries
  //field
  //unique
  //count
  //valid
  //missing
  //distinct
  //min
  //max
  //mean
  //stdev
  //median
  //q1
  //q3
  //modeskew
}
