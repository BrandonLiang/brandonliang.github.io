/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 1460 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
   
var grades = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];
var apScores = ["1", "2", "3", "4", "5"].reverse();

var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);
        
var y1 = d3.scale.ordinal()
  	.rangeBands([height,0],0.05);
  	
var x1 = d3.scale.ordinal()
	.rangeBands([0,width/2],0.05);      
	
var y2 = d3.scale.ordinal()
  	.rangeBands([height,0],0.05);
  	
var x2 = d3.scale.ordinal()
	.rangeBands([0,width/2],0.05);    
	
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
    
y1.domain(grades);
x1.domain(["112","113","160"]);
y2.domain(grades);
x2.domain(["112","113","150","160"]);
  
  var colorScale = d3.scale.ordinal()
      			.range(['Red','Green']); 
       		      
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var terms = d3.set();
var classes = d3.set();
var grades = d3.set();  
    
d3.csv("AP.csv", function(error, data) {
  if (error) throw error;
  
  data.forEach(function(d) {
  	terms.add(d.Term);
  	classes.add(d.Num);
  	grades.add(d.Grade);  
  });
     
  var nest = d3.nest()
  	     .key(function(d) {return d.Term;}) 
  	     .key(function(d) {return d.Num;})
  	     .key(function(d) {return d.Grade;})
  	     .rollup(function(d) {return d.length;})
  	     .map(data);
     
  var colorRange1 = d3.set();  
  var colorRange2 = d3.set(); 
  var squares1 = [];
  var squares2 = [];
  
  terms.forEach(function(term) {
      var termObj = nest[term];
      classes.forEach(function(num) {
          var numObj = d3.keys(termObj).indexOf(num) === -1 ? null : termObj[num];          
          grades.forEach(function(grade) {    
              var count = 0;         
              var gradeObj = null;
              if (numObj && d3.keys(numObj).indexOf(grade) !== -1) {
                  gradeObj = numObj[grade];
                  count = numObj[grade];
              }      
		if (term == "Fall") {
		  colorRange1.add(count);
                  squares1.push({
                     term: term,
                     className: num,
                     grade: grade,
                     count: count
                  });
                  }                  
                 if (term == "Spring") {
		  colorRange2.add(count);
                  squares2.push({
                     term: term,
                     className: num,
                     grade: grade,
                     count: count
                  });
                  }
          });
      });     
  });
  
  
  var termsArray = terms.values();
  var classesArray = classes.values();

  colorScale.domain(["Fall","Spring"]);
 
  svg.append("text")
       .attr("x", (width*0.35))             
       .attr("y", margin.top / 2-10)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("Performace in entry Math classes: Fall vs Spring")
       .attr("class", "x label");
       
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Grades");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+height+")")
          .call(xAxis1);
  
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/4-margin.left*4)
          .attr("y", height+18)
          .style("text-anchor", "middle")
          .text("Classes in Fall");
          
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis2)
      .attr("transform", "translate("+width*0.5+",0)")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Grades");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate("+width*0.5+","+height+")")
          .call(xAxis2);

  svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.5 + width/4-margin.left)
          .attr("y", height+18)
          .style("text-anchor", "middle")
          .text("Classes in Spring");
   
   svg.selectAll(".dot")
          .data(squares1)
          .enter().append("circle")
          .attr("r",function(d) {return 2*d.count;} )
          .attr("class", "bar")
          .attr("cx", function(d) {
          	return 6*margin.left-10+x1(d.className); 
          })
          .attr("width", 15)
          .attr("cy", function(d) {return 18 + y1(d.grade); })
          .attr("height", function(d) { return 15; })
          .style("fill",function(d) {return colorScale(d.term);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html("Term: Fall"+                    
                      "<br/> Math Class: "+
                      d.className+ 
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
          .attr("r",function(d) {return 2*d.count;} )
          .attr("class", "bar")
          .attr("cx", function(d) {
          	return width/8-4*margin.left-13+width/2+x2(d.className); 
          })
          .attr("width", 15)
          .attr("cy", function(d) {return 18 + y2(d.grade); })
          .attr("height", function(d) { return 15; })
          .style("fill",function(d) {return colorScale(d.term);})
          .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html("Term: Spring"+                      
                      "<br/> Math Class: "+
                      d.className+ 
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
  	.data(termsArray)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", function(d) {return 9*margin.left - 10 + 60*termsArray.indexOf(d);})
  	.attr("y", -10)
  	.attr("width", 60)
  	.attr("height", 22)
  	.style("fill", function(d) {return colorScale(d);});
  	
   svg.selectAll(".legendText")
   	.data(termsArray)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",function(d) {return 10*margin.left - 12 + 60*termsArray.indexOf(d);})
   	.attr("y",24)
   	.text(function(d) {return d;});
   	
});
  

  
