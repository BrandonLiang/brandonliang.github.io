/*
source code from: http://bl.ocks.org/mbostock/4063663
*/

var width = 960,
    size = 250,
    padding = 19.5;
    
var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var color = d3.scale.category10();

var sectors = d3.set();


d3.csv("NewsweekGreen.csv", function(error, data) {
  if (error) throw error;
  
  data.forEach(function(d) {
  	d["Newsweek Green Score"] = +d["Newsweek Green Score"];
  	d["Energy Productivity"] = +d["Energy Productivity"];
  	d["Carbon Productivity"] = +d["Carbon Productivity"];
  	d["Water Productivity"] = +d["Water Productivity"];
  	d["Waste Productivity"] = +d["Waste Productivity"];
  	d["Green Revenue"] = +d["Green Revenue"];
  	d["Sustainability Pay Link"] = +d["Sustainability Pay Link"];
  	d["Sustainability Themed Committee"] = +d["Sustainability Themed Committee"];
  	d["Audit Score"] = +d["Audit Score"];
  	sectors.add(d["GICS Sector"]);
  });
  
  var sectorsArray = sectors.values();
  
  var domainByIndicator = {},
      indicators = d3.keys(data[0]).filter(function(d) { return d !== "Rank"; })
      				   .filter(function(d) { return d !== "Company";})
      				   .filter(function(d) { return d !== "Country"; })
      				   .filter(function(d) { return d !== "GICS Sector"; })
      				   .filter(function(d) { return d !== "GICS Industry"; })
      				   .filter(function(d) { return d !== "Sustainability Themed Committee"; })
      				   .filter(function(d) { return d !== "Sustainability Pay Link"; })
      				   .filter(function(d) { return d !== "Audit Score"; }),
      n = indicators.length,
      
      ranks = d3.keys(data[0]).filter(function(d) { return d == "Rank"; });

  indicators.forEach(function(indicator) {
    domainByIndicator[indicator] = d3.extent(data, function(d) { return +d[indicator]; });
  });
  
  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  var svg = d3.select("body").append("svg")
      .attr("width", size * (n+2) + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + 1.5 * padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(indicators)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByIndicator[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(indicators)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByIndicator[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(indicators, indicators))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });
  
  	//cell.call(brush);


  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByIndicator[p.x]);
    y.domain(domainByIndicator[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);
	

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 3)
        .style("fill", function(d) { return color(d["GICS Sector"]); })
        .attr("id", function(d) { return d["GICS Sector"].substring(0,3);})
                .on("mouseover", function(d) {                
              tooltip.transition()
              .duration(200)
              .style("opacity", .9)
              .style("font-size","24 px");

              tooltip.html(
                      "Company: "+
                      d["Company"]+ 
                      "<br/>Country: "+d["Country"]+
                      "<br/>GICS Sector: "+d["GICS Sector"] +
                      "<br/>GICS Industry: " + d["GICS Industry"] +
                      "<br/>" + p.x + ": " + d[p.x] +
                      "<br/>" + p.y + ": " + d[p.y] +
                      "<br/>Newsweek Green Score: " + d["Newsweek Green Score"]+
                      "<br/>Rank: " + d.Rank)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);       
  });
  
  
  }

  var brushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.clear());
      x.domain(domainByIndicator[p.x]);
      y.domain(domainByIndicator[p.y]);
      brushCell = this;
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var e = brush.extent();
    svg.selectAll("circle").classed("hidden", function(d) {
      return e[0][0] > d[p.x] || d[p.x] > e[1][0]
          || e[0][1] > d[p.y] || d[p.y] > e[1][1];
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
  
  
  
  svg.selectAll(".legend")
  	.data(sectorsArray)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", n*size + 1.2*padding )
  	.attr("y", function(d) {return  22*sectorsArray.indexOf(d);})
  	.attr("width", 270)
  	.attr("height", 22)
  	.style("fill", function(d) {return color(d);})
  	.attr("id",function(d) {return "legend"+d;})
  	.on("click", function(d){
  		var temp2 = document.getElementById("legend"+d);
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
   	.attr("x", n*size + 8*padding  )
   	.attr("y",function(d) {return 15+22*sectorsArray.indexOf(d);})
   	.style("text-anchor", "middle")
   	.style('fill', 'White')
   	.style("font-size", "14px")
   	.text(function(d) {return d;})
   	.attr("id",function(d) {return "legend"+d;})
  	.on("click", function(d){
  		var temp2 = document.getElementById("legend"+d);
		// Determine if current line is visible
		var active   = temp2.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.selectAll("#"+d.substring(0,3)).style("opacity", newOpacity);
		// Update whether or not the elements are active
		temp2.active = active;
	});
});