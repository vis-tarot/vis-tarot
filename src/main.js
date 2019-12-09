function makeCard(svg,x,y,size){
  x = !x ? 0 : x;
  y = !y ? 0 : y;

  let h = size;
  let w = 57.15/88.9 * size;

  let numCards = d3.selectAll(".card").size();

  svg.append("clipPath")
    .attr("id","card-clip"+numCards)
    .append("rect")
      .attr("x",x)
      .attr("y",y)
      .attr("width",w)
      .attr("height",h)
      .attr("rx",w/20)
      .attr("rx",w/20);

  var card = svg.append("g")
    .attr("clip-path", "url(#card-clip"+numCards+")");

  card.append("rect")
  .attr("class","card")
  .attr("x",x)
  .attr("y",y)
  .attr("width",w)
  .attr("height",h)
  .attr("fill","#333");

  return card;

}

function addCardSpace(svg,label,x,y,size){
  x = !x ? 0 : x;
  y = !y ? 0 : y;

  let h = size;
  let w = 57.15/88.9 * size;

  var cardSpace = svg.append("g")

  cardSpace.append("rect")
  .attr("class","cardspace")
  .attr("x",x)
  .attr("y",y)
  .attr("width",w)
  .attr("height",h)
  .attr("fill","#333");

  cardSpace.append("text")
  .attr("x",x + (w / 2))
  .attr("y",y + (h / 2))
  .attr("text-anchor","middle")
  .text(label);

  return cardSpace;

}

//Card spreads

//three card spread:
function threeCard(svg){
  var labels = ["Background","Problem","Advice"];

  var svgWidth = parseInt(svg.style("width"));
  var svgHeight = parseInt(svg.style("height"));

  var offset = 5;

  var xScale = d3.scaleBand()
  .domain(labels)
  .range([offset,svgWidth-offset])
  .paddingOuter(0.1)
  .paddingInner(0.05);

  var cWidth = xScale.bandwidth();

  labels.forEach(function(d){
    addCardSpace(svg,d,xScale(d),offset,cWidth);
  });
}

//celtic cross spread:
function celticCross(svg){

  //Note that we're omitting the "covers"/"challenges"/"context" card here, since we need to treat it separately
  var labels = ["Present","Goal","Past","Context","Future","Querent","Environment","Mind","Outcome"];
  var positions = [
    [1,1.5],
    [2,1.5],
    [1,2.5],
    [1,0.5],
    [0,1.5],
    [3,3],
    [3,2],
    [3,1],
    [3,0]
  ];

  var svgWidth = parseInt(svg.style("width"));
  var svgHeight = parseInt(svg.style("height"));

  var offset = 5;

  var xScale = d3.scaleBand()
  .domain([0,1,2,3])
  .range([offset,svgWidth-offset])
  .paddingOuter(0.1)
  .paddingInner(0.05);

  var cWidth = xScale.bandwidth();

  var cHeight = 88.9/57.15 * cWidth;

  labels.forEach(function(d,i){
    addCardSpace(svg,d,xScale(positions[i][0]),offset+cHeight*positions[i][1],cWidth);
  });

  //Deal with the rotated card that "Covers" the question
  var cover = addCardSpace(svg,"Challenges",0,0,cWidth);
  let coverX = xScale(1) + (cHeight/2);
  let coverY = offset+ (cHeight*1.25);
  cover.attr("transform",`translate(${coverX},${coverY}) rotate(90)`);
}
