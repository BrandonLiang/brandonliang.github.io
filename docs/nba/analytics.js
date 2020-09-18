/* global topojson */

//Based on code from: http://bl.ocks.org/mbostock/5126418

//Width and height
var margin = {top: 20, right: 20, bottom: 135, left: 50},
    width = 1500 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var tooltip = d3.select("body").append("div")
	.style("position","absolute") //Floating!
	.style("z-index","10")
        .attr("class","tooltip")
        .style("opacity",0);
        
// Fisheye implementation from github.com/d3/d3-plugins/tree/master/fisheye        
var fisheye = d3.fisheye.circular()
    .radius(200)
    .distortion(50);        
    
var teams = d3.set(),
    colleyScores = d3.set();

var stats = ["FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS/G"];
var translation = ["Field Goal","Field Goal Attempt","Field Goal %","3 Pointer","3 Pointer Attempt","3 Pointer %","2 Pointer","2 Pointer Attempt","2 Pointer %","Free Throw","Free Throw Attempt","Free Throw %","Offensive Rebound","Defensive Rebound","Total Rebound","Assist","Steal","Block","Turnover","Personal Foul","Points Per Game"];

// create svg for histogram.
var svgTeam = d3.select("body").append("svg")
   		.attr("width", width + margin.left + margin.right)
   		.attr("height", height + margin.top + margin.bottom)
   		.append("g")
   		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   		
var svgTeam2 = d3.select("body").append("svg")
   		.attr("width", width + margin.left + margin.right)
   		.attr("height", height + margin.top + margin.bottom)
   		.append("g")
   		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   		   		   		
var colorTeam = d3.scale.category20();
		   
var yTeam = d3.scale.linear()
  		    .range([height,50]);
  		    
var teamArray = [];  		    
   
