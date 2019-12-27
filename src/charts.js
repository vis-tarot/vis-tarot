/**
 * handle the parts that are common to all of the chats
 *
 * height - the height of the chart
 * width - the width of the chart
 * datasetName - the name of the dataset
 */
function vegaliteCommon(height, width, datasetName) {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    // TODO this should also support user uploaded dataset
    data: {url: `data/${datasetName}.csv`},
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
 * datasetName - the name of the dataset
 */
function scatterplot(dimensions, height, width, datasetName) {
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
    ...vegaliteCommon(height, width, datasetName)
  };
}

/**
 * Build a vega-lite boxplot
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * datasetName - the name of the dataset
 */
function boxplot(dimensions, height, width, datasetName) {
  const {yDim, aggregate = 'mean'} = dimensions;
  return {
    mark: 'boxplot',
    encoding: {
      y: {field: yDim, type: 'quantitative'},
      tooltip: {field: yDim, type: 'quantitative', aggregate}
    },
    ...vegaliteCommon(height, width, datasetName)
  };
}

const CHART_LOOKUP = {
  scatterplot,
  boxplot
};
