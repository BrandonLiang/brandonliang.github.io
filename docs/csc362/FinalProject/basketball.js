// Force-Directed Graph; source code from http://bl.ocks.org/mbostock/4062045
        
//Zoom and Drag Source Code: bl.ocks.org/mbostock/6123708
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
    
var zoom2 = d3.behavior.zoom()
    .scaleExtent([1,10])
    .on("zoom",zoomed2);
    
var zoom3 = d3.behavior.zoom()
    .scaleExtent([1,10])
    .on("zoom",zoomed3);    

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);     

var width = 490,
    height = 510,
    radius = 6,
    marginLeft = 20,
    marginRight = 20,
    marginBottom = 20,
    marginTop = 20,
    clicked = false;
    
var translation = d3.map(); // translation for Basketball Stats from abbreviation to full stats term

translation.set("G","Games Played");
translation.set("GS","Games Started");
translation.set("MP","Minutes Played");
translation.set("FG","Field Goal");
translation.set("FGA","Field Goal Attempted");
translation.set("FGPercent","Field Goal %");
translation.set("3P","3-Pointer");
translation.set("3PA","3-Pointer Attempted");
translation.set("2P","2-Pointer");
translation.set("2PA","2-Pointer Attempted");
translation.set("2PPercentage","2-Pointer %");
translation.set("eFGPercent","Effective FieldGoal %");
translation.set("FT","Free Throw");
translation.set("FTA","Free Throw Attempted");
translation.set("FTPercent","Free Throw %");
translation.set("ORB","Offensive Rebound");
translation.set("DRB","Defensive Rebound");
translation.set("TRB","Total Rebound");
translation.set("AST","Assist");
translation.set("STL","Steal");
translation.set("BLK","Block");
translation.set("TOV","Turnover");
translation.set("PF","Personal Foul");
translation.set("PTS","Points/Game");

//var color = d3.scale.category20();
var color = d3.scale.ordinal().domain(["Team","C","PF","SF","SG","PG"]).range(["#e6ab02","red","blue","green","black","purple"]);

var force = d3.layout.force()
    .charge(-115)
    .linkDistance(35)
    .size([width, height]);
    
var safety = 0;

var select = d3.select("body")
    	.append("div")
    	.append("select");
    	

var selectX = d3.select("body")
		.append("div")
		.append("select");

var selectY = d3.select("body")
		.append("div")
		.append("select");
		    	
var tooltip1 = d3.select("body").append("div")
	//.style("position","absolute")  //Not Floating!
	.style("z-index","10")
        .attr("class","tooltip")
        .style("opacity",0);		

var statsById = d3.map(),
    statsByIdX = d3.map(),
    statsByIdY = d3.map(),
    teamById = d3.map(),
    playerById = d3.map(),
    newStat = d3.map()
    nodeMax = d3.map()
    playerToStats = d3.map(),
    players = d3.set(),
    playerArray = [],
    twoStats = d3.map(),
    zScoreTotalList = [],
    zScoreTotalMap = d3.map();  

/*    
var drag = force.drag()
    .on("dragstart", dragstart); 
    */

var svg = d3.select("body").append("svg")
    .attr("width", width+marginLeft+marginRight)
    .attr("height", height+marginBottom+marginTop)
    .attr("align","left")
    .call(zoom);  
    
var svg2 = d3.select("body").append("svg")
   		.attr("width", width+marginLeft+marginRight)
   		.attr("height", height+marginBottom+marginTop)
   		.attr("align","right")
   		.call(zoom2);
   		
var tooltip3 = d3.select("body").append("div")
	//.style("position","absolute")  //Not Floating!
	.style("z-index","10")
        .attr("class","tooltip")
        .style("opacity",0);  
         		
var svg3 = d3.select("body").append("svg")
   		.attr("width", 2*width+marginLeft+marginRight)
   		.attr("height", height+marginBottom+marginTop)
   		.append("g")
                .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
   		.call(zoom3);    		  		  		
		
var x2 = d3.scale.linear().range([marginLeft, marginLeft+width]),
    y2 = d3.scale.linear().range([height+marginBottom,marginBottom]),
    x3 = d3.scale.linear().range([0,2*width-100]),
    y3 = d3.scale.ordinal().domain(["C","PF","SF","SG","PG"]).rangeBands([height,0]);  		   
    
var container = svg.append("g"); 
var container2 = svg2.append("g"); 
var container3 = svg3.append("g");

var statsByIdDup = d3.set(),
    statsList = []; 

var tooltip2 = d3.select("body").append("div")
	.style("position","absolute") //Floating!
	.style("z-index","10")
	.attr("class","tolltip")
	.style("opacity",0);   

// Dispatch Event Source Code: bl.ocks.org/mbostock/5872848
var dispatchStatsX = d3.dispatch("load","statsXChange");
var dispatchStatsY = d3.dispatch("load","statsYChange");
var dispatchStats = d3.dispatch("load","statsChange");

