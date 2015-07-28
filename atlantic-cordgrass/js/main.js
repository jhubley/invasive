	//Speed & animation-control variables
	var maprate = 400,
		pause=1, // don't automatically start
		timepause=0,
		start = 0,
		interval,
		loop,
		dateiter;

	//Data parameter variables
	var minyr,
		maxyr,
		dates,
		years;

	//Selection variables
	var slider,
		handle,
		brush,
		timer,
		timeaxis,
		timescale = d3.time.scale(),
		datemark;
		
		var timepad = 100; //bottom padding for slider
		
		var width = Math.max(window.innerWidth),
	    height = 460,
	    prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

		//map variables
		var tile = d3.geo.tile()
			.size([width, height]);

		var projection = d3.geo.mercator()
			.scale((1 << 16) / 2 / Math.PI)
			.translate([-width / 2, -height / 2]); // just temporary

		var tileProjection = d3.geo.mercator();

		var tilePath = d3.geo.path()
			.projection(tileProjection);
		
		var zoom = d3.behavior.zoom()
			.scale(projection.scale() * 2 * Math.PI)
			.scaleExtent([1 << 5, 1 << 25])
			.translate(projection([-122.412022,37.649117]).map(function(x) { return -x; }))
			.on("zoom", zoomed);

		var content =  d3.select("#container").append("div")
      .attr("id", "content")
			.style("width", width + "px")
			.style("height", height + "px")
			// .call(zoom) //disabled zoom for now. though it would be nice to pan still.
			;
				
			var map = content.append("g")
					.attr("id", "map")
					
			var points = content.append("svg")
					.attr("id", "points")
					
		 	var story = content.append("svg")
					.attr("id", "story")
			
		  var layer = map.append("div")
					    .attr("class", "layer")
									
			var slider = d3.select('#slider')
			
			var sliderbox = slider.append("svg")
					.attr("id", "sliderbox")
			
			var playbutton = slider.append("div")
					.attr("id", "playbutton")
					
			zoomed();
		// load data
		d3.csv("data/cordgrasscase.csv",
			type,
			function(error, data) {

			dates = d3.set(data.map(function(d) {return d.Date;})).values().map(function(z) {return new Date(z);});

			years = d3.set(data.map(function(d) {return +d.Date.getFullYear();})).values().map(function(z) {return +z;});
									
			minyr = d3.min(years);
			maxyr = d3.max(years);

			d3.select("#play")
	      .attr("title","Play animation")
	      .on("click",function(){
	        if ( !pause ){
	          pause = 1;
	          d3.select(this).classed("pause",false).attr("title","Pause animation");
	          pause=1;
	        } else {
	          pause = 0;
	          d3.select(this).classed("pause",true).attr("title","Play animation");
	          pause=0;
	        }
	      });
	
			timescale
				.rangeRound([0, 900])
				.clamp(true)
				.domain([new Date(minyr,0,1),new Date(maxyr,12,31)]);

			timeaxis = d3.svg.axis()		
				.scale(timescale)
				.orient("bottom")
				.tickSize(0)
				.tickPadding(12)
				.ticks(10)				
			;
			
			timer = sliderbox.append("g");
						
			timer
				.attr("class", "x axis")
				.attr("transform","translate(" + 100 + "," + 50 + ")")
				.call(timeaxis)
				.select(".domain")
				
			brush = d3.svg.brush()
				.x(timescale)
				.extent([0,0])
				.on("brush",function() { //Now separate into mousedown -> clearInterval, drag -> animate, mouseup -> setInterval components
						var mouseval = timescale.invert(d3.mouse(this)[0]);
						var val = new Date(mouseval.getFullYear(),12);
						var strval = val.toISOString();
						dateiter = dates.map(function(d) {return d.toISOString();}).indexOf(strval);
						brush.extent([val,val]);
						handle.attr("cx",timescale(val));
						handle.attr("transform","translate(" + timescale(val) + ",0)")
						clearInterval(interval);
						update(data,val);
						interval = setInterval(loop,maprate);
				})
			;

			slider = timer
				.append("g")
					.attr("class","slider")
					.call(brush);
				
			slider.selectAll(".extent,.resize")
				.remove();

			dateiter = 0;

			handle = slider .append("g")
				.attr("class","handle preload")
				.attr("transform","translate(0," + timescale(dates[0]) + ",0)");

			handle.append("line")	
					.attr("class","datemark outer preload");
	
			handle.append("line")	
					.attr("class","datemark inner preload");

			handle.append("line")	
					.attr("class","graphindicator");

			
			handle.append("text")
					.attr("class","datemark label")
					.attr("y",-12)
					.attr("x",0)
					.attr("text-anchor","middle");
					
			d3.selectAll(".datemark.preload") // size of brush dragger
					.attr("x1",0)
					.attr("x2",0)
					.attr("y1",-5)
					.attr("y2",5);		
			
			d3.select(".graphindicator") // line that goes down to the chart
					.attr("x1",0)
					.attr("x2",0)
					.attr("y1",10)
					.attr("y2",230);
			
			dateiter = 0; // date incrementer - start
	
			loop = function(){
				clearInterval(interval);
				if ((timepause == 0 && pause == 0) || start == 0) {
					update(data,dates[dateiter]);
					if (dateiter < dates.length - 1) {++dateiter;}
					else {
							dateiter = 0;
							timepause=1;
							setTimeout(function(){timepause = 0;},3000);
							}
				}
				start = 1;
				interval = setInterval(loop, maprate);
			}

			interval = setInterval(loop, maprate);


		// line chart			
					var graph = d3.select("#graph")
					
					xScale = d3.scale.linear().range([100, 980]).domain([1921,2015]),	
					yScale = d3.scale.linear().range([180, 20]).domain([0,55]),
					
					xAxis = d3.svg.axis().scale(xScale).tickFormat(d3.format('0f')),
					yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
					
					graph.append("svg:g")
						.attr("transform", "translate(0,180)")
						.attr("class", "axis")
						.call(xAxis);
						
						graph.append("svg:g")
						.attr("transform", "translate(100,0)")
						.attr("class", "axis")
						.call(yAxis);
						
						//Nest data for line chart

						var taxon = d3.nest()	    
								.key(function(d) { return d.Taxon; })
								.sortKeys(d3.ascending)
								.key(function(d) { return d.Year; })
								.rollup(function(v) { return v.length;}) 
								.entries(data);
								
						var vor = d3.nest()
			      		.key(function(d) { return xScale(d.key) + "," + yScale(d.values); })
								.rollup(function(v) { return v[0]; })
								.entries(d3.merge(taxon.map(function(d) { return d.values; })))
								.map(function(d) { return d.values; });
																		
	 					var voronoi = d3.geom.voronoi()
								.x(function(d) { return xScale(d.key); })
								.y(function(d) { return yScale(d.values); });
					
						var line = d3.svg.line()
		 			  		.x(function(d){return xScale(d.key);})
								.y(function(d){return yScale(d.values);});
						
						graph.append("g")
						.attr("class", "species")
						.selectAll("path")
	      		.data(taxon)
						.enter().append("path")
						      .attr("class", function(d){return "species " + d.key; })
									.attr("d", function(d){ return line(d.values); })
									.attr("stroke-width", 2)
									.attr("fill", "none");

						var focus = graph.append("g")
								  .attr("transform", "translate(-100,-100)")
								  .attr("class", "focus");

						focus.append("circle")
								  .attr("r", 3.5);

						focus.append("text")
								  .attr("y", -10);

					  var voronoiGroup = graph.append("g")
								  .attr("class", "voronoi");

						voronoiGroup.selectAll("path")
						      .data(voronoi(vor))
						      .enter().append("path")
						      .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
						      .datum(function(d) { return d.point; })
						      .on("mouseover", mouseover)
						      .on("mouseout", mouseout);

					  d3.select("#show-voronoi")
									.property("disabled", false)
									.on("change", function() { voronoiGroup.classed("voronoi--show", this.checked); });


						function mouseover(d) {
							    d3.select('.'+d.type).classed("line-hover", true);
							    focus.attr("transform", "translate(" + xScale(d.key) + "," + yScale(d.values) + ")");
							    focus.select("text").text(d.key + ": " + d.values + " observations");}

						function mouseout(d) {
							    d3.select('.'+d.type).classed("line-hover", false);
							    focus.attr("transform", "translate(-100,-100)");}
							
							console.log(taxon);
		});			//end data callback

				

