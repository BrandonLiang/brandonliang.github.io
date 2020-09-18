/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var margin = {top: 20, right: 20, bottom: 135, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;
    
var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);

var parseDate = d3.time.format("%m/%d/%y").parse;

var y1 = d3.scale.linear()
    .range([height/2, 0]);

var x1 = d3.time.scale()
        .range([0,width/2]);

var y2 = d3.scale.linear()
        .range([height/2, 0]);

var y22 = d3.scale.linear()
        .range([height/2, 0]);

var x3 = d3.time.scale()
        .range([0,width/2]);

var y3 = d3.scale.linear()
        .range([height/2, 0]);

var y33 = d3.scale.linear()
        .range([height/2, 0]);

var y4 = d3.scale.linear()
        .range([height/2, 0]);

var x4 = d3.scale.linear()
        .range([0,width/2]);

var yAxis1 = d3.svg.axis()
    .scale(y1)
    .orient("left");
    
var xAxis1 = d3.svg.axis()
        .scale(x1)
        .orient("bottom");

var yAxis2 = d3.svg.axis()
    .scale(y22)
    .orient("left");
    
var yAxis22 = d3.svg.axis()
        .scale(y2)
        .orient("right");
    
var xAxis2 = d3.svg.axis()
        .scale(x1)
        .orient("bottom");

var yAxis3 = d3.svg.axis()
    .scale(y3)
    .orient("left");
    
var xAxis3 = d3.svg.axis()
        .scale(x3)
        .orient("bottom");

var yAxis33 = d3.svg.axis()
    .scale(y33)
    .orient("right");

var yAxis4 = d3.svg.axis()
        .scale(y4)
        .orient("left");
    
var xAxis4 = d3.svg.axis()
        .scale(x4)
        .orient("bottom");

var color1 = d3.scale.category10();

var color4 = d3.scale.quantize()
      	.range(colorbrewer.Reds[7]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 2.6*height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");  
    
/* "interpolate" Source code: http://bl.ocks.org/mbostock/3883245 */       
var line = d3.svg.line()
          .x(function(d) { return x1(d["Date"]); })
          .y(function(d) { return y1(d["Total"]); })
          .interpolate("cardinal-closed");
var line1 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["<22%"]); })
          .interpolate("linear");
var line2 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["22-24%"]); })
          .interpolate("linear");
var line3 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["25-34%"]); })
          .interpolate("linear");
var line4 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["35-44%"]); })
          .interpolate("linear");  
var line5 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["45-54%"]); })
          .interpolate("linear");
var line6 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["55-59%"]); })
          .interpolate("linear");
var line7 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d["60-64%"]); })
          .interpolate("linear");
var line8 = d3.svg.line()
          .x(function(d) {return x1(d["Date"]); })
          .y(function(d) {return 1.21*height/2 +y2(d[">=65%"]); })
          .interpolate("linear");
  
var lineM = d3.svg.line()
          .x(function(d) {return x3(d["Date"]); })
          .y(function(d) {return 2.41*height/2 + y3(d["MALE%"]); })
          .interpolate("cardinal");

var lineF = d3.svg.line()
          .x(function(d) {return x3(d["Date"]); })
          .y(function(d) {return 2.41*height/2 + y3(d["FEMALE%"]); })
          .interpolate("cardinal");
  
