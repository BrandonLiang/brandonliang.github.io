/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 1460 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
   
var grades = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];
var apScores = ["1", "2", "3", "4", "5"];

var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);
        
var y1 = d3.scale.ordinal()
  	.rangeBands([height,0],0.05);
  	
var x1 = d3.scale.ordinal()
	.rangeBands([0,width/4-20],0.05);      
	
var y2 = d3.scale.ordinal()
  	.rangeBands([height,0],0.05);
  	
var x2 = d3.scale.ordinal()
	.rangeBands([0,width/4-20],0.05);  
	
var y3 = d3.scale.ordinal()
  	.rangeBands([height,0],0.05);
  	
var x3 = d3.scale.ordinal()
	.rangeBands([0,width/4-20],0.05);
  	
var y4 = d3.scale.ordinal()
  	.rangeBands([height,0],0.05);  
 
var x4 = d3.scale.ordinal()
	.rangeBands([0,width/4-20],0.05);
	
var yAxis1 = d3.svg.axis()
    .scale(y1)
    .orient("left");
    
var xAxis1 = d3.svg.axis()
        .scale(x1)
        .orient("bottom");
        
var yAxis2 = d3.svg.axis()
    .scale(y2)
    .orient("left");
    
var xAxis2 = d3.svg.axis()
        .scale(x2)
        .orient("bottom");
        
var yAxis3 = d3.svg.axis()
    .scale(y3)
    .orient("left");
    
var xAxis3 = d3.svg.axis()
        .scale(x3)
        .orient("bottom"); 

var yAxis4 = d3.svg.axis()
    .scale(y4)
    .orient("left");
    
var xAxis4 = d3.svg.axis()
        .scale(x4)
        .orient("bottom");       
    
y1.domain(grades);
x1.domain(apScores);
y2.domain(grades);
x2.domain(apScores);
y3.domain(grades);
x3.domain(apScores);
y4.domain(grades);
x4.domain(apScores);
  
var colorScale = d3.scale.ordinal()
      			.range(['Red','Green','Purple','Orange']); 
      			
       		      
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var classes = d3.set();
var grades = d3.set();  
var tests = d3.set();
var apScores = d3.set();
    
