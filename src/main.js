function makeCard(svg,size,x,y){
  x = !x ? 0 : x;
  y = !y ? 0 : y;

  var h = size;
  var w = 57.15/88.9 * size;

  var numCards = d3.selectAll(".card").size();
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

}