d3.csv("5Questions.csv", type, function(error, data) {
  if (error) throw error;
  
  color4.domain(d3.extent(data, function(d){
      return d["MALE%"];
  }));
  
  var age = d3.set();
  age.add("<22");
  age.add("22-24"); 
  age.add("25-34"); 
  age.add("35-44"); 
  age.add("45-54"); 
  age.add("55-59"); 
  age.add("60-64");
  age.add(">=65");
  ageArray = age.values();
  
  
  color1.domain(ageArray);
  
  y1.domain([0, d3.max(data, function(d) { 
          return d["Total"]; 
          })]);
      
  x1.domain(d3.extent(data, function(d) {
      return d["Date"];
  }));
  
  y2.domain([0,d3.max(data, function(d) {
          return d["45-54%"];
  })]);
  
  y22.domain([0,d3.max(data, function(d) {
          return d["45-54"];
  })]);
  
  svg.append("text")
       .attr("x", (width / 4))             
       .attr("y", margin.top / 3)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("1. Total Unemployment over the years")
       .attr("class", "x label");
  
  //First graph's axes  
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Records");
      
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+height/2+")")
          .call(xAxis1);
  
  // adding the x-axis title
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/4)
          .attr("y", height/2+40)
          .style("text-anchor", "middle")
          .text("Chronological Timeline");
      
  svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {return x1(d["Date"]); })
            .attr("width", width / 3 /data.length)
            .attr("y", function(d) { return y1(d["Total"]); })
            .attr("height", function(d) { return height/2 - y1(d["Total"]); })
            .on("mouseover", function(d) {                
              tooltip.transition()
              .duration(200)
              .style("opacity", .9)
              .style("font-size","24 px");

              tooltip.html(
                      "Time: "+ d["Date"] +
                      "<br/>Number of unemployment: "+d["Total"])
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
          })
            .on("mouseout", function(d){
              tooltip.transition()
              .duration(500)
              .style("opacity",0);       
  });
  
  svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line)
          .attr("id","TrendLine");
  
  svg.append("text")
          .attr("x", width/2 + 2*margin.left)
          .attr("y", 200)
          .attr("class","legend")
          .style("fill", "green")
          .on("click", function(){
		// Determine if current line is visible
		var active   = TrendLine.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.select("#TrendLine").style("opacity", newOpacity);
		// Update whether or not the elements are active
		TrendLine.active = active;
            })
            .style("font-size", "20px") 
            .text("Click to Hide/Show Trend Line");
    
  //Second graph's axes  
    svg.append("text")
       .attr("x", (width / 4))             
       .attr("y", 3.5*margin.top  + height/2)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("2. Unemployment Distribution by Age Group over the years")
       .attr("class", "x label");
       
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,"+1.2*height/2+")")
      .call(yAxis2)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Records (Dots)");
      
   svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate("+width/2+","+1.2*height/2+")")
      .style("fill","purple")
      .call(yAxis22)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 30)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill","purple")
      .text("% of Total Unemployment (Lines)");
           
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+1.1*height+")")
          .call(xAxis2);
  
    // adding the x-axis title
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/4)
          .attr("y", 1.1*height+40)
          .style("text-anchor", "middle")
          .text("Chronological Timeline");
  
  svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["<22"]); })
          .attr("id","dot1")
          .style("fill",color1("<22"));
  
   svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["22-24"]); })
          .attr("id","dot2")
          .style("fill", color1("22-24"));
  
    svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["25-34"]); })
          .attr("id","dot3")
          .style("fill", color1("25-34"));
  
     svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["35-44"]); })
          .attr("id","dot4")
          .style("fill", color1("35-44"));
  
       svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["45-54"]); })
          .attr("id","dot5")
          .style("fill", color1("45-54"));
  
         svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["55-59"]); })
          .attr("id","dot6")
          .style("fill", color1("55-59"));
  
           svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d["60-64"]); })
          .attr("id","dot7")
          .style("fill", color1("60-64"));
  
             svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",5)
          .attr("cx", function(d) {
          	return x1(d["Date"]); 
          })
          .attr("cy", function(d) {return 1.21*height/2 + y22(d[">=65"]); })
          .attr("id","dot8")
          .style("fill", color1(">=65"));
  
    svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line1)
          .style("stroke",color1("<22"))
          .attr("id","line1");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line2)
          .style("stroke",color1("22-24"))
          .attr("id","line2");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line3)
          .style("stroke",color1("25-34"))
          .attr("id","line3");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line4)
          .style("stroke",color1("35-44"))
          .attr("id","line4");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line5)
          .style("stroke",color1("45-54"))
          .attr("id","line5");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line6)
          .style("stroke",color1("55-59"))
          .attr("id","line6");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line7)
          .style("stroke",color1("60-64"))
          .attr("id","line7");
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line8)
          .style("stroke",color1(">=65"))
          .attr("id","line8");
  
     svg.selectAll(".legend")
  	.data(ageArray)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", 1.3*width/2)
  	.attr("y", function(d) {return 1.2*height/2 + 22*(1 + 
            ageArray.indexOf(d));})
  	.attr("width", 90)
  	.attr("height", 22)
  	.style("fill", function(d) {return color1(d);})
        .on("click", function(d){
            if (ageArray.indexOf(d) === 0) {
		// Determine if current line is visible
		var active1   = line1.active ? false : true,
		  newOpacity1 = active1 ? 0 : 1;
		// Hide or show the elements
		d3.select("#line1").style("opacity", newOpacity1);
                d3.selectAll("#dot1").style("opacity", newOpacity1);
		// Update whether or not the elements are active
		line1.active = active1;
                dot1.active=active1;
            }
            if (ageArray.indexOf(d) === 1) {
                var active2   = line2.active ? false : true,
		  newOpacity2 = active2 ? 0 : 1;
		d3.select("#line2").style("opacity", newOpacity2);
                d3.selectAll("#dot2").style("opacity", newOpacity2);
		line2.active = active2;
                //dot2.active=active2;
            }
            if (ageArray.indexOf(d) === 2) {
                var active3   = line3.active ? false : true,
		  newOpacity3 = active3 ? 0 : 1;
		d3.select("#line3").style("opacity", newOpacity3);
                d3.selectAll("#dot3").style("opacity", newOpacity3);
		line3.active = active3;
                dot3.active=active3;
            }
            if (ageArray.indexOf(d) === 3) {
                var active4   = line4.active ? false : true,
		  newOpacity4 = active4 ? 0 : 1;
		d3.select("#line4").style("opacity", newOpacity4);
                d3.selectAll("#dot4").style("opacity", newOpacity4);
		line4.active = active4;
                dot4.active=active4;
            }
            if (ageArray.indexOf(d) === 4) {
                var active5   = line5.active ? false : true,
		  newOpacity5 = active5 ? 0 : 1;
		d3.select("#line5").style("opacity", newOpacity5);
                d3.selectAll("#dot5").style("opacity", newOpacity5);
		line5.active = active5;
                dot5.active=active5;
            }
            if (ageArray.indexOf(d) === 5) {
                var active6   = line6.active ? false : true,
		  newOpacity6 = active6 ? 0 : 1;
		d3.select("#line6").style("opacity", newOpacity6);
                d3.selectAll("#dot6").style("opacity", newOpacity6);
		line6.active = active6;
                dot6.active=active6;
            }
            if (ageArray.indexOf(d) === 6) {
                var active7   = line7.active ? false : true,
		  newOpacity7 = active7 ? 0 : 1;
		d3.select("#line7").style("opacity", newOpacity7);
                d3.selectAll("#dot7").style("opacity", newOpacity7);
		line7.active = active7;
                dot7.active=active7;
            }
            if (ageArray.indexOf(d) === 7) {
                var active8   = line8.active ? false : true,
		  newOpacity8 = active8 ? 0 : 1;
		d3.select("#line8").style("opacity", newOpacity8);
                d3.selectAll("#dot8").style("opacity", newOpacity8);
		line8.active = active8;
                dot8.active=active8;
            }
            })
            .style("font-size", "20px") ;
    
  /*The "#" here in identifying id's of different lines/circles are what 
   * make me decide to hard code for the second graph instead of using a more 
   * generic code. If not hard coding, it would be hard to concatenate string 
   * with double quotes and "#" sign. */
  	
  /*For some reason, the first legend for "<22" is not showing on the webpage,
   * and I can't figure out why. It took me a long time to  try to debug.*/      
   svg.selectAll(".legendText")
   	.data(ageArray)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",1.3*width/2+46)
   	.attr("y",function(d) {return 1.2*height/2 +35 + 22*ageArray.indexOf(d);})
        .style("text-anchor","middle")
   	.text(function(d) {return d;});

   svg.append("text")
       .attr("x", 1.3*(width / 2)+46)             
       .attr("y", 1.2*height/2-5)
       .attr("text-anchor", "middle")  
       .style("font-size", "15px")  
       .style("fill","green")
       .text("Click on Legends to Hide/Show corresponding Dots and Lines :)")

  y3.domain([0, d3.max(data, function(d) { 
          return d["MALE%"]; 
          })]);
      
  x3.domain(d3.extent(data, function(d) {
      return d["Date"];
  }));
  
  y33.domain([0,d3.max(data, function(d) {
          return d["Arts, Entertainment & Recreation"];
  })]);
  
  x4.domain(d3.extent(data, function(d) {
      return d["MALE"];
  }));
  
  y4.domain([0,d3.max(data, function(d) {
          return d["Arts, Entertainment & Recreation"];
  })]);
  
  //Third graph's axes  
    svg.append("text")
       .attr("x", (width / 4))             
       .attr("y", 7.5*margin.top  + height)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("3. Male% vs Female% over the years and EVEN MORE..")
       .attr("class", "x label");
       
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,"+1.2*height+")")
      .call(yAxis3)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Unemployment % of each Gender (Lines)");
      
   svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate("+width/2+","+1.2*height+")")
      .style("fill","purple")
      .call(yAxis33)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill","purple")
      .text("Unemployment in Arts, Entertainment & Recreation (Dots)");
           
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+height*1.7+")")
          .call(xAxis2);
  
    // adding the x-axis title
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/4)
          .attr("y", 1.1*height*1.5+80)
          .style("text-anchor", "middle")
          .text("Chronological Timeline");
  
    //Fourth graph's axes  
    svg.append("text")
       .attr("x", (width / 4))             
       .attr("y", 9.5*margin.top  + 1.58*height)
       .attr("text-anchor", "middle")  
       .style("font-size", "18px")  
       .text("4. Arts, Entertainment & Recreation vs Male and Correlation!")
       .attr("class", "x label");
       
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,"+1.8*height+")")
      .call(yAxis4)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Unemployment in Arts, Entertainment & Recreation");
           
  svg.append("g")
          .attr("class","x axis")
          .attr("transform","translate(0,"+height*2.3+")")
          .call(xAxis4);
  
    // adding the x-axis title
  svg.append("text")
          .attr("class", "x label")
          .attr("x", width/4)
          .attr("y", 2.3*height+40)
          .style("text-anchor", "middle")
          .text("Unemploymnet in Male");
    
    svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", lineM)
          .style("stroke","red");
  
    svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", lineF)
          .style("stroke","green")
          .attr("id","lineF");
  
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("r",6)
            .attr("cx", function(d) { return x3(d["Date"]); })
            .attr("cy", function(d) { return 2.405*height/2+y33(d["Arts, Entertainment & Recreation"]); })
            .attr("id","graph3")
            .style("fill","purple")
            .style("opacity",0);

  svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.5)
          .attr("y", 2.5*height/2+48)
          .style("text-anchor", "middle")
          .style("font-size","20px")
          .style("fill", "red")
          .text("Male");
 
  svg.append("text")
          .attr("class", "x label")
          .attr("x",width*0.5)
          .attr("y", 2.5*height/2+74)
          .style("text-anchor","middle")
          .style("font-size", "20px")
          .style("fill","green")
          .text("Female")
          .attr("id","female");
  
    svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.6-40)
          .attr("y", 2.5*height/2+96)
          .style("text-anchor", "right")
          .style("font-size","20px")
          .style("fill", "purple")
          .on("click", function(){
		// Determine if current line is visible
		var active   = lineF.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.select("#lineF").style("opacity", newOpacity);
                d3.select("#female").style("opacity", newOpacity);
                d3.selectAll("#graph3").style("opacity",1-newOpacity);
		// Update whether or not the elements are active
		lineF.active = active;
            })
          .text("Click to Hide Female line and Show Unemployment");
  
      svg.append("text")
          .attr("class", "x label")
          .attr("x", width*0.6-40)
          .attr("y", 2.5*height/2+118)
          .style("text-anchor", "right")
          .style("font-size","20px")
          .style("fill", "purple")
          .on("click", function(){
		// Determine if current line is visible
		var active   = lineF.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.select("#lineF").style("opacity", newOpacity);
                d3.select("#female").style("opacity", newOpacity);
                d3.selectAll("#graph3").style("opacity",1-newOpacity);
		// Update whether or not the elements are active
		lineF.active = active;
            })
          .text("in 'Arts, Entertainment & Recreation'");

       svg.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("r",function(d) { return d["MALE%"]/6;})
          .attr("cx", function(d) {
          	return x4(d["MALE"]); 
          })
          .attr("cy", function(d) {return 3.63*height/2 + y4(d["Arts, Entertainment & Recreation"]); })
          .style("fill", function(d) {return color4(d["MALE%"]);});
 
});

