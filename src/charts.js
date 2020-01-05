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
    mark: {
      type: 'circle',
      tooltip: true,
      stroke: '#333',
      opacity: 0.6,
      fill: null
    },
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
 * Build a vega histogram
 *
 * dimensions - object containing the necessary configuration to specify the chart
 * height - the height of the chart
 * width - the width of the chart
 * dataset - the dataset
 */
function histogram(dimensions, height, width, dataset) {
  const {xDim} = dimensions;
  return {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    height: 0.9 * height,
    width: width - 10,
    // padding: 5,
    autosize: {type: 'fit', resize: true},

    signals: [
      {name: 'maxbins', value: 6},
      {name: 'binCount', update: '(bins.stop - bins.start) / bins.step'},
      {name: 'nullGap', value: 10},
      {name: 'barStep', update: '(width - nullGap) / (1 + binCount)'}
    ],

    data: [
      {
        name: 'table',
        values: dataset,
        transform: [
          {type: 'extent', field: xDim, signal: 'extent'},
          {
            type: 'bin',
            signal: 'bins',
            field: xDim,
            extent: {signal: 'extent'},
            maxbins: {signal: 'maxbins'}
          }
        ]
      },
      {
        name: 'counts',
        source: 'table',
        transform: [
          {type: 'filter', expr: `datum['${xDim}'] != null`},
          {type: 'aggregate', groupby: ['bin0', 'bin1']}
        ]
      },
      {
        name: 'nulls',
        source: 'table',
        transform: [
          {type: 'filter', expr: `datum['${xDim}'] == null`},
          {type: 'aggregate'}
        ]
      }
    ],

    scales: [
      {
        name: 'yscale',
        type: 'linear',
        range: 'height',
        round: true,
        nice: true,
        domain: {
          fields: [
            {data: 'counts', field: 'count'},
            {data: 'nulls', field: 'count'}
          ]
        }
      },
      {
        name: 'xscale',
        type: 'linear',
        range: [{signal: 'barStep + nullGap'}, {signal: 'width'}],
        round: true,
        domain: {signal: '[bins.start, bins.stop]'},
        bins: {signal: 'bins'}
      },
      {
        name: 'xscale-null',
        type: 'band',
        range: [0, {signal: 'barStep'}],
        round: true,
        domain: [null]
      }
    ],

    axes: [
      {
        orient: 'bottom',
        scale: 'xscale',
        tickMinStep: 0.5,
        format: '.2s',
        labelOverlap: 'parity'
      },
      {orient: 'bottom', scale: 'xscale-null'},
      {orient: 'left', scale: 'yscale', tickCount: 5, offset: 5, format: '.2s'}
    ],

    marks: [
      {
        type: 'rect',
        from: {data: 'counts'},
        encode: {
          enter: {
            tooltip: {
              signal:
                "{'count': datum.count, 'from': datum.bin0, 'to': datum.bin1}"
            }
          },
          update: {
            x: {scale: 'xscale', field: 'bin0', offset: 1},
            x2: {scale: 'xscale', field: 'bin1'},
            y: {scale: 'yscale', field: 'count'},
            y2: {scale: 'yscale', value: 0},
            fill: {value: '#333'}
          }
        }
      },
      {
        type: 'rect',
        from: {data: 'nulls'},
        encode: {
          enter: {
            tooltip: {
              signal: "{'title': 'Nulls', 'count': datum.count}"
            }
          },
          update: {
            x: {scale: 'xscale-null', value: null, offset: 1},
            x2: {scale: 'xscale-null', band: 1},
            y: {scale: 'yscale', field: 'count'},
            y2: {scale: 'yscale', value: 0},
            fill: {value: '#D62728'}
          }
        }
      }
    ]
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
