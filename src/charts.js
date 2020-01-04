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
    height: height,
    width: 0.9 * width,

    autosize: {
      type: 'fit',
      contains: 'padding'
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
    mark: {type: 'circle', tooltip: true},
    encoding: {
      x: {
        field: xDim,
        type: 'quantitative',
        scale: {zero: false},
        axis: {format: '.2s'}
      },
      y: {
        field: yDim,
        type: 'quantitative',
        scale: {zero: false},
        axis: {format: '.2s'}
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
    mark: 'boxplot',
    encoding: {
      y: {
        field: yDim,
        type: 'quantitative',
        scale: {zero: false},
        axis: {format: '.2s'}
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
      x: {field: xDim, type: 'ordinal'},
      y: {field: yDim, type: 'quantitative', aggregate, axis: {format: '.2s'}}
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
      x: {bin: true, field: xDim, type: 'quantitative'},
      y: {aggregate, type: 'quantitative', axis: {title: false, format: '.2s'}}
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
