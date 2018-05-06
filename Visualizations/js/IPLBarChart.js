(function(){
  var w = 500;
	var h = 250;
	var teamsMap = new Map();
	teamsMap.set("Chennai Super Kings",{"color":"#8dd3c7","state":"Tamilnadu"});
	teamsMap.set("Kochi Tuskers Kerala",{"color":"#ffffb3","state":"Kerala"});
	teamsMap.set("Royal Challengers Bangalore",{"color":"#bebada","state":"Karnataka"});
	teamsMap.set("Kings XI Punjab",{"color":"#fb8072","state":"Punjab"});
	teamsMap.set("Rajasthan Royals",{"color":"#80b1d3","state":"Rajasthan"});
	teamsMap.set("Delhi Daredevils",{"color":"#fdb462","state":"NCT of Delhi"});
	teamsMap.set("Mumbai Indians",{"color":"#b3de69","state":"Maharashtra"});
	teamsMap.set("Deccan Chargers",{"color":"#fccde5","state":"Telangana"});
	teamsMap.set("Sunrisers Hyderabad",{"color":"#fccde5","state":"Telangana"});
	teamsMap.set("Kolkata Knight Riders",{"color":"#d9d9d9","state":"West Bengal"});
	teamsMap.set("Pune Warriors",{"color":"#bc80bd","state":"Maharashtra"});
	teamsMap.set("Rising Pune Supergiants",{"color":"#bc80bd","state":"Maharashtra"});
	teamsMap.set("Rising Pune Supergiant",{"color":"#bc80bd","state":"Maharashtra"});
	teamsMap.set("Gujarat Lions",{"color":"#ccebc5","state":"Gujarat"});

	d3.csv("matches.csv", function(matches_data) {

		d3.json("teams_by_year.json", function(data) {
			keys = d3.keys(data);
			var year = 2012;

			var margin = {top: 50, right: 100, bottom: 50, left: 100};
			var svg = d3.select("#Bar")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

			w = svg.attr("width") - margin.left - margin.right;
			h = svg.attr("height") - margin.top - margin.bottom;

			var year_data = d3.nest()
			.key(function(d) {
				return d.season
			})
			.entries(matches_data);
			var initialGraph = function(year){

				//d3.select("g").remove();
        svg.selectAll("*").remove();
				let teams_year_data;
				year_data.forEach(function(d){
					if(+d.key == year)
					{
						teams_year_data = d.values;
					}
				});

				var nested_data = d3.nest()
				.key(function(d) {
					if(d.winner != "")
					return d.winner;
				})
				.rollup(function(d) {
					return d3.sum(d, function(g) {
						if(g.winner != "")
						return 1;
					});
				}).entries(teams_year_data);
				nested_data = nested_data.filter(function(d) { return d.key != "undefined" ;})
				console.log("Nested Data:", nested_data);
				nested_data.forEach(function(d) {
					d.Team = d.key;
					d.Wins = +d.value;
				});

				var xScale = d3.scaleBand()
				.domain(nested_data.map(function(d) { return d.Team; }))
				.rangeRound([0, w])
				.paddingInner(0.15);

				var yScale = d3.scaleLinear()
				.domain([0, d3.max(nested_data, function(d) { return d.Wins;})])
				.rangeRound([h,0]);

				var g = svg.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				g.append("text")
				.attr("x", (w)/2)
				.attr("y", -(margin.top / 4))
				.attr("text-anchor", "middle")
				.attr("font-weight","bold")
				.style("font-size", "16px")
				.style("text-decoration", "underline")
				.text("Bar chart for IPL data during :" + year);

				g.append("g")
				.attr("class", "x-axis")
				.attr("transform", "translate(0," + h + ")")
				.call(d3.axisBottom(xScale).tickSize(0))
				.selectAll("text").remove();
				// .attr("y", 10)
				// .attr("x", 9)
				// .attr("dy", ".35em")
				// .style("font-size","6px")
				// .style("text-anchor", "middle");

				g.append("g")
				.attr("class", "y-axis")
				.call(d3.axisLeft(yScale).ticks(10))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end");


				g.selectAll("rect")
				.data(nested_data)
				.enter()
				.append("rect")
				.style("fill", function(d){
					console.log(d.Team);
					return teamsMap.get(d.Team).color;
				})
					.attr("width", xScale.bandwidth())
					.attr("x", function(d) { return xScale(d.Team); })
					.attr("y", function(d) { return yScale(d.Wins); })
					.attr("height", function(d) { return h - yScale(d.Wins); })
					.on("mouseover", function(d) {

						//Get this bar's x/y values, then augment for the tooltip
						var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
						var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;
						//Update the tooltip position and value
						d3.select("#tooltip")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")
						.select("#value")
						.text(d.key + " won " + d.Wins + " matches in " + year);
						console.log("In mouse over"+ xPosition);
						//Show the tooltip
						d3.select("#tooltip").classed("hidden", false);
					})
					.on("mouseout", function() {
						//Hide the tooltip
						d3.select("#tooltip").classed("hidden", true);
					})

				}
				initialGraph(year);

				svg.append("text")
				.attr("text-anchor", "middle")
				.attr("transform", "translate("+ (margin.left/4) +","+(h/2)+")rotate(-90)")
				.attr("font-weight","bold")
				.text("No of wins");

				var dropdown = d3.select("#vis-container")
				.insert("select", "svg")
				.on("change", function(){
					var selected_year = d3.select(this).property('value')
					console.log("Selected year=", selected_year)
					// Run update function with the selected fruit
					initialGraph(selected_year)

				});

				console.log(d3.keys(year_data));
				var years = [];
				year_data.forEach(function(d){
					years.push(+d.key);
				});
				years =  years.sort();

				dropdown.selectAll("option")
				.data(years)
				.enter().append("option")
				.attr("value", function (d) { return d; })
				.text(function (d) {
					return d;
				});
			});
		});
})();