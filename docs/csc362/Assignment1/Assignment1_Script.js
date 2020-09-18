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

d3.csv("archives_facultyStudentRatio.csv", type, function(error, data) {
  if (error) throw error;
  
  
  
  data.forEach(function(d){
  if (d["Total Enrollment"] > 20)
    d.ratio = d["Faculty"] / d["Total Enrollment"];
  if (d.ratio > 1)
    d.ratio = 0;
});
  
  y.domain([0, d3.max(data, function(d) { 
          return d["Faculty"]; 
          })]);
      
  x.domain(d3.extent(data, function(d) {
      return d["Total Enrollment"];
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
       .text("Davidson: Faculty-Student Ratio")
       .attr("class", "x label");
    
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Faculty");
      
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
          .text("Student Enrollment");
  
  svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("class", "bar")
          .attr("cx", function(d) {return x(d["Total Enrollment"]); })
          .attr("width", width/data.length)
          .attr("cy", function(d) {return y(d["Faculty"]); })
          .attr("height", function(d) { return height-y(d["Faculty"]); })
          .style("fill",function(d) {return color(d.ratio);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(d["Year"] + "<br/> Faculty: "+
                      d["Faculty"]+
                      "<br/> Students: "+
                      d["Total Enrollment"]+ 
                      " Faculty-Student Ratio: "+d["Faculty"] / d["Total Enrollment"])
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);
          
  });
  
  
});

function type(d) {
  d["Faculty"] = +d["Faculty"]; //Convert data to numbers
  d["Total Enrollment"] = +d["Total Enrollment"];
  return d;
}



