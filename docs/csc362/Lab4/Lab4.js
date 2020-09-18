/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
 
 /*Source code from: http://bl.ocks.org/jasondavies/1341281*/
var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width-150], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var color = d3.scale.category10();

d3.csv("NewsweekGreen.csv", function(error, data) {

  var sectors=d3.set();
  
  data.forEach(function(d){
      sectors.add(d["GICS Sector"]);
  });
  
  var sectorsArray = sectors.values();
  
  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return d != "name" && d != "Country" && d != "GICS Sector" 
            && d!="GICS Industry" && d!="Company" && d!="Sustainability Themed Committee" 
            && d!="Sustainability Pay Link" && d!="Audit Score" 
            && (y[d] = d3.scale.linear()
        .domain(d3.extent(data, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .style("stroke",function(d) {return color(d["GICS Sector"]);})
      .attr("d", path)
      .attr("id", function(d) {return d["GICS Sector"].substring(0,3);} );

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
      
  svg.selectAll(".legend")
  	.data(sectorsArray)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", width-180)
  	.attr("y", function(d) {return  22*sectorsArray.indexOf(d);})
  	.attr("width", 500)
  	.attr("height", 22)
  	.style("fill", function(d) {return color(d);})
  	.attr("id",function(d) {return "l"+d;})
  	.on("click", function(d){
  		var temp2 = document.getElementById("l"+d);
		// Determine if current line is visible
		var active   = temp2.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.selectAll("#"+d.substring(0,3)).style("opacity", newOpacity);
		// Update whether or not the elements are active
		temp2.active = active;	
	});
  	
   svg.selectAll(".legendText")
   	.data(sectorsArray)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x", width-85)
   	.attr("y",function(d) {return 15+22*sectorsArray.indexOf(d);})
   	.style("text-anchor", "middle")
   	.style('fill', 'White')
   	.style("font-size", "14px")
   	.text(function(d) {return d;})
   	.attr("id",function(d) {return "l"+d;})
  	.on("click", function(d){
  		var temp2 = document.getElementById("l"+d);
		// Determine if current line is visible
		var active   = temp2.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.selectAll("#"+d.substring(0,3)).style("opacity", newOpacity);
		// Update whether or not the elements are active
		temp2.active = active;	
	});   
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}
