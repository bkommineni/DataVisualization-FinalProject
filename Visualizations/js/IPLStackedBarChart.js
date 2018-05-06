(function(){
  var w = 500;
  var h = 250;
  var seasonMatches = new Map();
  var dismissal_types = [];
  var selected_year = 2008;

  d3.csv("matches.csv", function(matches_data) {

  d3.csv("deliveries.csv", function(data) {
   var margin = {top: 50, right: 100, bottom: 50, left: 100};
   var svg1 = d3.select("#StackedBar")
              .append("svg")
              .attr("width", w)
              .attr("height", h);

   w = svg1.attr("width") - margin.left - margin.right;
   h = svg1.attr("height") - margin.top - margin.bottom;

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
  console.log("initialGraph");
  //d3.select("g_s").remove();
  svg1.selectAll("*").remove();

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

  var teams = [];
  nested_data.forEach(function(d) {
    teams.push(d.key);
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

  var g_s = svg1.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // g_s.append("text")
  //   .attr("x", (w)/2)
  //   .attr("y", -(margin.top / 4))
  //   .attr("text-anchor", "middle")
  //   .attr("font-weight","bold")
  //   .style("font-size", "16px")
  //   .style("text-decoration", "underline")
  //   .text("Stacked Bar chart for IPL data during "+year);

  g_s.append("g")
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
      .attr("width", xScale.bandwidth());

      g_s.append("g")
       .attr("class", "x-axis")
       .attr("transform", "translate(0," + h + ")")
       .call(d3.axisBottom(xScale).tickSize(0))
       .selectAll("text").remove();
       // .attr("y", 10)
       // .attr("x", 9)
       // .attr("dy", ".35em")
       // .style("font-size","6px")
       // .style("text-anchor", "middle");

       g_s.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end");



        var legend = g_s.append("g")
                      .attr("font-family", "sans-serif")
                      .attr("font-size", 10)
                      .attr("text-anchor", "end")
                    .selectAll("g")
                    .data(dismissal_types)
                    .enter().append("g")
                      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", w + 19)
            .attr("width", 5)
            .attr("height", 5)
            .style("fill", function(d, i) {
              return colors(i);
            });

        legend.append("text")
            .attr("x", w + 38)
            .attr("y", 5)
            .text(function(d) { return d; })
            .style("text-anchor", "start");
          }
          initialGraph(selected_year);

          var years = [];

          for (var [key, value] of seasonMatches) {
            years.push(key);
          }
          years = years.sort();
          console.log(years);

          svg1.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate("+ (margin.left/4) +","+(3*h/4)+")rotate(-90)")
            .attr("font-weight","bold")
            .text("No of dismissals");

          var dropdown = d3.select("#vis-container-s")
          .insert("select", "svg1")
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