function update(data,date) {
	var yr = date.getFullYear(); // spits out the years for slider
	
	var usedat = data.filter(yrfilter(yr)); 

	var curr = [timescale(date)];
	
	handle
		.transition(50)
			.attr("transform",function(d) {return "translate(" + Math.floor(curr) + ",0)"});

	timer.selectAll(".datemark,.handle") // point that moves on timer
		.classed('preload',0);
	
	// timer.select(".datemark.label")
	// 	.text(d3.time.format("%Y")(date));
		
	d3.select(".year").text(d3.time.format("%Y")(date)); //big date next to slider
	
	timer.select(".datemark.labelbox")
		.attr("height", 50)
		.attr("width", 50)
		.attr("x", 5)
		.attr("y",-12)
		.style("fill-opacity",0);
	
	var datapoints = d3.select("#points").selectAll("circle").data(data)
	.enter()
	.append("circle")
	.attr("class", function(d){return "sighting " + d.Taxon + " " + d.Year});
		
	var circles = d3.selectAll(".sighting")
	.data(usedat, function(d) { return d ? d.x : this.id; }, 
	              function(d) { return d ? d.y : this.id; });

	circles
	.transition()
		.ease("linear")
		.duration(50)
		// .attr("r", 8)
		.attr("r", function(d){if (d.High_Plant == 1){return .000038*zoom.scale();}
		    else if ((d.High_Plant > 1 && d.High_Plant < 100) || (d.High_Plant == "1+")){return .000052*zoom.scale();}
				else if (d.High_Plant >= 100 && d.High_Plant < 1000){return .000070*zoom.scale();}
				else if(d.High_Plant >= 1000){return .0001*zoom.scale();}
				else if(d.High_Plant = 'origin'){return 6;}
				})
		.attr("cx", function(d) {return projection([d.y,d.x])[0]})
		.attr("cy", function(d) {return projection([d.y,d.x])[1]})
		.style("opacity", 1);

		circles.exit().remove();



		d3.csv("data/infoboxes.csv", function(msg) {
			var now = msg.filter(yrfilter(yr)); 

			var story = d3.select("#story").selectAll("rect").data(msg)
			.enter()
			.append("rect")
			.attr("class", function(d){return "story " +d.Year});
						
			var boxes = d3.selectAll(".story")
			.data(now, function(d) { return d ? d.x + "px" : this.id; }, 
			           function(d) { return d ? d.y + "px" : this.id; });
			boxes
					.attr("x", function(d) {return d.x + "px"; })
					.attr("rx", 5)
					.attr("y", function(d) {return d.y + "px"; })
					.attr("width", function(d) {return d.width})
					.attr("height", function(d) {return d.height})
					.style("fill", "#000")
					.style("opacity", .6);

		 	 	  boxes.exit().remove();		
					
			var text = d3.select("#story").selectAll("text").data(msg)
					.enter()
					.append("text")
					.attr("class", function(d){return "text " +d.Year});
					
			var narr = d3.selectAll(".text")
					.data(now, function(d) { return d ? d.x + "px" : this.id; }, 
					           function(d) { return d ? d.y + "px" : this.id; });
			narr
						.attr("x", function(d) {return d.x - -30 + "px"; })
						.attr("y", function(d) {return d.y - -40 + "px"; })
						.attr("width", function(d) {return d.width + 20})
						.attr("height", function(d) {return d.height + 20})
						.html(function(d){return d.html})
						.style("fill", "#ffffff")

						narr.exit().remove();
							
		});
		
		
		
		 				
} //end update