d3.csv("2014-2015 Team Stats.csv", type, function(data) {

   data.forEach(function(d){
   	teams.add(d.Team);
   	colleyScores.add(d["Colley Rank Score"]);
   });
   
   teams.remove("Team");
   teams.remove("League Average");
   var teamsArray = teams.values(),
       colleyScoreArray = colleyScores.values();
       
   teamArray = teamsArray;    
   
   var min = d3.min(colleyScoreArray),
       max = d3.max(colleyScoreArray),
       median = d3.median(colleyScoreArray);
           
   yTeam.domain([min,max]);
   
   var colleyValues = [];
   colleyValues.push(min);
   colleyValues.push(median);
   colleyValues.push(max);
   
   // create function for x-axis mapping.
   var xTeam = d3.scale.ordinal();
   xTeam = d3.scale.linear();
   
   //default
   //xTeam.domain(["-","Power Ranking","--"]).rangePoints([0,width-180]);
   xTeam.domain([min,max]).range([0,width-180]);
        	  		  
   // add x-axis to the svgTeam.
   svgTeam.append("g").attr("class", "xaxis")
                      .attr("transform","translate(0,"+height+")")
            	      .call(d3.svg.axis().scale(xTeam).orient("bottom"));
   
   // add y-axis to the svgTeam.   
   svgTeam.append("g").attr("class","yaxis")
   	    .attr("transform","translate(0,0)")
   	    .call(d3.svg.axis().scale(yTeam).tickValues(colleyValues).orient("left"));
   
   svgTeam.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Team Colley Rank Score");
    
   svgTeam.append("text")
   .attr("class","title")
   .attr("text-anchor","end")
   .attr("x",width)
   .attr("y",0)
   .text("NBA Team __ vs Colley Rank Score"); 
         
   var myCircles = svgTeam.selectAll(".circle")
   	  .data(data)
   	  .enter()
   	  .append("circle")
   	  .attr("class","circle")
   	  .attr("cx",function(d) { return xTeam(d["Colley Rank Score"]);})
   	  .attr("cy",function(d) { return yTeam(d["Colley Rank Score"]);})
   	  .attr("r",10)
   	  .style("fill", function(d) {return colorTeam(d.Team);})
   	  .on("mouseover", function(d) {
   	  	tooltip.transition()
   	  	       .duration(200)
   	  	       .style("opacity",0.9);
   	  	tooltip.html("Team: "+d.Team + " Colley Rank Score: "+d["Colley Rank Score"])
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");
   	  })
   	  .on("mouseout",function(d) {
   	  	tooltip.transition()
   	  	       .duration(500)
   	  	       .style("opacity",0);
   	  }); 
   
  //Fisheye Implementation from github.com/d3/d3-plugins/tree/master/fisheye
  /*
  svgTeam.on("mousemove",function(){
  	fisheye.focus(d3.mouse(this));
  	svgTeam.selectAll(".circle").each(function(d) { d.fisheye = fisheye(d); })
      		.attr("cx", function(d) { return d.fisheye.x - d.x; })
      		.attr("cy", function(d) { return d.fisheye.y - d.y; })  	
      		.attr("r", function(d) { return d.fisheye.z * d.r; });
  });
  */
  
  svgTeam.selectAll(".legendText")
   	.data(stats)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",width-60)
   	.attr("y",function(d) {return height-88-18*stats.indexOf(d);})  
   	.style("text-anchor", "middle") 	
   	.text(function(d) {return translation[stats.indexOf(d)];})
        .on("click", function(d) {return teamGraph(d);});

  function teamGraph(currentStats) {
    	svgTeam.selectAll(".title").remove();
    	svgTeam.selectAll(".xlabel").remove(); 
    	svgTeam.selectAll(".xaxis").remove();
    	//svgTeam.selectAll(".circle").remove();
    	
    	var max = 0;
    	var min = 10000;  
  	data.forEach(function(d){ // There exists a bug in d3.extent and max and min where 99.4>110
  		if (d[currentStats] > 1) {
			if (Math.round(d[currentStats]) >= max)
				max = d[currentStats];
			if (Math.round(d[currentStats]) <= min)
				min = d[currentStats];
		} else {
			if (d[currentStats] >= max)
				max = d[currentStats];
			if (d[currentStats] <= min)
				min = d[currentStats];
		}
   	});
   	

   	xTeam = d3.scale.linear();
   	xTeam.domain([min,max]);
   	xTeam.range([0,width-180]);

   	svgTeam.append("g").attr("class","xaxis")
          .attr("transform","translate(0,"+height+")")
          .call(d3.svg.axis().scale(xTeam).orient("bottom"));  
         
        /*  
   	svgTeam.selectAll(".circle")
   	  .data(data)
   	  .enter()
   	  .append("circle")
   	  .attr("class","circle")
   	  .attr("cx",function(d) {return xTeam(d[currentStats]);})
   	  .attr("cy",function(d) { return yTeam(d["Colley Rank Score"]);})
   	  .attr("r",10)
   	  .style("fill", function(d) {return colorTeam(d.Team);})
   	  .on("mouseover", function(d) {
   	  	tooltip.transition()
   	  	       .duration(200)
   	  	       .style("opacity",0.9);
   	  	tooltip.html("Team: "+d.Team + " "+translation[stats.indexOf(currentStats)]+": "+d[currentStats])
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");
   	  })
   	  .on("mouseout",function(d) {
   	  	tooltip.transition()
   	  	       .duration(500)
   	  	       .style("opacity",0);
   	  });             	       
   	  */
   	  
   	myCircles.transition()   //Transition!
   		 .duration(500)
   		 .attr("cx",function(d) {return xTeam(d[currentStats]);})
   		 .attr("r",10)
   		    	  .on("mouseover", function(d) {
   	  			tooltip.transition()
   	  	       			.duration(200)
   	  	       			.style("opacity",0.9);
   	  			tooltip.html("Team: "+d.Team + " "+translation[stats.indexOf(currentStats)]+": "+d[currentStats])
   	  	       			.style("left",(d3.event.pageX) + "px")
   	  	       			.style("top",(d3.event.pageY - 28) + "px");
   	  			})
   	  		.on("mouseout",function(d) {
   	  			tooltip.transition()
   	  	       			.duration(500)
   	  	       			.style("opacity",0);
   	  		}); 
   	
   	svgTeam.append("text")
    	 .attr("class", "xlabel")
    	 .attr("text-anchor", "end")
    	 .attr("x", width-130)
    	 .attr("y", height - 6)
    	 .text(translation[stats.indexOf(currentStats)]);
    	
        svgTeam.append("text")
   	 .attr("class","title")
   	 .attr("text-anchor","end")
   	 .attr("x",width)
   	 .attr("y",0)
   	 .text("NBA Team "+translation[stats.indexOf(currentStats)]+" vs Colley Rank Score"); 
    	 
  }
    
});
   
