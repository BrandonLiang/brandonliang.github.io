// Force-Directed Graph; source code from http://bl.ocks.org/mbostock/4062045

// Fisheye implementation from github.com/d3/d3-plugins/tree/master/fisheye        
var fisheye = d3.fisheye.circular()
    .radius(200)
    .distortion(7);
        
var width = 1300,
    height = 650,
    radius = 6;
    
//Zoom and Drag Source Code: bl.ocks.org/mbostock/6123708
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
    
var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);       
    
var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-140)
    .linkDistance(30)
    .size([width, height]);
    
var safety = 0;

var select = d3.select("body")
    	.append("div")
    	.append("select");
    	
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

// Dispatch Event Source Code: bl.ocks.org/mbostock/5872848
var dispatch = d3.dispatch("load","majorchange");

// mapping objects that map major/minor accrynoms to their correspoding link/node objects from the JSON file
var newGraphLinks = d3.map(),
    newGraphNodes = d3.map(),
    tempGraphNodes = d3.map(),
    newGraph = d3.map(),
    t = [],
    l = [],
    count = 0;
       
d3.json("CourseList.json", function(error, graph) {
  if (error) throw error;
  
  var courseById = d3.map();
  graph.nodes.forEach(function(d){
  	if (!courseById.has(d.group)) {
  		courseById.set(d.group,d.group);
  	}
  }); 
  courseById.set("All","All");
  
  var groupSet = d3.set(),
      majorMinorSet = d3.set();
  
  graph.nodes.forEach(function(d) {
  	groupSet.add(d.group);
  	if (d.group == "MajorMinor") {
  		var tempId = d.group1;
  		tempGraphNodes.set(count,d.group1); 
  		count++; 	  			
  	} else {
  		var tempId = d.group;
  	}
  	if (!newGraphNodes.has(tempId)){
  		var tempArray = [];
  		tempArray.push(d);
  		newGraphNodes.set(tempId,tempArray);
  	} else {	
  		tempArray = newGraphNodes.get(tempId);
  		tempArray.push(d);
  		newGraphNodes.remove(tempId);
  		newGraphNodes.set(tempId,tempArray);
  	}
  	t.push(d); 	
  });
   
  graph.links.forEach(function(d) {
  	majorMinorSet.add(d.value);
  	var tempId = tempGraphNodes.get(d.target);
  	if (!newGraphLinks.has(tempId)){
  		var tempArray = [];
  		tempArray.push(d);
  		newGraphLinks.set(tempId,tempArray);
  	} else { 	
  		tempArray = newGraphLinks.get(tempId);
  		tempArray.push(d);
  		newGraphLinks.remove(tempId);
  		newGraphLinks.set(tempId,tempArray);
  	}
  	l.push(d);
  });
  
  newGraphLinks.set("All",l);
  newGraphNodes.set("All",t);
  
  newGraph.set(1,newGraphLinks);
  newGraph.set(0,newGraphNodes);

  var groupArray = groupSet.values(),
      majorMinorSetArray = majorMinorSet.values();
      
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .gravity(2)
      .start();

  //speed up the ticking process. Source code form: stackoverflow.com/questions/13463053/calm-down-initial-tick-of-a-force-layout    
  //function speedUp(){   
  while(force.alpha() > 0.04) { 
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
        d.fixed = true; // set the node to fixed so the force does not include the node in its auto positioning stuff
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
      		var tID;
      		if (d.group == "MajorMinor") {
      			tID = d.group1;
      		} else {
      			tID = d.group;
      		}
  		if (document.getElementById(tID).style["opacity"]>=1) { // only show tooltip for nodes that are currently displayed
        		var text = "";
        		if (d.group == "MajorMinor"){
        			text = ""+d.group+": "+d.name;
        		} else {
        			text = d.name;
        		}
   	  		tooltip2.transition()
   	  	       		.duration(200)
   	  	       		.style("opacity",0.9);
   	  		tooltip2.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px"); 
   	  	}  	  		   	  	      
      })
      .on("mouseout",function(d) {     		
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
  
  // Dispatch Event Source Code: bl.ocks.org/mbostock/5872848  
  //dispatch.load(courseById);
  dispatch.load(courseById,newGraph);
  dispatch.majorchange(courseById.get("All")); 
  	  		          
});
    
  // Dispatch Event Source Code: bl.ocks.org/mbostock/5872848
  dispatch.on("load.menu", function(courseById,newGraph) {
  	d3.selectAll(".node").attr("r",function(d){if (d.group == "MajorMinor") return 7; else return 3.5;}).style("opacity",1);
  	d3.selectAll(".link").style("opacity",1);
  	
  	var t = newGraph.get(0);
 	select.on("change", function() { dispatch.majorchange(courseById.get(this.value)); }); 	
  	select.selectAll("option")
      	.data(courseById.keys())
    	.enter().append("option")
      	.attr("value", function(d) { return d; })
      	.text(function(d) { return d; });
	//var keys = courseById.keys();
  	dispatch.on("majorchange.menu", function(major) {
    		select.property("value", major);
  	});
  });
  dispatch.on("load.bar", function(courseById,newGraph) {
  	dispatch.on("majorchange.bar", function(d) {    
  		if (d!="All") {		
    			d3.selectAll(".node").style("opacity",0);
			d3.selectAll(".link").style("opacity",0);
		} else {
			d3.selectAll(".node").style("opacity",2);
			d3.selectAll(".link").style("opacity",2);
		}
		svg.selectAll("#"+d).attr("r",9);
		svg.selectAll("#"+d).style("opacity",2);
		
		
		// Retreive link/node objects from corresponding Major/Minor
		//var newGraphLinks = newGraph.get(1);
		var newGraphNodes = newGraph.get(0);
		//var linkObj = newGraphLinks.get(d);
		var nodeObj = newGraphNodes.get(d);  		
		
		var text = "";
		for (var i=0; i < nodeObj.length; i++) {
			if (nodeObj[i].group != "MajorMinor")
				text = text + nodeObj[i].name + "; ";
		}
		if (d!="All") {
   	  		tooltip1.style("opacity",0.9);
   	  		tooltip1.html(text)
   	  	       		.style("left",(d3.event.pageX) + "px")
   	  	       		.style("top",(d3.event.pageY - 28) + "px");
		}
			
		//Fisheye Implementation from github.com/d3/d3-plugins/tree/master/fisheye  
		/* Fisheye is a little bit distracting so I am not using it for this graph
  		container.on("mousemove",function(){
		fisheye.focus(d3.mouse(this));
	
		d3.selectAll(".node").each(function(d) { d.fisheye = fisheye(d); })
      			.attr("cx", function(d) { return d.fisheye.x; })
      			.attr("cy", function(d) { return d.fisheye.y; })
      			.attr("r", function(d) { if (d.group == "MajorMinor") {return d.fisheye.z * 3;} else {return d.fisheye.z * 1.5;} });

  		d3.selectAll(".link").attr("x1", function(d) { return d.source.fisheye.x; })
      			.attr("y1", function(d) { return d.source.fisheye.y; })
      			.attr("x2", function(d) { return d.target.fisheye.x; })
      			.attr("y2", function(d) { return d.target.fisheye.y; });
  		});	
  		*/
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