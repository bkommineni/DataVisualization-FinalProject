(function(){

  var width = 600, height = 600;

  var teamsMap = new Map();
  teamsMap.set("Chennai Super Kings",{"color":"#8dd3c7","state":"Tamil Nadu","img":"CSK.jpeg"});
  teamsMap.set("Kochi Tuskers Kerala",{"color":"#ffffb3","state":"Kerala","img":"KOCHI.png"});
  teamsMap.set("Royal Challengers Bangalore",{"color":"#bebada","state":"Karnataka","img":"RCB.jpg"});
  teamsMap.set("Kings XI Punjab",{"color":"#fb8072","state":"Punjab","img":"PUN.png"});
  teamsMap.set("Rajasthan Royals",{"color":"#80b1d3","state":"Rajasthan","img":"RR.png"});
  teamsMap.set("Delhi Daredevils",{"color":"#fdb462","state":"NCT of Delhi","img":"DD.jpg"});
  teamsMap.set("Mumbai Indians",{"color":"#b3de69","state":"Maharashtra","img":"MI.jpg"});
  teamsMap.set("Deccan Chargers",{"color":"#fccde5","state":"Telangana","img":"DC.jpg"});
  teamsMap.set("Sunrisers Hyderabad",{"color":"#fccde5","state":"Telangana","img":"SRH.png"});
  teamsMap.set("Kolkata Knight Riders",{"color":"#d9d9d9","state":"West Bengal","img":"KKR.png"});
  teamsMap.set("Pune Warriors",{"color":"#bc80bd","state":"Maharashtra","img":"PUNE.jpg"});
  teamsMap.set("Gujarat Lions",{"color":"#ccebc5","state":"Gujarat","img":"GUJ.jpeg"});

  var projection = d3.geoMercator()
                     .translate([width/2,height/2])
                     .scale([100]);

  var path = d3.geoPath()
      .projection(projection)
      .pointRadius(2);

  var svg = d3.select("#Map").append("svg")
      .attr("width", width)
      .attr("height", height);

  var g = svg.append("g");

  d3.json("./Visualizations/india.json", function(error, geodata){

    d3.csv("./Visualizations/matches.csv", function(matches_data) {

    d3.json("./Visualizations/teams_by_year.json", function(data) {
        var boundary = centerZoom(geodata);
        drawOuterBoundary(geodata, boundary);
        //var teams = getTeamsInParticularYear(data,selected_year);
        var teams = Array.from(teamsMap.keys());
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
              ////console.log("Map state: ",teamsMap.get(d).state ,"json state: ",s.properties.st_nm);
              if(teamsMap.get(d).state == s.properties.st_nm)
              {
                ////console.log("state: ",teamsMap.get(d).state);
                c = teamsMap.get(d).color;
              }
            }
          });
          return c; })
        .style("opacity", ".8")
        .on("mouseover", function(s) {
          var x = d3.mouse(this)[0];
          var y = d3.mouse(this)[1];
          var xPosition = parseFloat(x);
          var yPosition = parseFloat(y);

          teams.forEach(function(d){
            if(teamsMap.get(d))
            {
              if(teamsMap.get(d).state == s.properties.st_nm)
              {
                var teamlogo = svg.append("image")
                              .attr("width", 75)
                              .attr("height", 75)
                              .attr("x", xPosition+5)
                              .attr("y", yPosition-10);
                teamlogo.attr("xlink:href", "");
                teamlogo.attr("xlink:href", "./Visualizations/images/"+teamsMap.get(d).img);
              }
            }
          });
        })
        .on("mouseout", function() {
          d3.selectAll("image").remove();
        });

  }

})();
