(function(){
  var w = 500;
	var h = 350;
	var seasonMatches = new Map()
	var totalRunsBalls = []
	var xScale, yScale;

	d3.json("./Visualizations/player_details.json", function(data) {
			keys = d3.keys(data);
			//console.log("data=", data);
			var margin = {top: 50, right: 100, bottom: 50, left: 100};
			var svg = d3.select("#ScatterPlotPlayer")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

			w = svg.attr("width") - margin.left - margin.right;
			h = svg.attr("height") - margin.top - margin.bottom;
			//Fetching the data

			var ballsRunsMap = new Map()
			var initialGraph = function(batsman){

				svg.selectAll("*").remove();
				// //console.log("Data=", data);
				// console.log();
				// matches data
				var nested_data = d3.nest()
													  .key(function(d) { return d[2]; })
														.key(function(d) { return d[0]; })
														.key(function(d) { return d[1]; })
													  .rollup(function(v) {
															return {
																"total_runs": d3.sum(v, function(d) {return d[4]}),
															"balls_faced":d3.sum(v, function(d) {return d[3]})}
														})
													  .entries(data);
				//matches data ends
				//console.log("Nested data count=", nested_data);
				nested_data.forEach(function(d){
					d.values.forEach(function(i){
						i.values.forEach(function(j){
							if (d.key == batsman) {
								ballsRunsMap.set(j.key, j.value)
								var obj = {};
								obj["Year"] = j.key;
								obj["total_runs"] = j.value.total_runs;
								obj["balls_faced"] = j.value.balls_faced;
								totalRunsBalls.push(obj);
							}
						})
					})
				})
				//console.log("map", ballsRunsMap);
				//console.log("totalRunsBalls", totalRunsBalls);
				// Scaling
				yScale = d3.scaleLinear()
				.domain([0, d3.max(totalRunsBalls, function(d) {
					// console.log("element", d);
					return d.total_runs;})])
				.rangeRound([h, 0])

				xScale = d3.scaleLinear()
				.domain([0, d3.max(totalRunsBalls, function(d) { return d.balls_faced;})])
				.rangeRound([0,w]);

				var g = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				g.append("text")
				.attr("x", (w)/2)
				.attr("y", -(margin.top / 4))
				.attr("text-anchor", "middle")
				.attr("font-weight","bold")
				.style("font-size", "16px")
				.style("text-decoration", "underline")
				.text("IPL Data - Scatter Plot for Batsman: " + batsman);

				//line function
				var line = d3.line()
				.x(function(d) { return xScale(d[0]); }) // set the x values for the line generator
				.y(function(d) { return yScale(d[1]); }) // set the y values for the line generator
				.curve(d3.curveMonotoneX) // apply smoothing to the line

				g.append("g")
				.attr("class", "x-axis")
				.attr("transform", "translate(0," + h + ")")
				.call(d3.axisBottom(xScale))
				.selectAll("text")
				.attr("y", 10)
				.attr("x", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "middle");

				g.append("g")
				.attr("class", "y-axis")
				.call(d3.axisLeft(yScale).ticks(10))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end");

				g.selectAll("circle")
				.data(totalRunsBalls).enter()
				.append("circle")
				.attr("cy", function(d) {
					return yScale(d.total_runs); })
				.attr("cx", function(d) { return xScale(d.balls_faced); })
				.attr("r", function(d, i) { return 4; })
				.style("fill", "coral")
				.on("mouseover", function(d){
					d3.select("#scattertooltip")
					.style("left", xScale(d.balls_faced) + "px")
					.style("top",  yScale(d.total_runs)  + "px")
					.select("#value")
					.html("Player: " + batsman + "<br/>" + "Balls Faced: " + d.balls_faced + "<br/>" + "Runs scored: " + d.total_runs + "<br/>" + "Year: " + d.Year + "<br/>");
					d3.select("#scattertooltip").classed("hidden", false);

				})
				.on("mouseout", function(d) {
						d3.select("#scattertooltip").classed("hidden", true);
						// g.selectAll("#tooltip_path").remove();
				});

			}//Function initialGraph ends

			svg.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", "translate("+ (margin.left/4) +","+(h/2)+")rotate(-90)")
			.attr("font-weight","bold")
			.text("Number of runs");

			svg.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", "translate("+ (w/2) +","+(h+(margin.top*2))+")")
			.attr("font-weight","bold")
			.text("Balls Faced");

			var dropdown = d3.select("#vis-container-sp")
			.insert("select", "svg")
			.on("change", function(){

			var selected_batsman = d3.select(this).property('value')
			// Run update function with the selected batsman
				initialGraph(selected_batsman)
			});

			var unique_players = []
			data.forEach(function(d){
				if(!unique_players.includes(d[2])){
					unique_players.push(d[2])
				}
			})
			unique_players =  unique_players.sort();

			dropdown.selectAll("option")
			.data(unique_players)
				.enter().append("option")
				.attr("value", function (d) { return d; })
			.text(function (d) {
					return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
				});
			initialGraph(unique_players[0]);
		});

})()
