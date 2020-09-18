/* global topojson */

//Based on code from: http://bl.ocks.org/mbostock/5126418

//Width and height
var width = 270;
var height = 530;

var tooltip = d3.select("body").append("div")
        .attr("class","tooltip")
        .style("opacity",0);

var leftMargin = 20;
var topMargin = 20;
//Define map projection
var projection = d3.geo.albers();

var genderArrayy = ["m","f"];

var path = d3.geo.path()
    .projection(projection);
    
var svg1 = d3.select("body")
                .append("svg")
                .attr("x", topMargin)
                .attr("width", width)
                .attr("height", height);
   		
// dimensions for the bar chart in the second svg
var pC ={},    
    pieDim ={w:260, h: 500};
pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

// create svg for bar chart.
var piesvg = d3.select("body").append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
            
var arc = d3.svg.arc()
   	           .outerRadius(pieDim.r - 10)
   	           .innerRadius(0);
    
// dimensions for the histogram in the third svg                
var hGDim = {t: 60, r: 0, b: 60, l: 80};
    hGDim.w = 650 - hGDim.l - hGDim.r, 
    hGDim.h = 500 - hGDim.t - hGDim.b;

// create svg for histogram.
var hGsvg = d3.select("body").append("svg")
   		.attr("width", hGDim.w + hGDim.t + hGDim.b)
   		.attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
   		.attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
   		   		
var colorScale = d3.scale.quantize()
		   .range(colorbrewer.PuBu[7]);  
		   
var genderScale = d3.scale.ordinal().range(["Male","Female"])
   				    .domain(["m","f"]); 

var wardsSet = d3.set(),
    genders = d3.set(),
    /*ages = d3.set(),*/
    professions = d3.set(),
    wardsMap = {};
    currentID = 0;

