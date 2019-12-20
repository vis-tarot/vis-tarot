//Card spreads
function oneCard(svg) {
  // basically just the three card with two cards that are never drawn
  const labels = ['Background', 'EXAMPLE', 'Advice'];
  const scales = makeScales(svg, labels);
  return {
    scales,
    positions: [{x: scales.xScale('EXAMPLE'), y: 0.4, label: 'EXAMPLE'}]
  };
}

function threeCard(svg) {
  const labels = ['Background', 'Problem', 'Advice'];
  const scales = makeScales(svg, labels);
  return {
    scales,
    positions: labels.map(label => ({x: scales.xScale(label), y: 0.4, label}))
  };
}

function celticCross(svg) {
  const positions = [
    {x: 1, y: 1.9, label: 'Challenges', rotate: true},
    {x: 1, y: 1.5, label: 'Present'},
    {x: 2, y: 1.5, label: 'Goal'},
    {x: 1, y: 2.5, label: 'Past'},
    {x: 1, y: 0.5, label: 'Context'},
    {x: 0, y: 1.5, label: 'Future'},
    {x: 3, y: 3, label: 'Querent'},
    {x: 3, y: 2, label: 'Environment'},
    {x: 3, y: 1, label: 'Mind'},
    {x: 3, y: 0, label: 'Outcome'}
  ];
  const scales = makeScales(svg, [0, 1, 2, 3]);
  return {
    scales,
    positions: positions.map(({x, y, label, rotate}) => ({
      x: scales.xScale(x),
      y: y / 4,
      label,
      rotate
    }))
  };
}
