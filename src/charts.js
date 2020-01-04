/**
 * handle the parts that are common to all of the chats
 *
 * height - the height of the chart
 * width - the width of the chart
 * dataset - the dataset
 */
function vegaliteCommon(height, width, dataset) {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    data: {values: dataset},
    height: 0.9 * height,
    width: 0.9 * width,

    autosize: {
      type: 'fit',
      contains: 'padding'
    },
    padding: {
      left: 0,
      right: 0
    }
  };
}

/**
 * Build a vega-lite scatterplot
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * dataset - the dataset
 */
function scatterplot(dimensions, height, width, dataset) {
  const {xDim, yDim} = dimensions;
  return {
    mark: {type: 'circle', tooltip: true, stroke: '#333', opacity: 0.6},
    encoding: {
      x: {
        field: xDim,
        type: 'quantitative',
        scale: {zero: false},
        axis: {format: '.2s', title: null}
      },
      y: {
        field: yDim,
        type: 'quantitative',
        scale: {zero: false},
        axis: {format: '.2s', title: null}
      }
    },
    ...vegaliteCommon(height, width, dataset)
  };
}

/**
 * Build a vega-lite boxplot
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * dataset - the dataset
 */
function boxplot(dimensions, height, width, dataset) {
  const {yDim, aggregate = 'mean'} = dimensions;
  return {
    mark: {
      type: 'boxplot',
      outliers: {
        stroke: '#D62728'
      }
    },
    encoding: {
      y: {
        field: yDim,
        type: 'quantitative',
        scale: {zero: false},
        axis: {format: '.2s', title: null}
      },
      tooltip: {field: yDim, type: 'quantitative', aggregate}
    },
    ...vegaliteCommon(height, width, dataset)
  };
}

/**
 * Build a vega-lite barchart
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * dataset - the dataset
 */
function barchart(dimensions, height, width, dataset) {
  const {xDim, yDim, aggregate = 'mean'} = dimensions;
  return {
    mark: {type: 'rect', tooltip: true},
    encoding: {
      x: {field: xDim, type: 'ordinal', axis: {title: null}},
      y: {
        field: yDim,
        type: 'quantitative',
        aggregate,
        axis: {format: '.2s', title: null}
      }
    },

    ...vegaliteCommon(height, width, dataset)
  };
}

/**
 * Build a vega-lite histogram
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * dataset - the dataset
 */
function histogram(dimensions, height, width, dataset) {
  const {xDim, aggregate = 'count'} = dimensions;
  return {
    mark: {type: 'rect', tooltip: true},
    encoding: {
      x: {bin: true, field: xDim, type: 'quantitative', axis: {title: null}},
      y: {aggregate, type: 'quantitative', axis: {title: null, format: '.2s'}}
    },

    ...vegaliteCommon(height, width, dataset)
  };
}

const CHART_LOOKUP = {
  scatterplot,
  boxplot,
  barchart,
  histogram
};

const VEGA_CONFIG = {
  arc: {fill: '#333'},
  area: {fill: '#333'},
  axis: {
    domainColor: '#cbcbcb',
    grid: true,
    gridColor: '#cbcbcb',
    gridWidth: 0,
    labelColor: '#999',
    labelFontSize: 10,
    labelFont: 'Futura',
    titleColor: '#333',
    tickColor: '#cbcbcb',
    tickSize: 5,
    titleFont: 'Futura',
    titleFontSize: 14,
    titlePadding: 0,
    labelPadding: 0
  },
  axisBand: {grid: false},
  background: '#fff',
  group: {fill: '#333'},
  legend: {
    labelColor: '#333',
    labelFontSize: 11,
    padding: 1,
    symbolSize: 30,
    symbolType: 'square',
    titleColor: '#333',
    titleFontSize: 14,
    titlePadding: 10
  },
  line: {stroke: '#333', strokeWidth: 2},
  path: {stroke: '#333', strokeWidth: 0.5},
  rect: {fill: '#333'},
  shape: {stroke: '#333'},
  style: {bar: {binSpacing: 2, fill: '#333', stroke: null}},
  title: {anchor: 'start', fontSize: 24, fontWeight: 600, offset: 20}
};
