function makeScales(svg, labels) {
  const width = parseInt(svg.style('width'));
  const height = parseInt(svg.style('height'));
  const margin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  const xWindow = d3
    .scaleLinear()
    .domain([0, 1.2])
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

// in our index coordins
function getCardHeightWidth() {
  const size = 0.2;
  let h = size;
  let w = (57.15 / 88.9) * size;
  return {h, w};
}