d3.csv("playerStats.csv",function(data){
  data.forEach(function(d){
  	if (d.stats != "Player" && d.stats != "Tm" && d.stats != "Pos") {
  		statsById.set(d.stats,d.stats);
  		statsByIdX.set(d.stats,d.stats);
  		statsByIdY.set(d.stats,d.stats);
  	}
  });  
  statsByIdDup = statsById.keys();
  //statsByIdX = statsById;
  //statsByIdY = statsById;
  statsById.set("Choose Stats for Node Graph","Choose Stats for Node Graph"); 
  statsByIdX.set("Select Stats for X-Axis","Select Stats for X-Axis");
  statsByIdY.set("Select Stats for Y-Axis","Select Stats for Y-Axis");

});

d3.json("teamPlayerStats.json", function(error,graph) {  

  if (error) throw error;
  
  dispatchStats.load(statsById);
  dispatchStats.statsChange(statsById.get("Choose Stats for Node Graph"));
  
  dispatchStatsX.load(statsByIdX);
  dispatchStatsX.statsXChange(statsByIdX.get("Select Stats for X-Axis"));
  dispatchStatsY.load(statsByIdY);
  dispatchStatsY.statsYChange(statsByIdY.get("Select Stats for Y-Axis"));
  
  statsByIdDup.forEach(function(d){
  	var max = 0;
  	graph.nodes.forEach(function(e){
  		if (e[d] >= max)
  			max = e[d];
  	});
  	nodeMax.set(d,max);
  });
  
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .gravity(1.2)
      .start();

  //speed up the ticking process. Source code form: stackoverflow.com/questions/13463053/calm-down-initial-tick-of-a-force-layout      
  while(force.alpha() > 0.05) { 
    force.tick();
    if(safety++ > 500) {
      break;// Avoids infinite looping in case this solution was a bad idea
    }
  }

  var link = container.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke",function(d) {return color(d["Pos"]);})
      .attr("id", function(d) { return d.source["Player"];});

  var node = container.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) {if (d.Pos == "Team") return 8.5; else return 5.5;})
      .style("stroke-width",1)
      .style("stroke","brown")
      .style("fill",function(d) {return color(d["Pos"]);})
      .attr("id", function(d) {return d["Player"];})
      .on("mouseover", function(d) {
      		d3.selectAll(".node").transition().duration(200).style("opacity",0.3);
      		d3.selectAll(".link").transition().duration(200).style("opacity",0.3);
      		container2.selectAll(".scatter").transition().duration(200).style("opacity",0.3);
      		//d3.selectAll("#"+d["Player"]
      		container2.selectAll("#"+d.Player).attr("r", 10).style("opacity",1).style("stroke-width",2).style("stroke","black");
      		container.selectAll("#"+d.Player).attr("r", function(d) {if (d.Pos == "Team") return 10; else return 7.5;}).style("opacity",1).style("stroke-width",2).style("stroke",function(d) {return color(d.Pos);});
        	var text = "";
        	if (d["Pos"] != "Team"){
        		text = "Player: "+d["Player"]+" Team: "+d["Tm"]+" Position: "+d.Pos;
        	} else {
        		if (d.Tm == "TOT")
        			var text = "Team: Players That Were Traded";
        		else
        			var text = "Team: "+d.Tm;
        	}
   	  	tooltip1.transition()
   	  	       .duration(200)
   	  	       .style("opacity",0.9);
   	  	tooltip1.html(text)
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");
   	  	tooltip2.transition()
   	  	       .duration(200)
   	  	       .style("opacity",0.9);
   	  	tooltip2.html(text)
   	  	       .style("fill","grey")
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");   	  	       
      })
      .on("mouseout",function(d) {
      		d3.selectAll(".node").transition().duration(200).attr("r", function(d) {if (d.Pos == "Team") return 8.5; else return 5.5;}).style("stroke-width",1).style("stroke","brown").style("opacity",1);
      		d3.selectAll(".link").transition().duration(200).style("opacity",1);
      		container2.selectAll(".scatter").transition().duration(200).attr("r",3).style("opacity",1);
        	var text = "";
        	if (d["Pos"] != "Team"){
        		text = "Player: "+d["Player"]+" Team: "+d["Tm"]+" Position: "+d.Pos;
        	} else {
        		if (d.Tm == "TOT")
        			var text = "Team: Players That Were Traded";
        		else
        			var text = "Team: "+d.Tm;
        	}
   	  	tooltip1.transition()
   	  	       .duration(200)
   	  	       .style("opacity",0);
   	  	tooltip1.html(text)
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");
   	  	tooltip2.transition()
   	  	       .duration(200)
   	  	       .style("opacity",0);
   	  	tooltip2.html(text)
   	  	       .style("fill","grey")
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");   	  	       
      });;

  force.on("tick", tick);
  
  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })    
    // Bound check source code from: http://bl.ocks.org/mbostock/1129492;
    node.attr("cx", function(d) { return Math.max(radius, Math.min(width - radius, d.x)); }) 
      	.attr("cy", function(d) { return Math.max(radius, Math.min(height - radius, d.y)); });
  };
  
  // Dispatch Event Source Code: bl.ocks.org/mbostock/5872848  
  dispatchStats.load(statsById);
  dispatchStats.statsChange(statsById.get("All"));
  dispatchStatsX.load(statsByIdX);
  dispatchStatsX.statsXChange(statsByIdX.get("All"));
  dispatchStatsY.load(statsByIdY);
  dispatchStatsY.statsYChange(statsByIdY.get("All"));	  		             	
});