//Filter by year.
function yrfilter(year) {
	return function(element) {
		return element.Year == year;
	}
}

function type(d) {
			d.Year = +d.Year; 
			d.Date = new Date(d.Year,12);
			return d;
}	
		
//map functions
function zoomed(data) {
  var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      ();

  projection
      .scale(zoom.scale() / 2 / Math.PI)
      .translate(zoom.translate());

var circles = d3.selectAll("circle")
							// .attr("cx", function(d) {return projection([d.y,d.x])[0]})
							// .attr("cy", function(d) {return projection([d.y,d.x])[1]});

var image = layer
      .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".tile")
      .data(tiles, function(d) { return d; });

  image.exit()
      .remove();

  image.enter().append("img")
      .attr("class", "tile")
			.attr("src", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/jhubley.385a35cf/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
      .style("left", function(d) { return (d[0] << 8) + "px"; })
      .style("top", function(d) { return (d[1] << 8) + "px"; });
}

function matrix3d(scale, translate) {
  var k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
}

function prefixMatch(p) {
  var i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
}

function formatLocation(p, k) {
  var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
  return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " "
       + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
}

//zoom buttons

function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}
function zoomClick() {
    var clicked = d3.event.target,
        direction = 1,
        factor = 0.2,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};
    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() * (1 + factor * direction);
    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }
    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
    view.x += center[0] - l[0];
    view.y += center[1] - l[1];
    interpolateZoom([view.x, view.y], view.k);
}

d3.select('#zoom_out').on('click', zoomClick);
d3.select('#zoom_in').on('click', zoomClick);