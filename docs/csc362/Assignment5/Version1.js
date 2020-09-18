// Force-Directed Graph; source code from http://bl.ocks.org/mbostock/4062045

var width = 1300,
    height = 650,
    radius = 6;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-140)
    .linkDistance(30)
    .size([width, height]);
    
var safety = 0;

//Zoom and Drag Source Code: bl.ocks.org/mbostock/6123708
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
    
var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);     
    
var tooltip1 = d3.select("body").append("div")
	//.style("position","absolute") 
	.style("z-index","10")
        .attr("class","tooltip")
        .style("opacity",0);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .call(zoom);
    
var container = svg.append("g");    

var tooltip2 = d3.select("body").append("div")
	.style("position","absolute") //Floating!
	.style("z-index","10")
	.attr("class","tolltip")
	.style("opacity",0);
        
d3.json("CourseList.json", function(error, graph) {
  if (error) throw error;
  
  var groupSet = d3.set(),
      majorMinorSet = d3.set();
  
  graph.nodes.forEach(function(d) {
  	groupSet.add(d.group);
  });
  
  
  graph.links.forEach(function(d) {
  	majorMinorSet.add(d.value);
  });
  
  var groupArray = groupSet.values(),
      majorMinorSetArray = majorMinorSet.values();
      
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .gravity(2)
      .start();

  //speed up the ticking process. Source code form: stackoverflow.com/questions/13463053/calm-down-initial-tick-of-a-force-layout    
  //function speedUp(){   
  while(force.alpha() > 0.05) { 
    force.tick();
    if(safety++ > 500) {
      break;// Avoids infinite looping in case this solution was a bad idea
    }
  }
  //};

  // Drag and stop from bl.ocks.org/norrs/2883411
  var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

 function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
 }

 function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
 }

 function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force does not include the node in its auto positioning stuff
        tick();
        force.resume();
 }

  var link = container.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .style("stroke",function(d) { return color(d.source.group);})
      .call(node_drag)
      .attr("id", function(d) { if (d.source.group == "MajorMinor") {return d.source.group1;} else {return d.source.group;}});

  var node = container.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d){if (d.group == "MajorMinor") {return 7;} else {return 3.5;}})
      .style("stroke","silver")
      .style("fill", function(d) { return color(d.group); })
      .call(node_drag)
      .attr("id", function(d) { if (d.group == "MajorMinor") {return d.group1;} else {return d.group;}})
      .on("mouseover", function(d) {
        	var text = "";
        	if (d.group == "MajorMinor"){
        		text = ""+d.group+": "+d.name;
        	} else {
        		text = d.name;
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
   	  	       .style("left",(d3.event.pageX) + "px")
   	  	       .style("top",(d3.event.pageY - 28) + "px");   	  	       
      })
      .on("mouseout",function(d) {
      		if (d.group == "MajorMinor") {
      			var currentID = d.group1;
      		} else {
      			var currentID = d.group;
      		}
      		if (!document.getElementById(currentID).active) {
      			node.attr("r", function(d){if (d.group == "MajorMinor") {return 7;} else {return 3.5;}});
      		 	node.attr("opacity",1);
      			link.attr("opacity",1);
      		}
   	  	tooltip1.transition()
   	  	       .duration(500)
   	  	       .style("opacity",0);
   	  	tooltip2.transition()
   	  	       .duration(500)
   	  	       .style("opacity",0);   	  	       
      });

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

  
  groupArray.splice("MajorMinor",1); // do not need "MajorMinor" in my legend
  svg.selectAll(".legend1")
  	.data(groupArray)
  	.enter().append("g")
  	.attr("class","legend1")
  	.append("rect")
  	.attr("x", 110)
  	.attr("y", function(d) {return height-92-13*groupArray.indexOf(d);})
  	.attr("width", 40)
  	.attr("height", 13)
  	.style("stroke", "black")
  	.style("fill", "white")
  	.on("click",function(d){
		var currentNodes = document.getElementById(d);
  		var active = currentNodes.active ? false : true;
		d3.selectAll("#"+d).style("opacity",2);
		document.getElementById(d).active = true;  
		d3.selectAll("#"+d+"on").style("stroke","red");
		d3.selectAll("#"+d+"off").style("stroke","black");	
		d3.selectAll(".legendText4").style("stroke","black");
		d3.selectAll(".legendText3").style("stroke","black");			
  	});
  	
  svg.selectAll(".legend2")
  	.data(groupArray)
  	.enter().append("g")
  	.attr("class","legend2")
  	.append("rect")
  	.attr("x", 150)
  	.attr("y", function(d) {return height-92-13*groupArray.indexOf(d);})
  	.attr("width", 40)
  	.attr("height", 13)
  	.style("stroke", "black")
  	.style("fill", "white")
  	.on("click",function(d) {
		var currentNodes = document.getElementById(d);
  		var active = currentNodes.active ? false : true;
		d3.selectAll("#"+d).style("opacity",0.13);
		document.getElementById(d).active = false;  
		d3.selectAll("#"+d+"off").style("stroke","red");
		d3.selectAll("#"+d+"on").style("stroke","black"); 
		d3.selectAll(".legendText4").style("stroke","black");
		d3.selectAll(".legendText3").style("stroke","black");					
  	});
  	
  svg.selectAll(".legend3")
  	.data(groupArray)
  	.enter().append("g")
  	.attr("class","legend3")
  	.append("rect")
  	.attr("x", 200)
  	.attr("y", height/2-42)
  	.attr("width", 70)
  	.attr("height", 25)
  	.style("stroke", "black")
  	.style("fill", "white")
  	.on("click",function(d){
		d3.selectAll("#"+d).attr("r", function(d){if (d.group == "MajorMinor") {return 7;} else {return 3.5;}});	  	
		d3.selectAll(".node").style("opacity",0.13);
		d3.selectAll(".link").style("opacity",0.13);
		d3.selectAll(".node").active = false;
		d3.selectAll(".link").active = false;
		d3.selectAll(".legendText2").style("stroke","red");
		d3.selectAll(".legendText1").style("stroke","black");		
  	});  
  
  svg.selectAll(".legend4")
  	.data(groupArray)
  	.enter().append("g")
  	.attr("class","legend3")
  	.append("rect")
  	.attr("x", 200)
  	.attr("y", height/2-17)
  	.attr("width", 70)
  	.attr("height", 25)
  	.style("stroke", "black")
  	.style("fill", "white")
  	.on("click",function(d){
		d3.selectAll("#"+d).attr("r",9);  	
		d3.selectAll(".node").style("opacity",1.13);
		d3.selectAll(".link").style("opacity",1.13);
		d3.selectAll(".node").active = true;
		d3.selectAll(".link").active = true;
		d3.selectAll(".legendText1").style("stroke","red");
		d3.selectAll(".legendText2").style("stroke","black");		
  	});  	

  svg.selectAll(".legend")
  	.data(groupArray)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", 10)
  	.attr("y", function(d) {return height-92-13*groupArray.indexOf(d);})
  	.attr("width", 100)
  	.attr("height", 13)
  	.style("stroke", "black")
  	.style("fill", function(d) {return color(d);});
  	
  svg.selectAll(".legendText")
   	.data(groupArray)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",60)
   	.attr("y",function(d) {return height-80-13*groupArray.indexOf(d);})  
   	.style("text-anchor", "middle") 	
   	.text(function(d) {return d;});
        //.on("click", newSvg(function(d) {return d;}));
        
  svg.selectAll(".legendText1")
  	.data(groupArray)
  	.enter().append("text")
  	.attr("class","legendText1")
  	.attr("x",130)
  	.attr("y",function(d) {return height-80-13*groupArray.indexOf(d);})
  	.style("text-anchor","middle")
  	.style("stroke","red")
  	.attr("id",function(d) {return ""+d+"on";})
  	.text("On")
  	.on("click",function(d){
		var currentNodes = document.getElementById(d);
  		var active = currentNodes.active ? false : true;
		d3.selectAll("#"+d).style("opacity",2);
		document.getElementById(d).active = true;  
		d3.selectAll("#"+d+"on").style("stroke","red");
		d3.selectAll("#"+d+"off").style("stroke","black");	
		d3.selectAll(".legendText4").style("stroke","black");
		d3.selectAll(".legendText3").style("stroke","black");	
		d3.selectAll("#"+d).attr("r",9);		
  	});  	

  svg.selectAll(".legendText2")
  	.data(groupArray)
  	.enter().append("text")
  	.attr("class","legendText2")
  	.attr("x",170)
  	.attr("y",function(d) {return height-80-13*groupArray.indexOf(d);})
  	.style("text-anchor","middle")
  	.style("stroke","black")
  	.attr("id",function(d) {return ""+d+"off";})
  	.text("Off")
  	.on("click",function(d) {
		var currentNodes = document.getElementById(d);
  		var active = currentNodes.active ? false : true;
		d3.selectAll("#"+d).style("opacity",0.13);
		document.getElementById(d).active = false;  
		d3.selectAll("#"+d+"off").style("stroke","red");
		d3.selectAll("#"+d+"on").style("stroke","black"); 
		d3.selectAll(".legendText4").style("stroke","black");
		d3.selectAll(".legendText3").style("stroke","black");			
		d3.selectAll("#"+d).attr("r", function(d){if (d.group == "MajorMinor") {return 7;} else {return 3.5;}});	
  	});  	
  	
  svg.selectAll(".legendText3")
  	.data(groupArray)
  	.enter().append("text")
  	.attr("class","legendText3")
  	.attr("x",235)
  	.attr("y",height/2-25)
  	.style("text-anchor","middle")
  	.style("stroke","black")  	
  	.text("All Off")
  	.on("click",function(d){
		d3.selectAll(".node").style("opacity",0.13);
		d3.selectAll(".link").style("opacity",0.13);
		d3.selectAll(".node").active = false;
		d3.selectAll(".link").active = false;
		d3.selectAll(".legendText2").style("stroke","red");
		d3.selectAll(".legendText1").style("stroke","black");
		d3.selectAll(".legendText3").style("stroke","red");
		d3.selectAll(".legendText4").style("stroke","black");	
		d3.selectAll(".node").attr("r", function(d){if (d.group == "MajorMinor") {return 7;} else {return 3.5;}});		
  	});   	
  	
  svg.selectAll(".legendText4")
  	.data(groupArray)
  	.enter().append("text")
  	.attr("class","legendText4")
  	.attr("x",235)
  	.attr("y",height/2)
  	.style("text-anchor","middle")
  	.style("stroke","red")  	
  	.text("All On")
  	.on("click",function(d){
		d3.selectAll(".node").style("opacity",1.13);
		d3.selectAll(".link").style("opacity",1.13);
		d3.selectAll(".node").active = true;
		d3.selectAll(".link").active = true;
		d3.selectAll(".legendText1").style("stroke","red");
		d3.selectAll(".legendText2").style("stroke","black");	
		d3.selectAll(".legendText4").style("stroke","red");
		d3.selectAll(".legendText3").style("stroke","black");		
		d3.selectAll(".node").attr("r", function(d){if (d.group == "MajorMinor") {return 7;} else {return 3.5;}});		
  	}); 	  		          
});

//Zoom and Drag Source Code: bl.ocks.org/mbostock/6123708
function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
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