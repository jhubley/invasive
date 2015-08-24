document.onkeydown = checkKey;

// A - blue wire, 65 #0, Ice Plant
// J - black wire, 74 #9, Gorse
// C - red wire, 67 #2, Cape Ivy
// L - green wire, 76 #11, Scotch Broom

function checkKey(e) {
    e = e || window.event;

		if (e.keyCode == '65') {
				var obj = $("a.akey");
	      window.open(obj.attr("href"),"_self");
    }
    else if (e.keyCode == '67') {
				var obj = $("a.ckey");
	      window.open(obj.attr("href"),"_self");
    }
    else if (e.keyCode == '74') {
				var obj = $("a.jkey");
	      window.open(obj.attr("href"),"_self");
    }
    else if (e.keyCode == '76') {
				var obj = $("a.lkey");
	      window.open(obj.attr("href"),"_self");
    }
}

	//Animation variables
	var maprate,
	  pause=0, // automatically start
    timepause=0,
		start = 0,
		now = 0,
		later = 0,
		interval,
		loop,
		dateiterate = 0;

	//Date variables
	var minyr,
		maxyr,
		yr,
		thisyr,
		nextyr,
		dates,
		years;

	//Slider variables
	var slider,
		handle,
		brush,
		timer,
		timeaxis,
		timescale = d3.time.scale(),
		datemark;
		
		var sf = [-122.417, 37.775],
		belowsf = [-122.510962, 37.580284],
		funston = [-122.502771, 37.715402],
		reyes = [-122.861938, 38.041614];
		
		var width = (Math.max(window.innerWidth)/10) * 6.92,
	    height = 550,
	    prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

		// map variables
		var tile = d3.geo.tile()
			.size([width, height]);

		var projection = d3.geo.mercator()
			.scale((1 << 15) / 2 / Math.PI)
			.translate([-width / 2, -height / 2]); // just temporary

		var tileProjection = d3.geo.mercator();

		var tilePath = d3.geo.path()
			.projection(tileProjection);
		
		var zoom = d3.behavior.zoom()
			.scale(projection.scale() * 2 * Math.PI)
			.translate(projection([-122.412022,38.049117]).map(function(x) { return -x; }));
			// .on("zoom", zoomed);

		var content =  d3.select("#content")
			.style("width", width + "px")
			.style("height", height + "px");
				
			var map = content.append("g")
					.attr("id", "map")
					
			var points = content.append("svg")
					.attr("id", "points")
					
			var note = content.append("svg")
					.attr("id", "note")
					
		 	var story = d3.select("#story")
			
		  var layer = map.append("div")
					    .attr("class", "layer")
					
			var labels = map.append("div")
									.attr("class", "labels")
									
			var slider = d3.select('#slider')
			
			var sliderbox = slider.append("svg")
					.attr("id", "sliderbox")
			
			var playbutton = slider.append("div")
					.attr("id", "playbutton")
		
				zoomed();
				
		// load species observation data
		d3.csv("data/frenchbroom.csv",
			type,
			function(error, data) {

				data.forEach(function(d) {
				    d.InfestedArea_squarem = +d.InfestedArea_squarem;
				    d.GrossArea_acre = +d.GrossArea_acre;
						d.Percent_Cover = +d.Percent_Cover;
				  });
				
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
				.rangeRound([0, width - 200])
				.domain([new Date(minyr - 1,0,1),new Date(maxyr,12,31)]);

			timeaxis = d3.svg.axis()		
				.scale(timescale)
				.orient("bottom")
				.tickSize(0)
				.tickPadding(12)
				.ticks(10);
			
			timer = sliderbox.append("g");
						
			timer
				.attr("class", "x axis")
				.attr("transform","translate(" + 100 + "," + 35 + ")")
				.call(timeaxis)
				.select(".domain")
				
			brush = d3.svg.brush()
				.x(timescale)
				.extent([0,0])
				.on("brush",function() { 
						var mouseval = timescale.invert(d3.mouse(this)[0]);
						var val = new Date(mouseval.getFullYear(),12);
						var strval = val.toISOString();
						dateiterate = dates.map(function(d) {return d.toISOString();}).indexOf(strval);
						brush.extent([val,val]);
						handle.attr("cx",timescale(val));
						handle.attr("transform","translate(" + timescale(val) + ",0)")
						clearInterval(interval);
						update(data,val);
						interval = setInterval(loop,maprate);
				});

			slider = timer
				.append("g")
					.attr("class","slider")
					.call(brush);
				
			slider.selectAll(".extent,.resize")
				.remove();

			handle = slider .append("g")
				.attr("class","handle preload");

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
					.attr("y2",250);
						
					// line chart			
					var graph = d3.select("#graph")
					
					xScale = d3.scale.linear().range([100, width - 100]).domain([minyr - 1,maxyr]),	
					yScale = d3.scale.linear().range([180, 20]).domain([0,700]),
					
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
							    focus.select("text").text(d.key + ": " + d.values + " ");}

						function mouseout(d) {
							    d3.select('.'+d.type).classed("line-hover", false);
							    focus.attr("transform", "translate(-100,-100)");}
							
							// load story data
							d3.csv("data/frenchbroomstory.csv", function(msg) {

									msg.forEach(function(d, i) {
										d.duration = +d.duration;
										d.width = +d.width;
										d.height = +d.height;
										d.Year = +d.Year;
										place = d.place;
										d.newscale = +d.newscale;
									});
																				
									d3.csv("data/frenchbroomstorylabels.csv", function(lab) {

									lab.forEach(function(d,i){
										d.width = +d.width;
							  		d.height = +d.height;
							  		d.Year = +d.Year;
									});
							
							function update(data,gate) {
										yr = gate.getFullYear(); // spits out the years for slider

										var usedat = data.filter(yrfilter(yr)); 

										var curr = [timescale(gate)];
										
										handle
											.transition(50)
												.attr("transform",function(d) {return "translate(" + Math.floor(curr) + ",0)"});

										timer.selectAll(".datemark,.handle") // point that moves on timer
											.classed('preload',0);

										d3.select(".year").text(d3.time.format("%Y")(gate)); //big date next to slider

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
										
										// web socket to connect to arduino
										
										// console.log("usedat: ", usedat.length); // shows number of observations in current year for all species
										
										// var socket = io();
										// 
										// socket.emit('message', usedat.length);
										
										var circles = d3.selectAll(".sighting")
										.data(usedat, function(d) { return d ? d.x : this.id; }, 
										              function(d) { return d ? d.y : this.id; });

										circles
										.transition()
											.ease("linear")
											.duration(250)

											.attr("r", function(d){if (d.InfestedArea_squarem != NaN){
															if (d.InfestedArea_squarem > 0 && d.InfestedArea_squarem < 500){return 4;}
															else if (d.InfestedArea_squarem > 501 && d.InfestedArea_squarem < 2000){return 8;}
															else if (d.InfestedArea_squarem > 2001){return 12;}
															else{return 5;}
													}
													else if (d.GrossArea_acre != NaN){
														if (d.GrossArea_acre > 0 && d.GrossArea_acre < 1000){return 16;}
														else if (d.GrossArea_acre > 1001){return 32;}
														else{return 5;}
													}
											})
											.attr("cx", function(d) {return projection([d.y,d.x])[0]})
											.attr("cy", function(d) {return projection([d.y,d.x])[1]})
											.style("opacity", .9);

											circles.exit().remove();

												//story
												now = msg.filter(yrfilter(yr));
												
												var story = d3.select("#story").selectAll("rect").data(msg)
															.enter()
															.append("rect")
															.attr("class", function(d){return "story " + d.Year});

												var text = d3.select("#story").selectAll("foreignObject").data(msg)
														.enter()
														.append("foreignObject")
														.attr("class", function(d){return "text " +d.Year});

												var narr = d3.selectAll(".text")
														.data(now, function(d) { return d ? d.x + "px" : this.id; }, 
														           function(d) { return d ? d.y + "px" : this.id; });																			


												narr
															.attr("x", function(d) {return d.x - -20 + "px"; })
															.attr("y", function(d) {return d.y - -20 + "px"; })
															.attr("width", function(d) {return d.width - 40 + 'px'})
															.attr("height", function(d) {return d.height - 20 + 'px'})
															.append("xhtml:body")
															.html(function(d){return d.story})
															.style("color", "#ffffff");
															
												narr.exit().remove();
												
												//labels
												labelnow = lab.filter(yrfilter(yr));

												var placenames = d3.select("#note").selectAll("rect").data(lab)
															.enter()
															.append("rect")
															.attr("class", function(d){return "placelabel " + d.Year});

												var boxes = d3.selectAll(".placelabel")
															.data(labelnow, function(d) { return d ? d.x + "px" : this.id; }, 
															           function(d) { return d ? d.y + "px" : this.id; });

												boxes
															.attr("x", function(d) {return projection([d.y,d.x])[0]})
															.attr("y", function(d) {return projection([d.y,d.x])[1]})
															.attr("rx", 5)
															.attr("width", function(d) {return d.width})
															.attr("height", function(d) {return d.height})
															.style("fill", "#000")
															.style("z-index", 400)
															.style("opacity", .6);

												boxes.exit().remove();
															
												var placetext = d3.select("#note").selectAll("foreignObject").data(lab)
														.enter()
														.append("foreignObject")
														.attr("class", function(d){return "placetext " +d.Year});

												var placenarr = d3.selectAll(".placetext")
												.data(labelnow, function(d) { return d ? d.x : this.id; }, 
																	 function(d) { return d ? d.y : this.id; });																		

												placenarr
															.attr("x", function(d) {return projection([d.y,d.x])[0]})
															.attr("y", function(d) {return projection([d.y,d.x])[1]})
															.attr("width", function(d) {return d.width - 40 + 'px'})
															.attr("height", function(d) {return d.height - 20 + 'px'})
															.append("xhtml:body")
															.html(function(d){return d.label})
															.style("color", "#ffffff")
															.style("padding", "10px")
															.style("background",function(d){
																	if(d.bg == 'yes'){return '#000000';} 
																	else{ return 'none';} 
																});

												placenarr.exit().remove();
												//end labels
															
									} //end update

									loop = function(msg){
										clearInterval(interval);
										
										if ((timepause == 0 && pause == 0) || start == 0) {
											update(data,dates[dateiterate]);
											if (dateiterate < dates.length - 1) {++dateiterate;}
											else {
													dateiterate = 0;
													timepause=1;
													setTimeout(function(){timepause = 0;},100);
													}
										}
										if (now.length > 0 ){ maprate = 5000;} 
										else { maprate = 300;}
										start = 1;
										interval = setInterval(loop, maprate);
									}

									interval = setInterval(loop, maprate);

						});  // end story label data callback

				});  // end story data callback

		});			//end species observation data callback

		
//Filter by year.
function yrfilter(year) {
	return function(element) {
		return element.Year == year;
	}
}

function type(d) {
			d.Year = +d.Year; 
			d.Date = new Date(d.Year,12,01);
			return d;
}	
		
//map functions
function zoomed() {
  var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      ();

  projection
      .scale(zoom.scale() / 2 / Math.PI)
      .translate(zoom.translate());

		var image = layer
				.style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
				.selectAll(".tile")
				.data(tiles, function(d) { return d; });

				image.exit()
				.remove();

				image.enter().append("img")
				.attr("class", "tile")
				.attr("src", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/jhubley.8a8597b3/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
				.style("left", function(d) { return (d[0] << 8) + "px"; })
				.style("top", function(d) { return (d[1] << 8) + "px"; });
};

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