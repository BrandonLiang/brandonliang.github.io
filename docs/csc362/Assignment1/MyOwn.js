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
        .orient("bottom");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var color = d3.scale.linear()
        .range(["red","yellow","blue"]);

var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);

d3.csv("Faculty_Tuition.csv", type, function(error, data) {
  if (error) throw error;
  
  data.forEach(function(d){
    d.ratio = d["Tuition"] / d["Faculty"] ;
});
  
  y.domain([0, d3.max(data, function(d) { 
          return d["Tuition"]; 
          })]);
      
  x.domain(d3.extent(data, function(d) {
      return d["Faculty"];
  }));
  
  var minimum = d3.min(data, function(d){return d.ratio;});
  var midpoint = d3.median(data, function(d){return d.ratio;});
  var maximum = d3.max(data, function(d){return d.ratio;});
  
  color.domain([maximum, midpoint, minimum]);
  
  svg.append("text")
       .attr("x", (width / 2))             
       .attr("y", margin.top / 2)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("")
       .attr("class", "x label");
    
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Tuition");
      
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
          .text("Number of Faculty");
  
  svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("class", "bar")
          .attr("cx", function(d) {return x(d["Faculty"]); })
          .attr("width", width/data.length)
          .attr("cy", function(d) {return y(d["Tuition"]); })
          .attr("height", function(d) { return height-y(d["Tuition"]); })
          .style("fill",function(d) {return color(d.ratio);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + " Tuition: $"+
                      d["Tuition"]+" Faculty: "+ d["Faculty"] + 
                      " Tuition-Faculty Ratio: "+d3.round(d.ratio))
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 70) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);
          
  });
  
  
});


function type(d) {
  d["Tuition"] = +d["Tuition"]; //Convert data to numbers
  d["Faculty"] = +d["Faculty"];
  return d;
}