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
    // TODO this should also support user uploaded dataset
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
        scale: {zero: false}
      },
      y: {
        field: yDim,
        type: 'quantitative',
        scale: {zero: false}
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
      y: {field: yDim, type: 'quantitative'},
      tooltip: {field: yDim, type: 'quantitative', aggregate}
    },
    ...vegaliteCommon(height, width, dataset)
  };
}

const CHART_LOOKUP = {
  scatterplot,
  boxplot
};
