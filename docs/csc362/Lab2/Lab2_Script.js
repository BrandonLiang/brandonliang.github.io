/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
   
var grades = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];
var apScores = ["1", "2", "3", "4", "5"].reverse();

var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);
    
  /*SCALES create */
  var classScale = d3.scale.ordinal()
  			.rangeBands([0,width],0.05);
  
  var apTestScale = d3.scale.ordinal()
      			.rangeBands([height,0],0.05);
  
  var colorScale = d3.scale.linear()
      			.range(["grey","red"]);
  
  var gradeScale = d3.scale.ordinal()
      		     .domain(grades); /*The Gap should be defined somewhere else*/
       		     	
  var apScoreScale = d3.scale.ordinal()
  		       .domain(apScores); /*The Gap should be defined somewhere else*/
  
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var classes = d3.set();

var tests = d3.set();
    
d3.csv("AP.csv", function(error, data) {
  if (error) throw error;
  
  data.forEach(function(d) {
  	classes.add(d.Num);
  	tests.add(d["Test Desc"]);
  });
  
  /*
  classScale.domain(classes);
  apTestScale.domain(tests);
  */
   
  var nest = d3.nest()
  	     .key(function(d) {return d.Num;}) 
  	     .key(function(d) {return d.Grade;})
  	     .key(function(d) {return d["Test Desc"];})
  	     .key(function(d) {return d["Test Score"];})
  	     .rollup(function(d) {return d.length;})
  	     .map(data);
  
/*SQUARES
Comment/Understanding: the following block of code first create a JS object called squares and then loops through each data from the csv file to extract the information of each data cell.
The information includes class name, grade of that class, ap test name, ap test score and the count/length of the identical data points. It stores the same information as the nest object, but these five variables are stored as the five fields of the squares object. 
*/
     
  var colorRange = d3.set();   
  var squares = [];
  
  classes.forEach(function(className) {
      var classObj = nest[className];
      
      grades.forEach(function(grade) {
          var gradeObj = d3.keys(classObj).indexOf(grade) === -1 ? null : classObj[grade]; 
          
          tests.forEach(function(test) {             
              var testObj = null;
              if (gradeObj && d3.keys(gradeObj).indexOf(test) !== -1) {
                  testObj = gradeObj[test];
              }
              
              apScores.forEach(function(apScore) {
                  var count = 0;
                  if (testObj && d3.keys(testObj).indexOf(apScore) !== -1) {
                      count = testObj[apScore];
                  }
		  colorRange.add(count);
                  squares.push({
                     className: className,
                     grade: grade,
                     test: test,
                     apScore: apScore,
                     count: count
                  });
              });
          });
      });
      
  });
  
  /*Prints out the array of classes and tests to the console for checking purpose*/
  var classesArray = classes.values();
  var testsArray = tests.values();
  var colorRangeArray = colorRange.values();
  console.log(classesArray);
  console.log(testsArray);
  console.log(nest);  
  console.log(squares); 
  console.log(colorRangeArray);
  
  classScale.domain(classesArray);
  apTestScale.domain(testsArray);
  gradeScale.rangeBands([0,classScale.rangeBand()],0.05);
  apScoreScale.rangeBands([apTestScale.rangeBand(),0],0.05);
  colorScale.domain(d3.extent(colorRangeArray));
      
  var xAxis = d3.svg.axis()
    .scale(classScale)
    .orient("bottom");
    
  var yAxis = d3.svg.axis()
    .scale(apTestScale)
    .orient("left");
  
/*TILES*/

  /*console.log(colorScale.domain());*/
  svg.selectAll(".tile")
      .data(squares)
    .enter().append("rect")
      .attr("class", "tile")
      .attr("x", function(d) { return margin.left + classScale(d.className)+gradeScale(d.grade); })
      .attr("y", function(d) { return height - apTestScale(d.test) - apScoreScale(d.apScore); })
      .attr("width", gradeScale.rangeBand())
      .attr("height", apScoreScale.rangeBand())
      .style("fill", function(d) { return colorScale(d.count); })
      .on("mouseover", function(d) {
              tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html("Class: MAT " + d.className + ", Grade:"+
                      d.grade+", AP Test: "+ d.test + 
                      ", AP Test Score: "+d.apScore+", Number of Records: "+d.count)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 70) + "px");
          })
                  .on("mouseout", function(d){
                      tooltip.transition()
                      .duration(500)
                      .style("opacity",0);
          
  });
   
  /*
  var classLabel = svg.selectAll(".classLabel")
       .data(classes)
    .enter().append("g")
        .attr("transform", function(d) {return "translate(" + classScale(d.className) + ",0)"; });

  classLabel.append("text")
      .attr("class","x label")
      .style("text-anchor", "middle")
      .attr("x", function(d) { return classScale(d.className) + classScale.rangeBand()/2; })
      .text(function(d) { return "MAT "; }
      .attr("x", function(d) { return width;} )
      .text("Test");
      
      
   classLabel.selectAll(".gradeLabel")
      .data(grades)
    .enter().append("text")
      .attr("class","x label")
      .attr("x", function(d) { return gradeScale(d.grade) + gradeScale.rangeBand()/2; })
      .attr("y", "1em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.grade; });
  */
     
  /*    
  var testLabel = svg.selectAll(".testLabel")
      .data(tests)
      .enter().append("g")
      .attr("transform","rotate(-90)")
      .attr("transform", function(d) {return "translate(0," + apTestScale(d.test) + ")"; });
      
  testLabel.append("text")
  .class("class","y label")
  .attr("y", apTestScale.rangeBand()/2)
  .style("text-anchor","middle")
  .text(function(d) { return d.test; });
  
  testLabel.selectAll(".scoreLabel")
      .data(apScores)
      .enter().append("text")
      .attr("class","y label")      
      .attr("x","1em")
      .attr("y", function(d) { return apTestScale(d.apScore) + apTestScale.rangeBand()/2;})
      .style("text-anchor","middle")
      .text(function(d) { return d.apScore; });
  */
  var gap = 0;
  for (var i = 0; i < classesArray.length; i++) {
  	svg.append("text")
    	.data(data)
    	.attr("class", "x label")
    	.attr("text-anchor", "end")
    	.attr("x", function(d) { return 2*margin.left + classScale.rangeBand()/2 + gap + classScale(d.className) + i*classScale.rangeBand(); })
    	.attr("y", 0)
    	.attr("dx", "-.8em")
        .attr("dy", ".15em")
    	.text("MAT " + classesArray[i]);	
    	
    	for (var j = 0; j < grades.length; j++) {
    		svg.append("text")
    		.data(data)
    		.attr("class", "x label")
    		.attr("text-anchor", "end")
    		.attr("x", function(d) { return 2*margin.left-2 + gradeScale.rangeBand()/2 + gap + gradeScale(d.grade) + j*(gradeScale.rangeBand()+1) + i*classScale.rangeBand(); })
    		.attr("y", 15)
    		.style("font-size","12px")
    		.text(grades[j]);	
    	}
    	gap = gap + 0.012*width;
    }
  
  gap = 0;
  
 for (var i = 0; i < testsArray.length; i++) {
  	svg.append("text")
    	.data(data)
    	.attr("transform","rotate(-90)")
    	.attr("class", "y label")    	
    	.attr("text-anchor", "end")
    	.attr("y", function(d) { return -80 + apTestScale.rangeBand()/2  ; })  
    	.attr("x", function(d) {return 330 - apTestScale.rangeBand()/2 - apTestScale(d.test) - i*apTestScale.rangeBand()-gap;} ) 	
    	.text(testsArray[i]);	
    	
    	for (var j = 0; j < apScores.length; j++) {
    		svg.append("text")
    		.data(data)
    		.attr("class", "y label")
    		.attr("text-anchor", "middle")
    		.attr("y", function(d) { return  apScoreScale.rangeBand()/2 + gap + apScoreScale(d.apScore) + j*(apScoreScale.rangeBand()+1) + i*apTestScale.rangeBand()-85; })
    		.attr("dy", "1em")
    		.text(apScores[j]);	
    	}
    	gap = gap + 0.012*height;
    }
  
});
