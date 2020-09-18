/* global topojson */

//Based on code from: http://bl.ocks.org/mbostock/5126418

//Width and height
var width = 500;
var height = 500;

var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);

var leftMargin = 20;
var topMargin = 20;
//Define map projection
var projection = d3.geo.albers();

var path = d3.geo.path()
    .projection(projection);
    
//Create SVG element
var svg = d3.select("body")
                .append("svg")
                .attr("x", topMargin)
                .attr("width", width)
                .attr("height", height);

var colorScale = d3.scale.quantize()
		   .range(colorbrewer.PuBu[7]);  

var wardsSet = d3.set(),
    genders = d3.set(),
    ages = d3.set(),
    diseases = d3.set(),
    wardsMap = {};

//Load in GeoJSON data
d3.json("manhattan_wards_1846_1849.geojson", function(json) {
    
    d3.csv("bellevue_almshouse.csv", type, function(data) {
      
      var nest1 = d3.nest()
      	     .key(function(d) {return d.ward;})
      	     .rollup(function(d) {return d.length;})
      	     .map(data);
      	     
      /*Store for later use in assignment
      var nest2 = d3.nest()
      	     .key(function(d) {return d.gender;})
      	     .key(function(d) {return d.ward;})
      	     .rollup(function(d) {return d.length;})
      	     .map(data);
      
      var nest2 = d3.nest()
  	     .key(function(d) {return d.ward;}) 
  	     .key(function(d) {return d.gender;})
  	     .key(function(d) {return d.age;})
  	     .key(function(d) {return d.disease_control;})
  	     .rollup(function(d) {return d.length;})
  	     .map(data);
      */     
    
    	data.forEach(function(d) {
    	   wardsSet.add(d.ward);
    	   genders.add(d.gender);
    	   ages.add(d.age);
    	   diseases.add(d.disease_control);
    	});
    	
    	//check whether every single ward has been recorded, if not, add the ones missing.
    	var max = d3.max(wardsSet.values());
    	for (var i = 1; i <= max; i++) {
    	   if (!wardsSet.has(i)){
    	   	wardsSet.add(i);
    	   }
    	}
  
  var wards = [],
      wardsInfo = [];
      
  var min,max;
    
  wardsSet.forEach(function(ward) {
  	var wardObject = nest1[ward];
  	var count = 0;
  	if (d3.keys(nest1).indexOf(ward) !== -1) {
  		count = nest1[ward];
  	}
  	wards.push({
  	  ward: ward,
  	  count: parseInt(count)
  	});
  	wardsMap[ward]=count;
  });
  
  min = d3.min(wards, function(d) {
  		return d.count;
  	});
  max = d3.max(wards, function(d) {
  		return d.count;
  	});
  	
  /* Store for use in assignment
  wardsSet.forEach(function(gender) {
      var genderObj = nest2[gender];
      
      genders.forEach(function(ward) {
          var wardObj = d3.keys(genderObj).indexOf(ward) === -1 ? null : genderObj[ward]; 
  	  var count = 0;
  	  if (genderObj && d3.keys(genderObj).indexOf(ward) !== -1) {
  		count = genderObj[ward];
  	  }          	  
          wardsInfo.push({
            gender: gender,
            ward: ward,
            count: count,
          });                  
      });      
  });

  wardsSet.forEach(function(ward) {
      var wardObj = nest2[ward];
      
      genders.forEach(function(gender) {
          var genderObj = d3.keys(wardObj).indexOf(gender) === -1 ? null : wardObj[gender]; 
          
          ages.forEach(function(age) {             
              var ageObj = null;
              if (genderObj && d3.keys(genderObj).indexOf(age) !== -1) {
                  ageObj = genderObj[age];
              }              
              diseases.forEach(function(disease) {
                  var count = 0;
                  if (ageObj && d3.keys(ageObj).indexOf(disease) !== -1) {
                      count = ageObj[disease];
                  }	  
                  wardsInfo.push({
                     ward: ward,
                     gender: gender,
                     age: age,
                     disease: disease,
                     count: count
                  });                  
              });
          });
      });      
  });
  */  	


    	colorScale.domain([min,max]);
        
        projection
          .scale(1)
          .translate([0, 0]);

        var b = path.bounds(json),
          s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
          .scale(s)
          .translate(t);
                    
            svg.selectAll(".ward")
                .data(json.features)
                .enter()
                    .append("path")
                    .attr("class", "ward")
                    .style("stroke","black")
                    .style("fill",function(d) {var tempWard = d.properties.Ward_Num; return colorScale(wardsMap[tempWard]);})
                    .attr("d", path)
                    .on("mouseover", function(d) {
              		tooltip.transition()
              		.duration(200)
              		.style("opacity", .9);
              		tooltip.html("<br/> Ward: "+
                        d.properties.Ward_Num+
                        "<br/> Number of Records: "+
                        wardsMap[d.properties.Ward_Num])
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
              	    })
                    .on("mouseout", function(d){
                      	tooltip.transition()
                      	.duration(500)
                      	.style("opacity",0);
          
  		    });
  		    
   var colorbrewerClass = [];
   //add numbers that represent the classes of the color into this array
   for (var i = 0; i < 7; i++) {
   	colorbrewerClass.push(i);
   }

   svg.selectAll(".legend")
  	.data(colorbrewerClass)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", leftMargin)
  	.attr("y", function(d) {return 350-35*d;})
  	.attr("width", 1*leftMargin)
  	.attr("height", 35)
  	.style("stroke", "black")
  	.style("fill", function(d) {return colorScale(max*(d)/7);});
   	
   //Adding the text "0" in the legend	
   colorbrewerClass.push(-1);
   
   svg.selectAll(".legendText")
   	.data(colorbrewerClass)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",2*leftMargin+5)
   	.attr("y",function(d) {return 355-35*d;})   	
   	.text(function(d) {return Math.round(max*(d+1)/7 * 100) / 100;});	
   
    }); 
    
});

function type(d) {
  d.ward = +d.ward; //Convert data to numbers
  return d;
}