function type(d) {
  d["Total"] = +d["Total"]; //Convert data to numbers
  d["<22"] = +d["<22"];
  d["22-24"] = +d["22-24"];
  d["25-34"] = +d["25-34"];
  d["35-44"] = +d["35-44"];
  d["45-54"] = +d["45-54"];
  d["55-59"] = +d["55-59"];
  d["60-64"] = +d["60-64"];
  d[">=65"] = +d[">=65"];
  d["<22%"] = +d["<22%"];
  d["22-24%"] = +d["22-24%"];
  d["25-34%"] = +d["25-34%"];
  d["35-44%"] = +d["35-44%"];
  d["45-54%"] = +d["45-54%"];
  d["55-59%"] = +d["55-59%"];
  d["60-64%"] = +d["60-64%"];
  d[">=65%"] = +d[">=65%"];
  d["<22C"] = +d["<22C"];
  d["22-24C"] = +d["22-24C"];
  d["25-34C"] = +d["25-34C"];
  d["35-44C"] = +d["35-44C"];
  d["45-54C"] = +d["45-54C"];
  d["55-59C"] = +d["55-59C"];
  d["60-64C"] = +d["60-64C"];
  d[">=65C"] = +d[">=65C"];
  d["Date"] = parseDate(d["Date"]);
  d["Female"] = +d["Female"];
  d["Male"] = +d["Male"];
  d["Female%"] = +d["Female%"];
  d["Male%"] = +d["Male%"];
  d["Arts, Entertainment & Recreation"] = +d["Arts, Entertainment & Recreation"];
  return d;
}


