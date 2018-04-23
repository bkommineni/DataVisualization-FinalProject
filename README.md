# Team : Anjani Bajaj , Bhargavi Kommineni

## [Project Proposal](https://docs.google.com/document/d/1thCe2jO5nzHneGDZ3bGYMHAQf7JScdcBN7u2UjIFCOk/edit#heading=h.qiry0ekz43dl)

## [Notes](https://docs.google.com/document/d/1lSc4E7B8FTIiY3WnjQDdcCs23JhIhWPhN9xIvkSEQvw/edit)

# Alpha Release

## Data Processing

For data processing, as mentioned in the project proposal, dataset doesn't provide the names of players in
each team during different years. As that information is required to analyze players across different teams
during different years, we have extracted that information from the existing data in json format.

### Steps involved:

1.Filter match ids of each year and store year with respective match ids from [matches.csv](https://github.com/bkommineni/DataVisualization-FinalProject/blob/master/data/matches.csv)

2.For each year based on match ids in [deliveries.csv](https://github.com/bkommineni/DataVisualization-FinalProject/blob/master/data/deliveries.csv) added players under "batsman" and "non_striker" to
batting team and players under "bowler" to bowling team

3.Verified the output of above process with the actual data available in [IPLT20](https://www.iplt20.com/) website

## Below are the sample static visualizations generated using the processed data for different years:

![alt tag](./images/IPL2008BarChart.png)

![alt tag](./images/IPL2009BarChart.png)

![alt tag](./images/IPL2010BarChart.png)

![alt tag](./images/IPL2011BarChart.png)

![alt tag](./images/IPL2012BarChart.png)


  <body>
    <script src="https://d3js.org/d3.v4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.20/topojson.min.js"></script>
    <script>
		var selected_year = 2017;

    var width = window.innerWidth, height = window.innerHeight;

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
		teamsMap.set("Gujarat Lions",{"color":"#ccebc5","state":"Gujarat"});

    var projection = d3.geoMercator();

    var path = d3.geoPath()
        .projection(projection)
        .pointRadius(2);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var g = svg.append("g");

    d3.json("india.json", function(error, geodata){


			d3.csv("matches.csv", function(matches_data) {

			d3.json("teams_by_year.json", function(data) {
					var boundary = centerZoom(geodata);
					drawOuterBoundary(geodata, boundary);
					var teams = getTeamsInParticularYear(data,selected_year);
					var subunits = drawSubUnits(geodata);
					colorSubunits(subunits,teams);
				});
			});


    });


		function getTeamsInParticularYear(data,year){
			keys = d3.keys(data);
			var teams;
			keys.forEach(function(d){
				if(d == year)
				{
					teams = d3.keys(data[d]);
				}
			});
			return teams;
		}

    function centerZoom(data){

      var o = topojson.mesh(data, data.objects.polygons, function(a, b) { return a === b; });

      projection
          .scale(1)
          .translate([0, 0]);

      var b = path.bounds(o),
          s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

      var p = projection
          .scale(s)
          .translate(t);

      return o;

    }

    function drawOuterBoundary(data, boundary){

      g.append("path")
          .datum(boundary)
          .attr("d", path)
          .attr("class", "subunit-boundary")
          .attr("fill", "none")
          .attr("stroke", "#3a403d");

    }

    function drawSubUnits(data){

      var subunits = g.selectAll(".subunit")
          .data(topojson.feature(data, data.objects.polygons).features)
        .enter().append("path")
          .attr("class", "subunit")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1px");

      return subunits;

    }

    function colorSubunits(subunits,teams) {

      var c = d3.scaleOrdinal(d3.schemeCategory20);
      subunits
          .style("fill", function(s){
						var c = 	"#ffffff";
						teams.forEach(function(d){
							if(teamsMap.get(d))
							{
								if(teamsMap.get(d).state == s.properties.st_nm)
								{
									c = teamsMap.get(d).color;
								}
							}
						});
						return c; })
          .style("opacity", ".8");

    }
    </script>

  </body>
