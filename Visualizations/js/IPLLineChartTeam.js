(function(){
  var w = 800;
  var h = 250;

  d3.csv("./Visualizations/matches.csv", function(matches_data) {

    d3.json("./Visualizations/teams_by_year.json", function(data) {
      keys = d3.keys(data);
      var year = 2012;
      var margin = {top: 50, right: 100, bottom: 50, left: 100};
      var svg = d3.select("#LineTeam")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

      w = svg.attr("width") - margin.left - margin.right;
      h = svg.attr("height") - margin.top - margin.bottom;

      var team_data = d3.nest()
      .key(function(d) {
        return d.winner
      })
      .entries(matches_data);

      var teams = []
      team_data.forEach(function(d){
        if(d.key != ""){
          console.log(d.key);
          teams.push(d.key)
        }
      })
      sorted_teams =  teams.sort();

      var selected_team = sorted_teams[0];

      //Function for drawing the graph
      var drawGraph = function(selected_team){
        //d3.select("g").remove();
        svg.selectAll("*").remove();

        let single_team_data;

        team_data.forEach(function(d){
          if(d.key == selected_team){
            single_team_data = d.values;
          }
        });

        var nested_data = d3.nest()
        .key(function(g){
          return g.season
        })
        .rollup(function(d) {
          return d3.sum(d, function(g) {
            if(g.winner != "")
            return 1
          });
        }).entries(single_team_data);

        nested_data = nested_data.filter(function(d) { return d.key != "undefined" ;})
        // console.log("Nested Data:", nested_data);
        nested_data.forEach(function(d) {
          d.Year = d.key;
          d.Wins = d.value;
        });

        nested_data.sort(function(a, b) {
          return parseInt(a.Year) - parseInt(b.Year);
        });

        var xScale = d3.scaleBand()
        .domain(nested_data.map(function(d) { return d.Year; }))
        .rangeRound([0, w])
        .paddingInner(1);

        var yScale = d3.scaleLinear()
        .domain([0, d3.max(nested_data, function(d) { return d.Wins;})])
        .rangeRound([h,0]);

        //line function
        var line = d3.line()
        .x(function(d) { return xScale(d.Year); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.Wins); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

        var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.append("text")
        .attr("x", (w)/2)
        .attr("y", -(margin.top / 4))
        .attr("text-anchor", "middle")
        .attr("font-weight","bold")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Line chart for IPL data for " + selected_team);

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
        .datum(nested_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

        g.selectAll("circle")
        .data(nested_data).enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.Year); })
        .attr("cy", function(d) { return yScale(d.Wins); })
        .attr("r", function(d, i) { return 4; })
        .style("fill", "steelblue")
        .on("mouseover", function(d){

          d3.select("#linetooltipteam")
          .style("left", xScale(d.Year) + "px")
          .style("top", yScale(d.Wins) + "px")
          .select("#value")
          .text(d.Wins + " wins in " + d.Year + " by "+ selected_team)
          //Show the tooltip
          d3.select("#linetooltipteam").classed("hidden", false);
          console.log("h=", yScale(d.Wins));
          //tooltip path
          g.selectAll("#tooltip_path")
          .data([d]).enter().append("line")
          .attr("id", "tooltip_path")
          .attr("class", "line")
          .attr("d", line)
          .attr("x1", xScale(d.Year))
          .attr("x2", xScale(d.Year))
          .attr("y1", h)
          .attr("y2", yScale(d.Wins))
          .attr("stroke", "steelblue")
          .style("stroke-dasharray", ("3, 3"));
        })
        .on("mouseout", function(d) {
          d3.select("#linetooltipteam").classed("hidden", true);
          g.selectAll("#tooltip_path").remove();
        });
      }// drawGraph ends
      drawGraph(selected_team);

      var dropdown = d3.select("#vis-container-lt")
      .insert("select", "svg")
      .on("change", function(){
        var selected_team = d3.select(this).property('value')
        console.log("Selected team=", selected_team)
        // Run update function with the selected batsman
        drawGraph(selected_team)
      });

      dropdown.selectAll("option")
      .data(sorted_teams)
      .enter().append("option")
      .attr("value", function (d) { return d; })
      .text(function (d) {
        return d;
      });

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+ (w/2) +","+(h+(margin.top*2))+")")
      .attr("font-weight","bold")
      .text("Year");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+ (margin.left/4) +","+(h/2)+")rotate(-90)")
      .attr("font-weight","bold")
      .text("No of wins");

    });
  });
})()
