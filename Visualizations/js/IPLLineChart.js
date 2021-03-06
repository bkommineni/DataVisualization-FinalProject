(function(){
  var w = 500;
  var h = 350;
  var seasonMatches = new Map()
  var batsman = "DA Warner";
  var totalRuns = []
  var xScale, yScale;

  d3.csv("./Visualizations/matches.csv", function(matches_data) {

    d3.csv("./Visualizations/deliveries.csv", function(data) {
      keys = d3.keys(data);

      var margin = {top: 50, right: 100, bottom: 50, left: 100};
      var svg = d3.select("#LinePlayer")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

      w = svg.attr("width") - margin.left - margin.right;
      h = svg.attr("height") - margin.top - margin.bottom;
      //Fetching the data
      matches_data.forEach(function(d){
        if(!seasonMatches.get(+d.season)){
          var ids = [];
          ids.push(+d.id);
          seasonMatches.set(+d.season,ids);
        }
        else {
          var ids = seasonMatches.get(+d.season);
          ids.push(+d.id);
          seasonMatches.set(+d.season,ids);
        }
      });

      var allYearPlayerMap = new Map()

      var initialGraph = function(batsman){

        //d3.select("g").remove();
        svg.selectAll("*").remove();
        var years = Array.from(seasonMatches.keys())
        years.forEach(function(s){
          // console.log(s);
          var matches = seasonMatches.get(s)
          var nested_data = d3.nest()
          .key(function(d) {
            if(matches.includes(+d.match_id))
            if(d.batsman == batsman){
              return d.batsman
            }
          })
          .rollup(function(d) {
            return d3.sum(d, function(g) {
              if(g.total_runs != "")
              {
                totalRuns.push(g.total_runs);
                return 1;
              }
            });
          })
          .entries(data);
          nested_data = nested_data.filter(function(d) { return d.key != "undefined" ;});
          nested_data.forEach(function(val){
            allYearPlayerMap.set(s, val.value)
          })
        })
        // console.log(allYearPlayerMap);

        allYearPlayerArray = Array.from(allYearPlayerMap)
        // console.log(allYearPlayerArray);

        allYearPlayerArray.sort()

        // Scaling
        xScale = d3.scaleBand()
        .domain(allYearPlayerArray.map(function(d) { return d[0]; }))
        .rangeRound([0, w])
        .paddingInner(1);

        yScale = d3.scaleLinear()
        .domain([0, d3.max(allYearPlayerArray, function(d) { return d[1];})])
        .rangeRound([h,0]);

        var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // g.append("text")
        // .attr("x", (w)/2)
        // .attr("y", -(margin.top / 4))
        // .attr("text-anchor", "middle")
        // .attr("font-weight","bold")
        // .style("font-size", "16px")
        // .style("text-decoration", "underline")
        // .text("IPL Data - Line chart for Batsman: " + batsman);

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

        g.append("path")
        .datum(allYearPlayerArray)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

        g.selectAll("circle")
        .data(allYearPlayerArray).enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d[0]); })
        .attr("cy", function(d) { return yScale(d[1]); })
        .attr("r", function(d, i) { return 4; })
        .style("fill", "steelblue")
        .on("mouseover", function(d){

          d3.select("#linetooltip")
          .style("left", xScale(d[0]) + "px")
          .style("top", yScale(d[1]) + "px")
          .select("#value")
          .html("Player: "+ batsman + "<br/>" + "Year: " + d[0]+"<br/>"+ "No of runs: " + d[1])
          .style("font-size",10+"px");
          //Show the tooltip
          d3.select("#linetooltip").classed("hidden", false);

          //tooltip path
          g.selectAll("#tooltip_path").data(d).enter().append("line")
            .attr("id", "tooltip_path")
            .attr("class", "line")
            .attr("d", line)
            .attr("x1", xScale(d[0]))
            .attr("x2", xScale(d[0]))
            .attr("y1", h)
            .attr("y2", yScale(d[1]))
            .attr("stroke", "steelblue")
            .style("stroke-dasharray", ("3, 3"));
        })
        .on("mouseout", function(d) {
            d3.select("#linetooltip").classed("hidden", true);
            g.selectAll("#tooltip_path").remove();
        });

        svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (margin.left/4) +","+(h/2)+")rotate(-90)")
        .attr("font-weight","bold")
        .text("Total number of runs");

      }//Function initialGraph ends

      // svg.append("text")
      // .attr("text-anchor", "middle")
      // .attr("transform", "translate("+ (w/2) +","+(h+(margin.top*2))+")")
      // .attr("font-weight","bold")
      // .text("Year");

      var dropdown = d3.select("#vis-container-l")
      .insert("select", "svg")
      .on("change", function(){

      var selected_batsman = d3.select(this).property('value')
      // Run update function with the selected batsman
        initialGraph(selected_batsman)
      });

      var unique_players = []
      data.forEach(function(d){
        if(!unique_players.includes(d.batsman)){
          unique_players.push(d.batsman)
        }
        if(!unique_players.includes(d.bowler)){
          unique_players.push(d.bowler)
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
  });

})()