d3.csv("leagues_NBA_2015_per_game_per_game.csv", function(error, data){
	if (error) throw error; 
	
	
	x2.domain(d3.extent(data,function(d){
		return Math.ceil(d.PTS);
	}));
	
	y2.domain(d3.extent(data,function(d){
		return Math.ceil(d.PTS);
		
	}));
	
	container2.append("g")
		.attr("class","xaxis2")
		.call(d3.svg.axis()
			    .scale(x2)
			    .orient("bottom"))
			    .attr("transform","translate(0,"+(height+marginBottom)+")");
			    
	container2.append("g")
		.attr("class","yaxis2")
		.call(d3.svg.axis()
			    .scale(y2)
			    .orient("right"))
			    .attr("transform","translate(12,0)")
		.selectAll("text")
		.attr("y",4);   
			    
	svg2.append("g").attr("transform","translate(15,12)")
		.append("text")
		.attr("class","yTitle")
		.attr("text-anchor","left")
		.text("Default: Points/Game");
	
	svg2.append("g").attr("transform","translate(300,12)")
		.append("text")
		.attr("class","title1")
		.attr("text-anchor","middle")
		.text("Stats Comparison of your choice");		
	
	svg2.append("g").attr("transform","translate(385,518)")
		.append("text")
		.attr("class","xTitle")
		.attr("text-anchor","right")
		.text("Default: Points/Game");	 

	var circles = container2.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("r",3)
		.attr("class","scatter")
		.attr("cx",function(d) {return x2(d.PTS);})
		.attr("cy",function(d) {return y2(d.PTS);})
		.style("stroke","silver")
		.style("fill",function(d) {return color(d.Pos);})
		.attr("id",function(d) {return d.Player;})
		.on("mouseover",function(d){
		if (!clicked){
			circles.style("opacity",0.3);
			d3.select(this).transition().duration(200).attr("r",10).style("opacity",1);
			d3.selectAll(".node").style("opacity",0.3);
			d3.selectAll(".link").style("opacity",0.3);
			container.selectAll("#"+d.Player).attr("r",function(d) {if (d.Pos == "Team") return 10; else return 7.5;}).style("opacity",1);}
			var text = "";
			text = text + "Player: "+d.Player + " Team: "+d.Tm+ " Position: "+d.Pos+" Points/Game: "+d.PTS;
			twoStats.set("x","PTS");
			twoStats.set("y","PTS");
			tooltip1.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  		tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
   	  		tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  		tooltip2.html(text)
   	  	       		.style("fill","grey")
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");  
		})
		.on("mouseout",function(d){
		if (!clicked){
			var text = "";
			circles.attr("r",3).style("opacity",1);	
			d3.selectAll(".node").attr("r",function(d) {if (d.Pos == "Team") return 8.5; else return 5.5;}).style("opacity",1);
			d3.selectAll(".link").style("opacity",1);
			tooltip1.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  		tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
   	  		tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  		tooltip2.html(text)
   	  	       		.style("fill","grey")
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px"); 				
		}});
		
});

  // Dispatch Event Source Code: bl.ocks.org/mbostock/5872848
  dispatchStats.on("load.menu", function(statsById) {  
 	select.on("change", function() { dispatchStats.statsChange(statsById.get(this.value)); }); 	
  	select.selectAll("option")
      	.data(statsById.values())
    	.enter().append("option")
      	.attr("value", function(d) { return d; })
      	.text(function(d) { return d; });
  	dispatchStats.on("statsChange.menu", function(stat) {
    		select.property("value", stat);
  	});
  });
  dispatchStats.on("load.bar", function(statsById) {
  	dispatchStats.on("statsChange.bar", function(d) {  
  	var tempStats = d;
  	if (tempStats != "Choose Stats for Node Graph" && tempStats != null){ 	  // null for default setting	
		container.selectAll(".node")
      			.attr("r", function(d) {if (d[tempStats] == null || d.Pos == "Team") {return 11.5;} else { return 1+10*d[tempStats]/nodeMax.get(tempStats);}})
           		.on("mouseover", function(d) {
           		if (!clicked){
      				d3.selectAll(".node").transition().duration(200).style("opacity",0.3);
      				d3.selectAll(".link").transition().duration(200).style("opacity",0.3);
      				d3.selectAll(".scatter").transition().duration(200).attr("r",3).style("opacity",0.2);
      				//d3.selectAll("#"+d["Player"]
      				//d3.select(this).transition().duration(200).attr("r", function(d) {if (d.Pos == "Team") return 11.5; else return 3+10*d[tempStats]/nodeMax.get(tempStats);}).style("stroke-width",2).style("stroke","black");
      				container.selectAll("#"+d.Player).transition().duration(200).attr("r", function(d) {if (d.Pos == "Team") return 11.5; else return 8;}).style("opacity",1).style("stroke-width",2).style("stroke",function(d) {return color(d.Pos);});	
      				container2.selectAll("#"+d.Player).transition().duration(200).attr("r",10).style("opacity",1);}
        			var text = "";
        			if (d["Pos"] != "Team"){
        				text = "Player: "+d["Player"]+" Team: "+d["Tm"]+" Position: "+d.Pos + " "+tempStats+": "+d[tempStats];
        			} else {
        				if (d.Tm == "TOT")
        					var text = "Team: Players That Were Traded";
        				else
        					var text = "Team: "+d.Tm;
        			}
   	  			tooltip1.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  			tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
   	  			tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  			tooltip2.html(text)
   	  	       		.style("fill","grey")
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");   	  	       
      			})
      			.on("mouseout",function(d) {
      			if (!clicked){
      				d3.selectAll(".node").transition().duration(200).attr("r", function(d) {if (d[tempStats] == null || d.Pos == "Team") {return 11.5;} else { return 1+10*d[tempStats]/nodeMax.get(tempStats);}}).style("stroke-width",1).style("stroke","brown").style("opacity",1);
      				d3.selectAll(".link").transition().duration(200).style("opacity",1);
      				d3.selectAll(".scatter").transition().duration(200).attr("r",3).style("opacity",1);
        			var text = "";
        			if (d["Pos"] != "Team"){
        				text = "Player: "+d["Player"]+" Team: "+d["Tm"]+" Position: "+d.Pos + " "+tempStats+": "+d[tempStats];
        			} else {
        				if (d.Tm == "TOT")
        					var text = "Team: Players That Were Traded";
        				else
        					var text = "Team: "+d.Tm;
        			}
   	  			tooltip1.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  			tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
   	  			tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  			tooltip2.html(text)
   	  	       		.style("fill","grey")
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");   	  	       
      			}});	
      	} else {
      		container.selectAll(".node")
      			.attr("r", function(d) {if (d.Pos == "Team") return 11.5; else return 6;})
      			.on("mouseover", function(d) {
      			if (!clicked){
      				d3.selectAll(".node").transition().duration(200).style("opacity",0.3);
      				d3.selectAll(".link").transition().duration(200).style("opacity",0.3);
      				container2.selectAll(".scatter").transition().duration(200).style("opacity",0.3);
      				//d3.selectAll("#"+d["Player"]
      				//container2.select("#"+d.Player).style("opacity",1);
      				//d3.selectAll(".link").select("#"+d.Player).attr("r",8).style("opacity",1);
      				container2.select("#"+d.Player).attr("r", 10).style("opacity",1).style("stroke-width",2).style("stroke","black");
      				
      				//d3.select(this).transition().duration(200).attr("r", function(d) {if (d.Pos == "Team") return 11.5; else return 8;}).style("stroke-width",2).style("stroke","black").style("opacity",1);     	
      				container.selectAll("#"+d.Player).transition().duration(200).attr("r", function(d) {if (d.Pos == "Team") return 11.5; else return 8;}).style("opacity",1).style("stroke-width",2).style("stroke",function(d) {return color(d.Pos);});	}		
        			var text = "";
        			if (d["Pos"] != "Team"){
        				text = "Player: "+d["Player"]+" Team: "+d["Tm"]+" Position: "+d.Pos;
        			} else {
        				if (d.Tm == "TOT")
        					var text = "Team: Players That Were Traded";
        				else
        					var text = "Team: "+d.Tm;
        			}
   	  			tooltip1.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  			tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
   	  			tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  			tooltip2.html(text)
   	  	       		.style("fill","grey")
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");   	  	       
      			})
      			.on("mouseout",function(d) {
      			if (!clicked){
      				d3.selectAll(".node").transition().duration(200).attr("r", function(d) {if (d.Pos == "Team") return 11.5; else return 6;}).style("stroke-width",1).style("stroke","brown").style("opacity",1);
      				d3.selectAll(".link").transition().duration(200).style("opacity",1);
      				d3.selectAll(".scatter").transition().duration(200).attr("r",3).style("opacity",1);
        			var text = "";
        			if (d["Pos"] != "Team"){
        				text = "Player: "+d["Player"]+" Team: "+d["Tm"]+" Position: "+d.Pos;
        			} else {
        				if (d.Tm == "TOT")
        					var text = "Team: Players That Were Traded";
        				else
        					var text = "Team: "+d.Tm;
        			}
   	  			tooltip1.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  			tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
   	  			tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  			tooltip2.html(text)
   	  	       		.style("fill","grey")
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");   	  	       
      			}});
      	}
  	});
  });
  
  // Dispatch Event Source Code: bl.ocks.org/mbostock/5872848
  dispatchStatsX.on("load.menu", function(statsByIdX) {  
 	selectX.on("change", function() { dispatchStatsX.statsXChange(statsByIdX.get(this.value)); }); 	
  	selectX.selectAll("option")
      	.data(statsByIdX.values())
    	.enter().append("option")
      	.attr("value", function(d) {return d;} )
      	.text(function(d) { return d; });
  	dispatchStatsX.on("statsXChange.menu", function(stat) {
    		selectX.property("value", stat);
  	});
  });
  dispatchStatsX.on("load.bar", function(statsByIdX) {
  	  dispatchStatsX.on("statsXChange.bar", function(d) { 
  	  	var tempStats = d;
  	  	if (tempStats != "Select Stats for X-Axis" && tempStats != null){
  	  		d3.csv("leagues_NBA_2015_per_game_per_game.csv", function(error, data){
				if (error) throw error; 
			
				x2.domain(d3.extent(data,function(d){
					return Math.ceil(d[tempStats]);
				}));	
				
				svg2.selectAll(".xTitle").remove();
				
				svg2.append("g").attr("transform","translate(390,518)")
					.append("text")
					.attr("class","xTitle")
					.attr("text-anchor","left")
					.text(translation.get(tempStats));
			
				container2.select(".xaxis2").remove();
			
				container2.append("g")
					.attr("class","xaxis2")
					.call(d3.svg.axis()
			    			.scale(x2)
			    			.orient("bottom"))
			    		.attr("transform","translate(0,"+(height+marginBottom)+")");
			    		
			    	container2.selectAll(".scatter").transition().duration(500)
  	  				.attr("cx",function(d) {return x2(d[tempStats]);});
  	  			container2.selectAll(".scatter")	
  	  				.on("mouseover",function(d){
  	  				if (!clicked){
						container2.selectAll(".scatter").style("opacity",0.3);
						d3.select(this).transition().duration(200).attr("r",10).style("opacity",1);}
						var text = "";
						twoStats.remove("x");
						twoStats.set("x",tempStats);
						text = text + "Player: "+d.Player + " Team: "+d.Tm+ " Position: "+d.Pos+" "+translation.get(tempStats)+": "+d[tempStats]+" "+translation.get(twoStats.get("y"))+": "+d[twoStats.get("y")];
						tooltip1.transition()
   	  	       					.duration(200)
   	  	       					.style("opacity",0.9);
   	  					tooltip1.html(text)
   	  	       					.style("left",(d3.event.pageX) + "px")
   	  	       					.style("top",(d3.event.pageY - 28) + "px");
   	  					tooltip2.transition()
   	  	       					.duration(200)
   	  	       					.style("opacity",0.9);
   	  					tooltip2.html(text)
   	  	       					.style("fill","grey")
   	  	       					.style("left",(d3.event.pageX) + "px")
   	  	       					.style("top",(d3.event.pageY - 28) + "px");  
					})
					.on("mouseout",function(d){
					if (!clicked){
					var text = "";
					container2.selectAll(".scatter").attr("r",3).style("opacity",1);	
					tooltip1.transition()
   	  	       				.duration(200)
   	  	       				.style("opacity",0);
   	  				tooltip1.html(text)
   	  	       				.style("left",(d3.event.pageX) + "px")
   	  	       				.style("top",(d3.event.pageY - 28) + "px");
   	  				tooltip2.transition()
   	  	       				.duration(200)
   	  	       				.style("opacity",0);
   	  				tooltip2.html(text)
   	  	       				.style("fill","grey")
   	  	       				.style("left",(d3.event.pageX) + "px")
   	  	       				.style("top",(d3.event.pageY - 28) + "px"); 				
					}});
  	  							
			});			
  	  	}
  	  });  
  });
  
  dispatchStatsY.on("load.menu", function(statsByIdY) {  
 	selectY.on("change", function() { dispatchStatsY.statsYChange(statsByIdY.get(this.value)); }); 	
  	selectY.selectAll("option")
      	.data(statsByIdY.values())
    	.enter().append("option")
      	.attr("value", function(d) { return d; })
      	.text(function(d) { return d; });
  	dispatchStatsY.on("statsYChange.menu", function(stat) {
    		selectY.property("value", stat);
  	});
  });
  dispatchStatsY.on("load.bar", function(statsByIdY) {
  	dispatchStatsY.on("statsYChange.bar", function(d) {
  		var tempStats = d;
  		if (tempStats != "Select Stats for Y-Axis" && tempStats != null) {
  			d3.csv("leagues_NBA_2015_per_game_per_game.csv", function(error, data){
				if (error) throw error; 
			
				y2.domain(d3.extent(data,function(d){
					return Math.ceil(d[tempStats]);
				}));
				
				svg2.selectAll(".yTitle").remove();
				
				svg2.append("g").attr("transform","translate(15,12)")
					.append("text")
					.attr("class","yTitle")
					.attr("text-anchor","left")
					.text(translation.get(tempStats));
				
				container2.selectAll(".yaxis2").remove();
				
				container2.append("g")
					.attr("class","yaxis2")
					.call(d3.svg.axis()
				    		.scale(y2)
			    			.orient("right"))
			    		.attr("transform","translate(12,0)")
					.selectAll("text")
					.attr("y",4);
					
  				container2.selectAll(".scatter").transition().duration(500)
  					.attr("cy",function(d) {return y2(d[tempStats]);});
  					
  				container2.selectAll(".scatter")	
  	  				.on("mouseover",function(d){
  	  				if (!clicked){
						container2.selectAll(".scatter").style("opacity",0.3);
						d3.select(this).transition().duration(200).attr("r",10).style("opacity",1);}
						var text = "";
						twoStats.remove("y");
						twoStats.set("y",tempStats);
						text = text + "Player: "+d.Player + " Team: "+d.Tm+ " Position: "+d.Pos+" "+translation.get(twoStats.get("x"))+": "+d[twoStats.get("x")]+" "+translation.get(tempStats)+": "+d[tempStats];
						tooltip1.transition()
   	  	       					.duration(200)
   	  	       					.style("opacity",0.9);
   	  					tooltip1.html(text)
   	  	       					.style("left",(d3.event.pageX) + "px")
   	  	       					.style("top",(d3.event.pageY - 28) + "px");
   	  					tooltip2.transition()
   	  	       					.duration(200)
   	  	       					.style("opacity",0.9);
   	  					tooltip2.html(text)
   	  	       					.style("fill","grey")
   	  	       					.style("left",(d3.event.pageX) + "px")
   	  	       					.style("top",(d3.event.pageY - 28) + "px");  
					})
					.on("mouseout",function(d){
					if (!clicked){
					var text = "";
					container2.selectAll(".scatter").attr("r",3).style("opacity",1);	
					tooltip1.transition()
   	  	       				.duration(200)
   	  	       				.style("opacity",0);
   	  				tooltip1.html(text)
   	  	       				.style("left",(d3.event.pageX) + "px")
   	  	       				.style("top",(d3.event.pageY - 28) + "px");
   	  				tooltip2.transition()
   	  	       				.duration(200)
   	  	       				.style("opacity",0);
   	  				tooltip2.html(text)
   	  	       				.style("fill","grey")
   	  	       				.style("left",(d3.event.pageX) + "px")
   	  	       				.style("top",(d3.event.pageY - 28) + "px"); 				
					}});			
			});
  		}
  	});  
  });
  