d3.csv("2014-2015 Team Stats Z-Score.csv", type, function(data) {
	translation.push("Colley Rank Score");
	
	var yTeam2 = d3.scale.linear();
	yTeam2.domain([-3,3]).range([height,50]);
	var xTeam2 = d3.scale.ordinal();
	xTeam2.domain(translation).rangePoints([0,width-180]);
	
	// add x-axis to the svgTeam.
   	svgTeam2.append("g").attr("class", "xaxis2")
                      .attr("transform","translate(0,"+height+")")
            	      .call(d3.svg.axis().scale(xTeam2).tickValues(translation).orient("bottom"))
            	      .selectAll("text")
            	      .attr("y",28)
                      .attr("x",-46)
                      .style("text-anchor","middle")
                      .attr("transform","rotate(-45)");;
   
   	// add y-axis to the svgTeam.   
   	svgTeam2.append("g").attr("class","yaxis2")
   	    .attr("transform","translate(0,0)")
   	    .call(d3.svg.axis().scale(yTeam2).tickValues(["-3","-2","-1","0","1","2","3"]).orient("left").ticks(5));

   	// add y-axis to the svgTeam.   
   	svgTeam2.append("g").attr("class","yaxis3")
   	    .attr("transform","translate(0,"+(width-180)+")")
   	    .call(d3.svg.axis().scale(yTeam2).tickValues(["-3","-2","-1","0","1","2","3"]).orient("left").ticks(5));
   
   	svgTeam2.append("text")
    	.attr("class", "y label")
    	.attr("text-anchor", "end")
    	.attr("y", 6)
    	.attr("dy", ".75em")
    	.attr("transform", "rotate(-90)")
    	.text("Z-Score");
    
   	svgTeam2.append("text")
   	.attr("class","title")
   	.attr("text-anchor","end")
   	.attr("x",width)
   	.attr("y",0)
   	.text("NBA Team Performance Trend and Comparison in All Categories via Z-Score"); 
   	
   	var teamMapping = {};
  	
   	function teamStats(element,index,array){
   		var valueline = d3.svg.line()
   			.interpolate("basis")
   			//.attr("class","valueline")
    			.x(function(d) { return xTeam2(d.Category); })
    			.y(function(d) { return yTeam2(Math.round(d[element]*100)/100); });
    		teamMapping[element] = valueline;
    	}
    	
    	teamArray.forEach(teamStats);
    	
    	function drawLine(element,index,array){
    		//if (element == "GSW") {
    		svgTeam2.append("path")
      		.datum(data)
      		.attr("class", "valueline")
      		.attr("d", teamMapping[element])
      		.style("stroke",colorTeam(element))
      		.style("opacity",0.25)
      		.style("stroke-width",2)
      		.attr("id","team"+element)
   	  	.on("click",function(d) {
   	  			var current = document.getElementById("team"+element);
   	  			var active = current.active ? false: true;
   	  			console.log(active);
   	  			if (!active) {
   	  				svgTeam2.selectAll("#team"+element).style("opacity",1.15);
   	  				svgTeam2.selectAll("#team"+element).style("stroke-width",8);
   	  			} else {
   	  				svgTeam2.selectAll("#team"+element).style("opacity",0.2);
   	  				svgTeam2.selectAll("#team"+element).style("stroke-width",2);
   	  			}
   	  			document.getElementById("team"+element).active = active;
   	  	})      		
      		.on("mouseover", function(d) {
   	  			tooltip.transition()
   	  	       			.duration(200)
   	  	       			.style("opacity",0.9);
   	  			tooltip.html("Team: "+element + " ")
   	  	       			.style("left",(d3.event.pageX) + "px")
   	  	       			.style("top",(d3.event.pageY - 28) + "px");
   	  	       		svgTeam2.selectAll(".valueline").style("opacity",0.15);
   	  	       		svgTeam2.selectAll("#team"+element).style("opacity",1.15);
   	  	       		svgTeam2.selectAll("#team"+element).style("stroke-width",8);
   	  			})
   	  	.on("mouseout",function(d) {
   	  			tooltip.transition()
   	  	       			.duration(500)
   	  	       			.style("opacity",0);
   	  	       		svgTeam2.selectAll(".valueline").style("opacity",0.2);
   	  	       		svgTeam2.selectAll(".valueline").style("stroke-width",2);
   	  	});  	
      		//}
    	}
    	
    	teamArray.forEach(drawLine);
});
     
function type(d) {
  //Convert data to numbers
  /*
  d.FG = +d.FG;
  d.FGA = +d.FGA;
  //d.FG% = +d.FG%;
  d.3P = +d.3P;
  d.3PA = +d.3PA;
  d.3P% = +d.3P%;
  d.2P = +d.2P;
  d.2PA = +d.2PA;
  d.2P% = +d.2P%;
  d.FT = +d.FT;
  d.FTA = +d.FTA;
  d.FT% = +d.FT%;
  d.ORB = +d.ORB;
  d.DRB = +d.DRB;
  d.TRB = +d.TRB;
  d.AST = +d.AST;
  d.STL = +d.STL;
  d.BLK = +d.BLK;
  d.TOV = +d.TOV;
  d.PF = +d.PF;
  d.PTS = +d.PTS;
  d.PTS/G = +d.PTS/G;
  */
  //d["Colley Rank Score"] = +d["Colley Rank Score"];
  //d["Colley Rank"] = +d["Colley Rank"]; 
  return d;
}