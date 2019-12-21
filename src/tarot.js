const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const faces = ['Page', 'Knight', 'Queen', 'King'];

function majorArcana(domNode, card, scales) {
  console.log(domNode);
}

const emojii = [
  '🚘',
  '🔪',
  '🎖',
  '↩️',
  '💹',
  '👳',
  '📖',
  '👉',
  '🏄',
  '➡️',
  '💛',
  '👑',
  '🍄',
  '⚠️',
  '🔜',
  '🎒',
  '🐼',
  '🌿',
  '🐆',
  '👺',
  '👭'
];

function exampleCardFront(domNode, card, scales) {
  const {xWindow, yWindow} = scales;
  const {h, w} = getCardHeightWidth();
  const svg = d3.select(domNode);
  svg.selectAll('*').remove();
  svg.attr('class', 'cardfront-container');
  svg
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', yWindow(h))
    .attr('width', xWindow(w))
    .attr('stroke', 'black')
    .attr('stroke-width', 7)
    .attr('fill', 'white')
    .attr('rx', 10)
    .attr('rx', 10);

  svg
    .append('text')
    .attr('x', xWindow(w / 2))
    .attr('y', yWindow(h * 0.8))
    .attr('text-anchor', 'middle')
    .text('EXAMPLE');

  svg
    .append('text')
    .attr('x', xWindow(w / 2))
    .attr('y', yWindow(h * 0.5))
    .attr('text-anchor', 'middle')
    .attr('font-size', 40)
    .text(emojii[card.pos % emojii.length]);
  const TOOLTIP_WIDTH = 200;
  const TOOLTIP_HEIGHT = 100;
  const toolTipContainer = svg
    .append('g')
    .attr('class', 'tooltip-container')
    .attr(
      'transform',
      `translate(${xWindow(w / 2) - TOOLTIP_WIDTH / 2}, ${yWindow(h) -
        TOOLTIP_HEIGHT / 2})`
    );
  toolTipContainer
    .append('foreignObject')
    .attr('class', 'tooltip')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', TOOLTIP_HEIGHT)
    .attr('width', TOOLTIP_WIDTH)
    .html(d => `<div class="tooltip">INTERPRET ME</div>`);
}

// this function will select the appropriate design function
// a d3 chart if it's the minor arcana, and the major arcana emojii
// thing if it's major
function findAppropriateCard(card) {
  return exampleCardFront;
}