//Load in GeoJSON data
d3.json("manhattan_wards_1846_1849.geojson", function(json) {
    
    d3.csv("bellevue_almshouse.csv", type, function(data) {
          
      var nestDefault = d3.nest()
             .key(function(d) {return d.profession;})
             .rollup(function(d) {return d.length;})
             .map(data);
             
      var nestGender = d3.nest()
      	     .key(function(d) {return d.gender;})
      	     .rollup(function(d) {return d.length;})
      	     .map(data);           

      var nest1 = d3.nest()
      	     .key(function(d) {return d.ward;})
      	     .rollup(function(d) {return d.length;})
      	     .map(data);
      	      
      var nest2 = d3.nest()
      	     .key(function(d) {return d.ward;})
      	     .key(function(d) {return d.gender;})
      	     .rollup(function(d) {return d.length;})
      	     .map(data);
      
      var nest3 = d3.nest()
  	     .key(function(d) {return d.ward;}) 
  	     .key(function(d) {return d.gender;})
  	     .key(function(d) {return d.profession;})
  	     .rollup(function(d) {return d.length;})
  	     .map(data);
                     
      data.forEach(function(d) {
    	   wardsSet.add(d.ward);
    	   genders.add(d.gender);
    	   //ages.add(d.age);
    	   professions.add(d.profession);
      });
      
      // remove unknown professions (the cells that are blank)
      professions.remove("");
      
      var professionsArray = professions.values();
      var gendersArray = genders.values();
    	
      //check whether every single ward has been recorded, if not, add the ones missing.
      var max = d3.max(wardsSet.values());
      for (var i = 1; i <= max; i++) {
    	   if (!wardsSet.has(i)){
    	   	wardsSet.add(i);
    	   }
      }
  
      var wards = [],
          wardsInfo = [],
          professionsInfo = [],
          wardsGenderMap = {},
          genderMap = {},
          professionDefaultMap = {};
      
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
       
       professions.forEach(function(profession) {
       	 var professionObj = nestDefault[profession];
       	 var count = 0;
       	 if (d3.keys(nestDefault).indexOf(profession) !== -1) {
       	  	count = nestDefault[profession];
       	 }
       	 professionDefaultMap[profession] = parseInt(count);
       	 professionsInfo.push({
       	   profession: profession,
       	   count: parseInt(count)
       	 });
       });
       
       var defaultProfessionMax = d3.max(professionsInfo, function(d) {
       		return d.count;
       });
       
       genders.forEach(function(gender) {
       	 var genderObj = nestGender[gender];
       	 var count = 0;
       	 if (d3.keys(nestGender).indexOf(gender) !== -1) {
       	 	count = nestGender[gender];
       	 }
       	 genderMap[gender] = parseInt(count);
       });
  	
      wardsSet.forEach(function(ward) {
      	var wardObj = nest2[ward],
            tempMap = {};
        genders.forEach(function(gender) {
          var genderObj = d3.keys(wardObj).indexOf(gender) === -1 ? null : wardObj[gender]; 
  	  var count = 0;
  	  if (wardObj && d3.keys(wardObj).indexOf(gender) !== -1) {
  		count = wardObj[gender];
  	  }          	  
	  tempMap[gender] = count;
        });  
        wardsGenderMap[ward] = tempMap;    
      });
      
      
      var professionsMap = {},     
          professionsMaxMap = {},
          wardsGendersProfessionMap = {},
          genderProfessionMap = {},
          genderProfessionsMaxMap = {},
          defaultProfessionsSet = d3.set();
          
      wardsSet.forEach(function(ward) {
       var genderProfessionMapSet = d3.set();
       var professionsMapSet = d3.set();
       var wardObj = nest3[ward];
       var tempMax = 0;
       var genderMap = {}; 
       var tempProfessionMap = {}; 
       var tempProfessionsMaxMap = {};
       //var  = d3.set();     
       genders.forEach(function(gender) {
          var genderObj = d3.keys(wardObj).indexOf(gender) === -1 ? null : wardObj[gender];    
          var tempMap = {};       
          professions.forEach(function(profession) {
              var count = 0;
              if (genderObj && d3.keys(genderObj).indexOf(profession) !== -1) {
                  count = genderObj[profession];
                  professionsMapSet.add(profession);
                  genderProfessionMapSet.add(profession);
                  defaultProfessionsSet.add(profession);
              }	                  
              if (count >= tempMax) {tempMax = count;}
              wardsInfo.push({
                 ward: ward,
                 gender: gender,
                 profession: profession,
                 count: count
              });    
              tempMap[profession] = count;             
          });
          genderMap[gender] = tempMap; 
          tempProfessionMap[gender] = genderProfessionMapSet.values();   
          genderProfessionMapSet = d3.set();  
          tempProfessionsMaxMap[gender] = tempMax;  
       });
       professionsMap[ward] = professionsMapSet.values();
       genderProfessionMap[ward] = tempProfessionMap;
       professionsMapSet = d3.set();
       professionsMaxMap[ward] = tempMax;  
       genderProfessionsMaxMap[ward] = tempProfessionsMaxMap; 
       wardsGendersProfessionMap[ward] = genderMap;  
      });

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
                    
     svg1.selectAll(".ward")
          .data(json.features)
          .enter()
          .append("path")
          .attr("class", "ward")
          .style("stroke","black")
          .style("fill",function(d) {var tempWard = d.properties.Ward_Num; return colorScale(wardsMap[tempWard]);})
          .attr("d", path)
          .on("click", function(d) {
          	currentID = d.properties.Ward_Num;
          	clickEvent(currentID);
          	tooltip.transition()
              	       .duration(300)
              	       .style("opacity", .9);
              	tooltip.html("<br/> Ward: "+
                        d.properties.Ward_Num+
                        "<br/> Number of Records: "+
                        wardsMap[d.properties.Ward_Num])
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
          });
  		    
   var colorbrewerClass = [];
   //add numbers that represent the classes of the color into this array
   for (var i = 0; i < 7; i++) {
   	colorbrewerClass.push(i);
   }

   svg1.selectAll(".legend")
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
   
   svg1.selectAll(".legendText")
   	.data(colorbrewerClass)
   	.enter().append("text")
   	.attr("class","legendText")
   	.attr("x",2*leftMargin+5)
   	.attr("y",function(d) {return 355-35*d;})   	
   	.text(function(d) {return Math.round(max*(d+1)/7 * 100) / 100;});
   
   
   // Source code of interactive Pie Chart and Bar Chart from http://bl.ocks.org/NPashaP/96447623ef4d342ee09b
   var barColor = 'crimson';
   function segColor(c) { return {f:"#e08214", m:"#41ab5d"}[c]; }  
   
   var pie = d3.layout.pie()
   		      .sort(null)
   		      .value(function(d) { return genderMap[d];});  
   		      
   var pieChartDefault = piesvg.selectAll(".arc")
    		               .data(pie(genderArrayy))
    		               .enter()
    		               .append("g")
    		               .attr("class", "arc");
    		               
   pieChartDefault.append("path")
                  .attr("d",arc)
                  .style("stroke",'white')
                  .style("fill", function(d) {return segColor(d.data);})
                  .attr("id",function(d) {return d.data;})
                  .on("click", function(d) {
     	             newClickEvent(d.data);
                  });
   
  piesvg.selectAll(".text")
  	.data(genderArrayy)
  	.enter().append("g")
  	.attr("class","text")
  	.append("text")
  	.attr("x",pieDim.w/7-150)
  	.attr("y",-0.4*pieDim.h+5)
  	.text("Gender Distribution in All Manhattan");
   
  piesvg.selectAll(".legend")
  	.data(genderArrayy)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", pieDim.w/7-15)
  	.attr("y", function(d) {return (-0.3*pieDim.h) - 32*genderArrayy.indexOf(d);})
  	.attr("width", 130)
  	.attr("height", 32)
  	.style("stroke", 'white')
  	.style("fill", function(d) {return segColor(d);});
  	
  piesvg.selectAll(".legendText")
       .data(pie(genderArrayy))
       .enter()
       .append("g")
       .attr("class","legendText")
       .append("text")
       .attr("x", pieDim.w/7-6)
       .attr("y", function(d) {return (-0.3*pieDim.h) - 32*genderArrayy.indexOf(d.data)+16;})
       .text(function(d) { return genderScale(d.data) + " " + Math.round((d.endAngle-d.startAngle)*100/(2*Math.PI)*100)/100 +"%";});
   
   // create function for x-axis mapping.
   var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
   			     .domain(defaultProfessionsSet.values());  //*
        	  		  
   // add x-axis to the histogram svg.
   hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"))
            .selectAll("text")
            .attr("y",8)
            .attr("x",-15)
            .attr("transform","rotate(-45)");
            
   // create function for y-axis mapping.
   var y = d3.scale.linear().range([hGDim.h, 0])
   			    .domain([0,defaultProfessionMax]); 
  
   // create bars for histogram to contain rectangles and count labels.
   var bars = hGsvg.selectAll(".bar")
    		   .data(defaultProfessionsSet.values())  
    		   .enter()
    		   .append("g")
    		   .attr("class","bar");
    		   
   // create the rectangles
   bars.append("rect")
       .attr("class", "rect");
   
   bars.selectAll(".rect")
       .transition()
       .duration(200)
       .attr("x", function(d) { return x(d);})
       .attr("y", function(d) { return y(professionDefaultMap[d]);})
       .attr("width", x.rangeBand())
       .attr("height", function(d) { return hGDim.h - y(professionDefaultMap[d]);})
       .attr("fill", barColor);
   				       
  hGsvg.selectAll(".text")
       .data(genderArrayy)
       .enter().append("g")
       .attr("class","text")
       .append("text")
       .attr("x",200)
       .attr("y",-10)
       .text("Profession Distribution for  All Manhattan");    
       
   bars.selectAll(".text")
       .data(defaultProfessionsSet.values())
       .enter()
       .append("g")
       .attr("class","text")
       .append("text")
       .attr("x", function(d) { return x(d)+x.rangeBand()/2-8;})
       .attr("y", function(d) { return y(professionDefaultMap[d]) - 5;})
       .style("fill","black")
       .text(function(d) { return professionDefaultMap[d];});        
    
   // function to executed when user clicks on any ward          
   function clickEvent(currentID) {
   
   // clear the second and the third svgs for update       
   hGsvg.selectAll("*").remove();     
   piesvg.selectAll("*").remove();
   	           
   pie = d3.layout.pie()
   		      .sort(null)
   		      .value(function(d) { return wardsGenderMap[currentID][d];});  
   		      
   var pieChart = piesvg.selectAll(".arc")
    		  .data(pie(genderArrayy))
    		  .enter()
    		  .append("g")
    		  .attr("class", "arc");
   
   pieChart.append("path")
     .attr("d",arc)
     .style("stroke",'white')
     .style("fill", function(d) {return segColor(d.data);})
     .attr("id",function(d) {return d.data;})
     .on("click", function(d) {
     	newClickEvent(d.data);
     ;}); 
   
  piesvg.selectAll(".text")
  	.data(genderArrayy)
  	.enter().append("g")
  	.attr("class","text")
  	.append("text")
  	.attr("x",pieDim.w/7-150)
  	.attr("y",-0.4*pieDim.h+5)
  	.text("Gender Distribution in Ward "+currentID);
     
  piesvg.selectAll(".legend")
  	.data(genderArrayy)
  	.enter().append("g")
  	.attr("class","legend")
  	.append("rect")
  	.attr("x", pieDim.w/7-15)
  	.attr("y", function(d) {return (-0.3*pieDim.h) - 32*genderArrayy.indexOf(d);})
  	.attr("width", 130)
  	.attr("height", 32)
  	.style("stroke", 'white')
  	.style("fill", function(d) {return segColor(d);});
  	
  piesvg.selectAll(".legendText")
       .data(pie(genderArrayy))
       .enter()
       .append("g")
       .attr("class","legendText")
       .append("text")
       .attr("x", pieDim.w/7-6)
       .attr("y", function(d) {return (-0.3*pieDim.h) - 32*genderArrayy.indexOf(d.data)+16;})
       .text(function(d) { return genderScale(d.data) + " " + Math.round((d.endAngle-d.startAngle)*100/(2*Math.PI)*100)/100 +"%";});	
   
   // function to execute when user clicks on either gender
   function newClickEvent(currentGender) {
   
   // clear the svg for update 
   hGsvg.selectAll(".bar").remove();
   hGsvg.selectAll(".text").remove();
   
   d3.transition();
      
   // create function for x-axis mapping.
   var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
   			     .domain(professionsMap[currentID]); //*
        	  		  
   // add x-axis to the histogram svg.
   hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .transition()
            .call(d3.svg.axis().scale(x).orient("bottom"));
            
   // create function for y-axis mapping.
   var y = d3.scale.linear().range([hGDim.h, 0])
   			    .domain([0,genderProfessionsMaxMap[currentID][currentGender]]); //*
  
   // create bars for histogram to contain rectangles and count labels.
   var bars = hGsvg.selectAll(".bar")
    		   .data(professionsMap[currentID])  //*
    		   .enter()
    		   .append("g")
    		   .attr("class","bar");
    		   
   // create the rectangles
   bars.append("rect")
       .attr("class", "rect");
   
   bars.select("rect")
       .transition()
       .duration(200)
       .attr("x", function(d) { return x(d);})
       .attr("y", function(d) { return y(wardsGendersProfessionMap[currentID][currentGender][d]);})
       .attr("width", x.rangeBand())
       .attr("height", function(d) { return hGDim.h - y(wardsGendersProfessionMap[currentID][currentGender][d]);})
       .attr("fill", segColor(currentGender));	
   				       
  hGsvg.selectAll(".text")
       .data(genderArrayy)
       .enter().append("g")
       .attr("class","text")
       .append("text")
       .attr("x",200)
       .attr("y",-10)
       .text("Profession Distriution for " + genderScale(currentGender) + "s in Ward " + currentID);    
       
   bars.selectAll(".text")
       .data(professionsMap[currentID])
       .enter()
       .append("g")
       .attr("class","text")
       .append("text")
       .attr("x", function(d) { return x(d)+x.rangeBand()/2-5;})
       .attr("y", function(d) { return y(wardsGendersProfessionMap[currentID][currentGender][d]) + 15;})
       .style("fill","white")
       .text(function(d) { if (wardsGendersProfessionMap[currentID][currentGender][d] != 0) {
       				return ""+wardsGendersProfessionMap[currentID][currentGender][d];}});       
   }
   
   }
    
   });     
});
    

function type(d) {
  d.ward = +d.ward; //Convert data to numbers
  return d;
}