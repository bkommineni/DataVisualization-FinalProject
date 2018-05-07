(function(){
  var w = 500;
  var h = 350;
  var seasonMatches = new Map();
  var dismissal_types = [];
  var selected_year = 2008;
  var teamsMap = new Map();
  teamsMap.set("Chennai Super Kings",{"color":"#8dd3c7","state":"Tamilnadu","Short_name":"CSK"});
  teamsMap.set("Kochi Tuskers Kerala",{"color":"#ffffb3","state":"Kerala","Short_name":"KTK"});
  teamsMap.set("Royal Challengers Bangalore",{"color":"#bebada","state":"Karnataka","Short_name":"RCB"});
  teamsMap.set("Kings XI Punjab",{"color":"#fb8072","state":"Punjab","Short_name":"KXIP"});
  teamsMap.set("Rajasthan Royals",{"color":"#80b1d3","state":"Rajasthan","Short_name":"RR"});
  teamsMap.set("Delhi Daredevils",{"color":"#fdb462","state":"NCT of Delhi","Short_name":"DD"});
  teamsMap.set("Mumbai Indians",{"color":"#b3de69","state":"Maharashtra","Short_name":"MI"});
  teamsMap.set("Deccan Chargers",{"color":"#fccde5","state":"Telangana","Short_name":"DC"});
  teamsMap.set("Sunrisers Hyderabad",{"color":"#fccde5","state":"Telangana","Short_name":"SRH"});
  teamsMap.set("Kolkata Knight Riders",{"color":"#d9d9d9","state":"West Bengal","Short_name":"KKR"});
  teamsMap.set("Pune Warriors",{"color":"#bc80bd","state":"Maharashtra","Short_name":"PWI"});
  teamsMap.set("Rising Pune Supergiants",{"color":"#bc80bd","state":"Maharashtra","Short_name":"RPS"});
  teamsMap.set("Rising Pune Supergiant",{"color":"#bc80bd","state":"Maharashtra","Short_name":"RPS"});
  teamsMap.set("Gujarat Lions",{"color":"#ccebc5","state":"Gujarat","Short_name":"GL"});

  d3.csv("./Visualizations/matches.csv", function(matches_data) {

  d3.csv("./Visualizations/deliveries.csv", function(data) {
   var margin = {top: 50, right: 100, bottom: 50, left: 100};
   var svg = d3.select("#StackedBar")
              .append("svg")
              .attr("width", w)
              .attr("height", h);

   w = svg.attr("width") - margin.left - margin.right;
   h = svg.attr("height") - margin.top - margin.bottom;

    matches_data.forEach(function(d){
        if(!seasonMatches.get(+d.season))
        {
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

  var initialGraph = function(year){

  svg.selectAll("*").remove();

  var matches = seasonMatches.get(+year);

  var nested_data = d3.nest()
                      .key(function(d) {
                        if(matches.includes(+d.match_id ))
                          return d.bowling_team;
                        })
                      .key(function(d) {
                        if(d.dismissal_kind != "")
                        {
                          return d.dismissal_kind;
                        }
                      })
                      .rollup(function(d) {
                        return d3.sum(d, function(g) {
                            if(g.dismissal_kind != "")
                            {
                              dismissal_types.push(g.dismissal_kind);
                              return 1;
                            }
                      });
                      })
                      .entries(data);
  var unique_values = [];

  dismissal_types.forEach(function(d) {
    if(!unique_values.includes(d))
    {
      unique_values.push(d);
    }
  });

  dismissal_types = unique_values;

  nested_data = nested_data.filter(function(d) { return d.key != "undefined" ;});
  var neat_data = [];
  nested_data.forEach(function (c) {
    var dismissals = c.values;
    dismissals = dismissals.filter(function(d) { return d.key != "undefined" ;});
    var obj = {};
    obj["Team"] = c.key;
    var types = [];
    dismissals.forEach(function(g) {
      types.push(g.key);
    });

    dismissal_types.forEach(function(g) {
      if(!types.includes(g))
      {
        obj[g] = 0;
      }
    })
    dismissals.forEach(function(d) {
      obj[d.key] = d.value;
    });
    neat_data.push(obj);
  });

  var stack = d3.stack()
                .keys(dismissal_types)
                .order(d3.stackOrderDescending);

  var series = stack(neat_data);
  //console.log("Neat data=", neat_data, "Stack=", series);
  var teams = [];
  nested_data.forEach(function(d) {
    teams.push(teamsMap.get(d.key).Short_name);
  });

  var xScale = d3.scaleBand()
                  .domain(teams)
                  .range([0, w])
                  .paddingInner(0.15);

  var yScale = d3.scaleLinear()
                  .domain([0,
                    d3.max(neat_data, function(d) {
                      var val = 0;
                      dismissal_types.forEach(function(g) {
                        val = val + d[g];
                      });
                      return val;
                    })
                  ])
                  .range([h, 0]);

  var colors = d3.scaleOrdinal(d3.schemeCategory10);

  var g = svg.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // g.append("text")
  //   .attr("x", (w)/2)
  //   .attr("y", -(margin.top / 4))
  //   .attr("text-anchor", "middle")
  //   .attr("font-weight","bold")
  //   .style("font-size", "16px")
  //   .style("text-decoration", "underline")
  //   .text("Stacked Bar chart for IPL data during "+ year);

  //console.log("Series=", series);
  g.append("g")
    .selectAll("g")
    .data(series)
    .enter()
    .append("g")
    .style("fill", function(d, i) {
      return colors(i);
    })
    .selectAll("rect")
      .data(function(d) {
        return d; })
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return xScale(teams[i]);
      })
      .attr("y", function(d) {
        return yScale(d[1]);
      })
      .attr("height", function(d) {
        return yScale(d[0]) - yScale(d[1]);
      })
      .attr("width", xScale.bandwidth())
      .on("mouseover", function(d, i) {

        var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
        var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

          var tooltipText = "Year: " + year +"<br/>"+ "Team: " + d.data.Team+"<br/>"
          + " Total dismissals : ";
          neat_data.forEach(function(i){
            if (i.Team == d.data.Team) {
              var val = 0;
              var maxval = 0;
              dismissal_types.forEach(function(g) {
                val = val + i[g];
                if(i[g] > maxval){
                  maxval = i[g];
                  type = g;
                }
              });
            tooltipText = tooltipText.concat(+val)+"<br/>";
            tooltipText = tooltipText.concat(" Major dismissal type: "
            + type + "<br/>" + type + " dismissals: "+ maxval+"<br/>");
          }})

        d3.select("#stackebartooltip")
        .html(tooltipText)
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style("font-size",10+"px");
        d3.select("#stackebartooltip").classed("hidden", false);
      })
      .on("mouseout", function() {
        d3.select("#stackebartooltip").classed("hidden", true);
      })

      g.append("g")
       .attr("class", "x-axis")
       .attr("transform", "translate(0," + h + ")")
       .call(d3.axisBottom(xScale).tickSize(0))
       .selectAll("text")//.remove();
       .attr("y", 10)
       .attr("x", 1)
       .attr("dy", ".35em")
       .style("font-size","10px")
       .style("text-anchor", "middle");

       g.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end");

        var legend = g.append("g")
                      .attr("font-family", "sans-serif")
                      .attr("font-size", 10)
                      .attr("text-anchor", "end")
                    .selectAll("g")
                    .data(dismissal_types)
                    .enter().append("g")
                      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", w + 19)
            .attr("width", 19)
            .attr("height", 19)
            .style("fill", function(d, i) {
              return colors(i);
            });

        legend.append("text")
            .attr("x", w + 38)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; })
            .style("text-anchor", "start");
          }
          initialGraph(selected_year);

          var years = [];

          for (var [key, value] of seasonMatches) {
            years.push(key);
          }
          years = years.sort();
          // //console.log(years);

          svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate("+ (margin.left/4) +","+(h/2)+")rotate(-90)")
            .attr("font-weight","bold")
            .text("No of dismissals");

          var dropdown = d3.select("#vis-container-s")
          .insert("select", "svg")
          .on("change", function(){
            var selected_year = d3.select(this).property('value')
            initialGraph(selected_year)
          });

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
