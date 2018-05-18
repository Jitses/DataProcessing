/*
 * Jitse Schol
 * Data Processing
 * Student Number: 10781463
 * 18-5-2018
 */

window.onload = function(){

  // http://bl.ocks.org/mapsam/6090056
  queue()
    .defer(d3.json, 'top1000billionaires.json')
    .defer(d3.json, 'imf_gdp.json')
    .awaitAll(data);

  // uses response of data
  function data(error, response){
    var dataset_billionaires = response[0]['data']
    var dataset_GDP = response[1]['data']

    // basic map config with custom fills, mercator projection
    var map = new Datamap({
      scope: 'world',
      element: document.getElementById('container1'),
      projection: 'mercator',
      height: 800,
      fills: {
        defaultFill: '#E8E8E8',
      },

       geographyConfig: {
              popupTemplate: function(geo, data) {

                /*
                 * Counts number of billionaires in a country
                 */
                function billionaire_counter(country){

                  // initiate counter
                  var billionaire_counter = 0

                  // loop over dataset
                  for(i = 0; i < dataset_billionaires.length; i++){

                    // if billionaire lives in the given country
                    if (dataset_billionaires[i]['Country'] == country) {

                      // increase counter by 1
                      billionaire_counter++
                    };
                  };
                  return billionaire_counter
                };

                /*
                 * Calculates the quartiles of the age of billionaires in a specified country
                 */
                function calculate_age_quartiles(country){

                  // initiate quartile counters
                  quartile1 = 0
                  quartile2 = 0
                  quartile3 = 0
                  quartile4 = 0

                  // loop over dataset
                  for(i = 0; i < dataset_billionaires.length; i++){

                    // if billionaire in specified country is below or equal to 25 years old
                    if ((dataset_billionaires[i]['Country'] == country) && (dataset_billionaires[i]['Age'] <= 25)) {
                        quartile1 += 1
                    }

                    // if billionaire in specified country is below or equal to 50 years old
                    else if ((dataset_billionaires[i]['Country'] == country) && (dataset_billionaires[i]['Age'] <= 50)) {
                        quartile2 += 1
                    }

                    // if billionaire in specified country is below or equal to 75 years old
                    else if ((dataset_billionaires[i]['Country'] == country) && (dataset_billionaires[i]['Age'] <= 75)) {
                        quartile3 += 1
                    }

                    // if billionaire in specified country is below or equal to 100 years old
                    else if ((dataset_billionaires[i]['Country'] == country) && (dataset_billionaires[i]['Age'] <= 100)) {
                        quartile4 += 1
                    };
                };
                  return [quartile1, quartile2, quartile3, quartile4]
                }

                /* Creates pie chart showing the different age groups of billionaries in
                 * percentages.
                 * Retrieved from http://bl.ocks.org/kiranml1/6872886
                 */
                function create_pie_chart(country){

                  // store quartiles in quarts
                  var quarts = calculate_age_quartiles(country)


                  d3.select("#pie").html("");

                  // create canvas
                  var canvas = d3.select('#pie')
                            .append('svg')
                            .attr({'width':650,'height':1100});

                  // initiate data, which are the different elements of quarts
                  var data = [{"label":"one", "value": quarts[0]},
                            {"label":"two", "value": quarts[1]},
                            {"label":"three", "value": quarts[2]},
                            {"label":"four", "value": quarts[3]},];

                            var colors = ['red','blue'];

                            var colorscale = d3.scale.linear().domain([0,data.length]).range(colors);

                    // set inner and outer radius
                    var arc = d3.svg.arc()
                            .innerRadius(0)
                            .outerRadius(100);

                    var pie = d3.layout.pie()
                            .value(function(d){ return d.value; });

                    // render arcs
                    var renderarcs = canvas.append('g')
                            .attr('transform','translate(175, 100)')
                            .selectAll('.arc')
                            .data(pie(data))
                            .enter()
                            .append('g')
                            .attr('class',"arc");

                    // fill pie with colours
                    renderarcs.append('path')
                        .attr('d',arc)
                        .attr('fill',function(d,i){ return colorscale(i); })

                    // append text
                    renderarcs.append('text')
                        .attr('transform',function(d) {
                            if (d.value == 0){
                              d.value = ""
                            }
                            var c = arc.centroid(d);
                                  return "translate(" + c[0] +"," + c[1]+ ")";
                                })
                        .attr('fill', 'white')
                        .style('font-size', '15px')
                        .text(function(d){ return d.value; });

                        if (quarts[0] == 0 && quarts[1] == 0 && quarts[2] == 0 && quarts[3] == 0){
                          d3.select("#pie").html("No billionaires");
                        }
                        return d3.select("#pie").node().innerHTML;
                  }

                // retrieves GDP of country
                function GDP(country){

                  for(i = 0; i < dataset_GDP.length; i++){
                    if (dataset_GDP[i]['Country'] == country){
                      return dataset_GDP[i]['GDP']
                    }
                  }

                  // if no data is available
                  return "No GDP Data"
                };

                  // https://www.w3schools.com/jsref/met_node_appendchild.asp
                  // create info div with all necessary information in it when user hovers over country
                  return ['<div id="hoverinfo" style= "color: white; background-color: black; position: relative; width:350px; height:400px;">',
                          'GDP (billions US dollars): ' + GDP(geo.properties.name), '<br>'
                          +
                          'Number of billionaires in ' + geo.properties.name,
                          ': ' + billionaire_counter(geo.properties.name) +
                          '<br>' +
                          'Number of billionaires in different age groups:' + '<br>' +
                          '<ul class="legend">' +
                          '<li id="quantile1_legend"></li><li class="legend_text">0-25<li>' +
                          '<li id="quantile2_legend"></li><li class="legend_text">26-50<li>' +
                          '<li id="quantile3_legend"></li><li class="legend_text">51-75<li>' +
                          '<li id="quantile4_legend"></li><li class="legend_text">76-100<li>' +
                          '</ul>' + create_pie_chart(geo.properties.name) +
                          '</div>'].join('');
      }
    }

  });

  // updates colors, used in the different color themes
  function color_updater(colorinput){
    var countries = Datamap.prototype.worldTopo.objects.world.geometries;
    for (var j = 0; j < countries.length; j++) {
      if (countries[j].properties.name == dataset_GDP[i]["Country"]){
        var country_code = countries[j].id

        // https://stackoverflow.com/questions/40423615/dynamically-updating-datamaps-fill-color-not-working-using-variable-as-country-k
        var color = colorinput
        var country_color = {};
        country_color[country_code] = color

        // https://github.com/markmarkoh/datamaps/releases/tag/v0.2.2
        map.updateChoropleth(country_color);
      }
    }
  }

  // this function is activated as default on load and when the user clicks the blue theme button
  function blue_theme(){

    // https://stackoverflow.com/questions/25044145/datamaps-get-list-of-country-codes

    for (i = 0; i < dataset_GDP.length; i++){
      // very low GDP
      if (dataset_GDP[i]["GDP"] < 1000){
        color_updater("#bdd7e7")
      }
      // low GDP
      else if (dataset_GDP[i]["GDP"] < 5000){
        color_updater("#6baed6")
      }
      // medium GDP
      else if (dataset_GDP[i]["GDP"] < 10000){
        color_updater("#3182bd")
      }
      // high GDP
      else if (dataset_GDP[i]["GDP"] < 25000){
        color_updater("#08519c")
      }
    }
    document.getElementById("no_data").style.backgroundColor = "#E8E8E8";
    document.getElementById("very_low_gdp").style.backgroundColor = "#bdd7e7";
    document.getElementById("low_gdp").style.backgroundColor = "#6baed6";
    document.getElementById("medium_gdp").style.backgroundColor = "#3182bd";
    document.getElementById("high_gdp").style.backgroundColor = "#08519c";
  }

    // call blue theme function
    blue_theme()

    // updates the screen to a green theme
    function green_theme(){

      // https://stackoverflow.com/questions/25044145/datamaps-get-list-of-country-codes
      var countries = Datamap.prototype.worldTopo.objects.world.geometries;
      for (i = 0; i < dataset_GDP.length; i++){
        // very low GDP
        if (dataset_GDP[i]["GDP"] < 1000){
          color_updater("#bae4b3")
        }
        // low GDP
        else if (dataset_GDP[i]["GDP"] < 5000){
          color_updater("#74c476")
        }
        // medium GDP
        else if (dataset_GDP[i]["GDP"] < 10000){
          color_updater("#31a354")
        }
        // high GDP
        else if (dataset_GDP[i]["GDP"] < 25000){
          color_updater("#006d2c")
        }
      }
      document.getElementById("no_data").style.backgroundColor = "#E8E8E8";
      document.getElementById("very_low_gdp").style.backgroundColor = "#bae4b3";
      document.getElementById("low_gdp").style.backgroundColor = "#74c476";
      document.getElementById("medium_gdp").style.backgroundColor = "#31a354";
      document.getElementById("high_gdp").style.backgroundColor = "#006d2c";
    }

    // https://stackoverflow.com/questions/14425397/onclick-function-runs-automatically
    function update(){
      document.getElementById("blue_button").onclick = function(){
        blue_theme()}
      document.getElementById("green_button").onclick = function(){
        green_theme()}
    }
    update()
  };
}