d3.csv("leagues_NBA_2015_per_game_per_game -- Z-Score.csv", function(error, data){
	if (error) throw error;
	
	var fg = document.getElementById("inputFG");
	var fgValue = fg.value;
	var fgp = document.getElementById("inputFGP");
	var fgpValue = fgp.value;
	var threeP = document.getElementById("input3P");
	var threePValue = threeP.value;	
	var twoP = document.getElementById("input2P");
	var twoPValue = twoP.value;	
	var twoPP = document.getElementById("input2PP");
	var twoPPValue = twoPP.value;
	var efgP = document.getElementById("inputEFGP");
	var efgPValue = efgP.value;	
	var ft = document.getElementById("inputFT");
	var ftValue = ft.value;	
	var ftp = document.getElementById("inputFTP");
	var ftpValue = ftp.value;	
	var orb = document.getElementById("inputORB");
	var orbValue = orb.value;
	var drb = document.getElementById("inputDRB");
	var drbValue = drb.value;		
	var trb = document.getElementById("inputTRB");
	var trbValue = trb.value;	
	var ast = document.getElementById("inputAST");
	var astValue = ast.value;
	var stl = document.getElementById("inputSTL");
	var stlValue = stl.value;	
	var blk = document.getElementById("inputBLK");
	var blkValue = blk.value;	
	var tov = document.getElementById("inputTOV");
	var tovValue = (-1)*tov.value;		
	var pf = document.getElementById("inputPF");
	var pfValue = (-1)*pf.value;
	var pts = document.getElementById("inputPTS");
	var ptsValue = pts.value;	
	
	data.forEach(function(d){
		var sum = 0;
		sum = sum+fgValue*Math.round(100*d.FG)+fgpValue*Math.round(100*d.FGPercent)+threePValue*Math.round(100*d["3P"])+twoPValue*Math.round(100*d["2P"])+twoPPValue*Math.round(100*d["2PPercent"])+efgPValue*Math.round(100*d.eFGPercent)+ftValue*Math.round(100*d.FT)+ftpValue*Math.round(100*d.FTPercent)+orbValue*Math.round(100*d.ORB)+drbValue*Math.round(100*d.DRB)+trbValue*Math.round(100*d.TRB)+astValue*Math.round(100*d.AST)+stlValue*Math.round(100*d.STL)+blkValue*Math.round(100*d.BLK)+pfValue*Math.round(100*d.PF)+ptsValue*Math.round(100*d.PTS)+tovValue*Math.round(100*d.TOV);
		sum = sum / 100;
		zScoreTotalList.push(sum);
		zScoreTotalMap.set(d.Player,sum);
	});
	
	x3.domain(d3.extent(zScoreTotalList));
	
	container3.append("g")
		.attr("class","xaxis3")
		.call(d3.svg.axis()
			    .scale(x3)
			    .orient("bottom"))
			    .attr("transform","translate(10,"+(height)+")");
			    
	container3.append("g")
		.attr("class","yaxis3")
		.call(d3.svg.axis()
			    .scale(y3)
			    .orient("left"))
			    .attr("transform","translate(0,0)")			    
		.selectAll("text")
		.attr("transform","rotate(45)")
		.attr("x",35)
		.attr("y",2)
		.style("fill",function(d) {return color(d);});   
			    
	svg3.append("g").attr("transform","translate(15,12)")
		.append("text")
		.attr("class","yTitle3")
		.attr("text-anchor","left")
		.text("Position");	
		
	svg3.append("g").attr("transform","translate(310,12)")
		.append("text")
		.attr("class","title3")
		.attr("text-anchor","left")
		.text("Player Cluster Graph by Position");	
	
	svg3.append("g").attr("transform","translate(715,500)")
		.append("text")
		.attr("class","xTitle3")
		.attr("text-anchor","right")
		.text("Cluster Score/Indicator");
	
	var positionArray = ["Team","Point Guard","Shooting Guard","Small Forward","Power Forward","Center"];	
 	var posArray = ["Team","PG","SG","SF","PF","C"];
		
  	svg3.selectAll(".legend")
  		.data(posArray)
  		.enter().append("g")
  		.attr("class","legend")
  		.append("rect")
  		.attr("x", 960)
  		.attr("y", function(d) {return 93+40*posArray.indexOf(d);})
  		.attr("width", 60)
  		.attr("height", 40)
  		.style("fill", function(d) {return color(d);});
  	
   	svg3.selectAll(".legendText")
   		.data(posArray)
   		.enter().append("text")
   		.attr("class","legendText")
   		.attr("text-anchor","left")
   		.attr("x",850)
   		.attr("y",function(d){return 120+40*posArray.indexOf(d);})
   		.style("fill",function(d) {return color(d);})
   		.text(function(d) {return positionArray[posArray.indexOf(d)];});		

	var circles3 = container3.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("r",3)
		.attr("class","scatter3")
		.attr("cx",function(d) {return marginLeft+x3(zScoreTotalMap.get(d.Player));})
		.attr("cy",function(d) {return marginBottom+marginTop+12+y3(d.Pos);})
		.style("stroke","silver")
		.style("fill",function(d) {return color(d.Pos);})
		.attr("id",function(d) {return d.Player;})
		.on("mouseover",function(d){
		if (!clicked){
			d3.selectAll(".scatter3").style("opacity",0.2);
			container3.selectAll("#"+d.Player).transition().duration(200).attr("r",6).style("opacity",1);
		}
			var text = "";
			text = text + "Player: "+d.Player+" Cluster Score/Indicator: "+zScoreTotalMap.get(d.Player);
			tooltip3.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  		tooltip3.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");		
		})
		.on("mouseout",function(d){
		if (!clicked){
			d3.selectAll(".scatter3").attr("r",3).style("opacity",1);
			var text = "";
			tooltip3.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  		tooltip3.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
		}});	
	
});  

