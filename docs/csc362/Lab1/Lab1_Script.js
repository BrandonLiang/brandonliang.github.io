/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var margin = {top: 20, right: 20, bottom: 135, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
var parseDate = d3.time.format("%Y-%Y").parse;

var y = d3.scale.linear()
    .range([height, 0]);

var x = d3.time.scale()
        .range([0,width]);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    
var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(20);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("archives.csv", type, function(error, data) {
  if (error) throw error;
  
  y.domain([0, d3.max(data, function(d) { 
          return d["Adjusted Tuition to 2014"]; 
          })]);
      
  x.domain(d3.extent(data, function(d) {
      return d["Year"];
  }));
  
    svg.append("text")
       .attr("x", (width / 2))             
       .attr("y", margin.top / 2)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("Annual Davidson Tuition")
       .attr("class", "x label");
    
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Inflation Adjusted Tuition ($)");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+height+")")
          .call(xAxis);
  
  // adding the x-axis title
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/2)
          .attr("y", height+37)
          .style("text-anchor", "middle")
          .text("School Year");
  
  svg.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) {return x(d["Year"]); })
          .attr("width", width/data.length)
          .attr("y", function(d) {return y(d["Adjusted Tuition to 2014"]); })
          .attr("height", function(d) { return height - y(d["Adjusted Tuition to 2014"]); });

});

function type(d) {
  d["Adjusted Tuition to 2014"] = +d["Adjusted Tuition to 2014"]; //Convert data to numbers
  d["Year"] = parseDate(d["Year"]);
  return d;
}



