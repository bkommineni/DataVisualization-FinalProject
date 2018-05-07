(function() {

  var width = 700,
  height = 700,
  outerRadius = height/2,
  innerRadius = outerRadius-80;

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

  var chord = d3.chord()
      .padAngle(.05)
      .sortSubgroups(d3.descending);



  var teams = Array.from(teamsMap.keys());
  teams = teams.sort();

  var colors = [];

  teams.forEach(function(d) {
    colors.push(teamsMap.get(d).color);
  });

  var fill = d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(colors);

  var country = teams;
  var matrix;
  var stats;

  d3.json("./Visualizations/matrix_wins.json", function(data) {
    d3.json("./Visualizations/total_stats.json", function(statsdata){

    var svg = d3.select("#chordD").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
          .append("svg:g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

    var initialGraph = function(year){
    svg.selectAll("*").remove();
    matrix = data[year];
    stats = statsdata[year];

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius+20);

    svg.datum(chord(matrix));

    var g = svg.selectAll("g.group")
          .data(function(chords) {
                      return chords.groups;
          })
        .enter().append("svg:g")
          .attr("class", "group")
          .on("mouseover", fade(.1))
          .on("mouseout", fade(1));

    g.append("svg:path")
          .style("stroke", function(d) { return fill(d.index); })
          .style("fill", function(d) { return fill(d.index); })
          .attr("d", arc);

      g.append("svg:text")
          .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
          .attr("dy", ".2em")
          .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
          .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"+
                 "translate(" + (innerRadius+25) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
          })
          .text(function(d) { return country[d.index]; })
          .style("font-size",8);

    	g.append("svg:title")
    		.text(function(d,i)	{
    				return "Matches Played: "+stats[i].TotalPlayed+"\n"+
    						"Won: "+stats[i].TotalWon+"\n"+
    						"Lost: "+stats[i].TotalLoss+"\n"+
                "No Result: "+stats[i].NoResult+"\n";
    		});

    var fade_path = svg.append("svg:g")
        .attr("class", "chord")
      .selectAll("path")
        .data(function(chords) {
                      return chords;
        })
      .enter().append("svg:path")
        .attr("d", d3.ribbon().radius(innerRadius))
        .style("fill", function(d) { return fill(d.source.index); })
    	.style("opacity", 1)
    	.on("mouseover", fade_chord(.3))
         .on("mouseout", fade_chord(1))
        .append("svg:title")
    	.text(function(d) {
        return "Number Of Wins"+
               "\n"+
              country[d.source.index]+" : "+d.source.value+"\n"+
              country[d.target.index]+" : "+d.target.value;
            });
    }


    var dropdown = d3.select("#vis-container-c")
    .insert("select", "svg")
    .on("change", function(){
      var selected_year = d3.select(this).property('value')
      initialGraph(selected_year)

    });

    year_data = Object.keys(data);
    var years = [];
    year_data.forEach(function(d){
      years.push(+d);
    });
    years =  years.sort();

    dropdown.selectAll("option")
    .data(years)
    .enter().append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) {
      return d;
    });

    initialGraph(years[0]);

    function fade(opacity) {
      return function(g, i) {
        svg.selectAll(".chord path")
            .filter(function(d) {
                    return d.source.index != i && d.target.index != i; })
          .transition()
            .style("opacity", opacity);
      };
    }

    function fade_chord(opacity) {
      return function() {
        var i = this;
        svg.selectAll(".chord path")
            .filter(function(d) {
            return this != i;
            })
          .transition()
            .style("opacity", opacity);
      };
    };


  });
});
})();