//Zoom and Drag Source Code: bl.ocks.org/mbostock/6123708
function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function zoomed2() {
  container2.attr("transform","translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function zoomed3() {
  container3.attr("transform","translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}

//Responds to the search box by highlighting the nodes and dots of the searched player
function search() {
    clicked = true;
    var userInput = document.getElementById("targetNode"); 
    d3.selectAll(".node").style("opacity",0.2);
    d3.selectAll(".link").style("opacity",0.2);
    d3.selectAll(".scatter").style("opacity",0.2);
    d3.selectAll(".scatter3").style("opacity",0.2);
    container.selectAll("#"+userInput.value).style("opacity",1).style("stroke-width",2).style("stroke",function(d) {return color(d.Pos);});
    container2.selectAll("#"+userInput.value).attr("r",6).style("opacity",1);
    container3.selectAll("#"+userInput.value).attr("r",6).style("opacity",1);
}

function unhighlight() {
    clicked = false;
    var userInput = document.getElementById("targetNode");
    d3.selectAll(".node").style("opacity",1);
    d3.selectAll(".link").style("stroke-width",1).style("opacity",1);
    d3.selectAll(".scatter").attr("r",3).style("opacity",1);   
    d3.selectAll(".scatter3").attr("r",3).style("opacity",1);    
}

function input() {
d3.csv("leagues_NBA_2015_per_game_per_game -- Z-Score.csv", function(error, data){
	if (error) throw error;
	var fg = document.getElementById("inputFG");
	var fgValue = fg.value;
	var fgp = document.getElementById("inputFGP");
	var fgpValue = fgp.value;
	var threeP = document.getElementById("input3P");
	var threePValue = threeP.value;	
	var twoP = document.getElementById("input2P");
	var twoPValue = twoP.value;	
	var twoPP = document.getElementById("input2PP");
	var twoPPValue = twoPP.value;
	var efgP = document.getElementById("inputEFGP");
	var efgPValue = efgP.value;	
	var ft = document.getElementById("inputFT");
	var ftValue = ft.value;	
	var ftp = document.getElementById("inputFTP");
	var ftpValue = ftp.value;	
	var orb = document.getElementById("inputORB");
	var orbValue = orb.value;
	var drb = document.getElementById("inputDRB");
	var drbValue = drb.value;		
	var trb = document.getElementById("inputTRB");
	var trbValue = trb.value;	
	var ast = document.getElementById("inputAST");
	var astValue = ast.value;
	var stl = document.getElementById("inputSTL");
	var stlValue = stl.value;	
	var blk = document.getElementById("inputBLK");
	var blkValue = blk.value;	
	var tov = document.getElementById("inputTOV");
	var tovValue = (-1)*tov.value;		
	var pf = document.getElementById("inputPF");
	var pfValue = (-1)*pf.value;
	var pts = document.getElementById("inputPTS");
	var ptsValue = pts.value;
	zScoreTotalList = [];
	zScoreTotalMap = d3.map();		
	data.forEach(function(d){
		var sum = 0;
		sum = sum+fgValue*Math.round(100*d.FG)+fgpValue*Math.round(100*d.FGPercent)+threePValue*Math.round(100*d["3P"])+twoPValue*Math.round(100*d["2P"])+twoPPValue*Math.round(100*d["2PPercent"])+efgPValue*Math.round(100*d.eFGPercent)+ftValue*Math.round(100*d.FT)+ftpValue*Math.round(100*d.FTPercent)+orbValue*Math.round(100*d.ORB)+drbValue*Math.round(100*d.DRB)+trbValue*Math.round(100*d.TRB)+astValue*Math.round(100*d.AST)+stlValue*Math.round(100*d.STL)+blkValue*Math.round(100*d.BLK)+pfValue*Math.round(100*d.PF)+ptsValue*Math.round(100*d.PTS)+tovValue*Math.round(100*d.TOV);
		sum = sum / 100;
		zScoreTotalList.push(sum);
		zScoreTotalMap.set(d.Player,sum);
	});
	
	x3.domain(d3.extent(zScoreTotalList));
	
	container3.selectAll(".xaxis3").remove();
	
	container3.append("g")
		.attr("class","xaxis3")
		.call(d3.svg.axis()
			    .scale(x3)
			    .orient("bottom"))
			    .attr("transform","translate(10,"+(height)+")");
	
	container3.selectAll(".scatter3").transition().duration(200)
		.attr("cx",function(d) {return marginLeft+x3(zScoreTotalMap.get(d.Player));});
	
	container3.selectAll(".scatter3")	
		.on("mouseover",function(d){
		if (!clicked){
			d3.selectAll(".scatter3").style("opacity",0.2);
			container3.selectAll("#"+d.Player).transition().duration(200).attr("r",6).style("opacity",1);
		}
			var text = "";
			text = text + "Player: "+d.Player+" Cluster Score/Indicator: "+zScoreTotalMap.get(d.Player);
			tooltip3.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  		tooltip3.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");		
		})
		.on("mouseout",function(d){
		if (!clicked){
			d3.selectAll(".scatter3").attr("r",3).style("opacity",1);
			var text = "";
			tooltip3.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0);
   	  		tooltip3.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
		}});			    
});
}