d3.csv("AP.csv", function(error, data) {
  if (error) throw error;
  
  data.forEach(function(d) {
  	classes.add(d.Num);
  	grades.add(d.Grade);
  	apScores.add(d["Test Score"]);
  
  });
  
  var classesArray = classes.values();
  colorScale.domain(classesArray);
     
  var nest = d3.nest()
  	     .key(function(d) {return d.Num;}) 
  	     .key(function(d) {return d.Grade;})
  	     .key(function(d) {return d["Test Score"];})
  	     .rollup(function(d) {return d.length;})
  	     .map(data);
     
  var squares = [];   
  var squares1 = [];
  var squares2 = [];
  var squares3 = [];
  var squares4 = [];
  
  classes.forEach(function(className) {
      var classObj = nest[className];
      
      grades.forEach(function(grade) {
          var gradeObj = d3.keys(classObj).indexOf(grade) === -1 ? null : classObj[grade]; 
              
              apScores.forEach(function(apScore) {
                  var count = 0;
                  if (gradeObj && d3.keys(gradeObj).indexOf(apScore) !== -1) {
                      count = gradeObj[apScore];
                  }
                  if (className == "112") {
                  squares1.push({
                     className: className,
                     grade: grade,
                     apScore: apScore,
                     count: count
                  });
                  }
                  if (className == "113") {
                  squares2.push({
                     className: className,
                     grade: grade,
                     apScore: apScore,
                     count: count
                  });
                  }
                  if (className == "150") {
                  squares3.push({
                     className: className,
                     grade: grade,
                     apScore: apScore,
                     count: count
                  });
                  }
                  if (className == "160") {
                  squares4.push({
                     className: className,
                     grade: grade,
                     apScore: apScore,
                     count: count
                  });
                  }
              });
          });      
  });
    
/*Dots*/

  svg.append("text")
       .attr("x", (width*0.35))             
       .attr("y", margin.top / 2-10)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("")
       .attr("class", "x label");
       
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Grade");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+height+")")
          .call(xAxis1);

  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/4-margin.left*4)
          .attr("y", height+18)
          .style("text-anchor", "middle")
          .text("MAT112");
          
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis2)
      .attr("transform", "translate("+width*0.25+",0)")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Grade");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate("+width*0.25+","+height+")")
          .call(xAxis2);
  
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.25 + width/4-margin.left)
          .attr("y", height+18)
          .style("text-anchor", "middle")
          .text("MAT113");
          
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis4)
      .attr("transform", "translate("+width*0.5+",0)")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Grade");
      
  svg.append("g")
       .attr("class","x axis")
       .attr("transform","translate("+width*0.5+","+height+")")
       .call(xAxis3);

  svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.5 + width/4-margin.left)
          .attr("y", height+18)
          .style("text-anchor", "middle")
          .text("MAT150");
          
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis4)
      .attr("transform", "translate("+width*0.75+",0)")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Grade");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate("+width*0.75+","+height+")")
          .call(xAxis4);
  
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.75 + width/4-margin.left)
          .attr("y", height+18)
          .style("text-anchor", "middle")
          .text("MAT160");
   
   svg.selectAll(".dot")
          .data(squares1)
          .enter().append("circle")
          .attr("r",function(d) { return 2*d.count;})
          .attr("class", "bar")
          .attr("cx", function(d) {
          	return 2*margin.left-10+x1(d.apScore); 
          })
          .attr("width", 15)
          .attr("cy", function(d) {return 18 + y1(d.grade); })
          .attr("height", function(d) { return 15; })
          .style("fill",function(d) {return colorScale(d.className);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(
                      "<br/> Ap Score: "+
                      d.apScore+ 
                      "<br/> Math Class: MAT "+d.className+
                      "<br/> Grade: "+d.grade +
                      "<br/> Number or Records: " + d.count)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);         
  });
  
  svg.selectAll(".dot")
          .data(squares2)
          .enter().append("circle")
          .attr("r",function(d) { return 2*d.count;})
          .attr("class", "bar")
          .attr("cx", function(d) {
          	return 0.25*width+2*margin.left-10+x2(d.apScore); 
          })
          .attr("width", 15)
          .attr("cy", function(d) {return 18 + y2(d.grade); })
          .attr("height", function(d) { return 15; })
          .style("fill",function(d) {return colorScale(d.className);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(
                      "<br/> Ap Score: "+
                      d.apScore+ 
                      "<br/> Math Class: MAT "+d.className+
                      "<br/> Grade: "+d.grade +
                      "<br/> Number or Records: " + d.count)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);          
  });
  
  svg.selectAll(".dot")
          .data(squares3)
          .enter().append("circle")
          .attr("r",function(d) { return 2*d.count;})
          .attr("class", "bar")
          .attr("cx", function(d) {
          	return 0.5*width+2*margin.left-10+x3(d.apScore); 
          })
          .attr("width", 15)
          .attr("cy", function(d) {return 18 + y3(d.grade); })
          .attr("height", function(d) { return 15; })
          .style("fill",function(d) {return colorScale(d.className);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(
                      "<br/> Ap Score: "+
                      d.apScore+ 
                      "<br/> Math Class: MAT "+d.className+
                      "<br/> Grade: "+d.grade +
                      "<br/> Number or Records: " + d.count)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);          
  });
  
  svg.selectAll(".dot")
          .data(squares4)
          .enter().append("circle")
          .attr("r",function(d) { return 2*d.count;})
          .attr("class", "bar")
          .attr("cx", function(d) {
          	return width*0.75+2*margin.left-10+x4(d.apScore); 
          })
          .attr("width", 15)
          .attr("cy", function(d) {return 18 + y4(d.grade); })
          .attr("height", function(d) { return 15; })
          .style("fill",function(d) {return colorScale(d.className);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(
                      "<br/> Ap Score: "+
                      d.apScore+ 
                      "<br/> Math Class: MAT "+d.className+
                      "<br/> Grade: "+d.grade +
                      "<br/> Number or Records: " + d.count)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);          
  }); 
  
   svg.selectAll(".legend")
  	.data(classesArray)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", function(d) {return 18*margin.left - 10 + 90*classesArray.indexOf(d);})
  	.attr("y", -30)
  	.attr("width", 90)
  	.attr("height", 22)
  	.style("fill", function(d) {return colorScale(d);});
  	
   svg.selectAll(".legendText")
   	.data(classesArray)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",function(d) {return 20*margin.left - 12 + 90*classesArray.indexOf(d);})
   	.attr("y",4)
   	.text(function(d) {return d;});
});
  

  
