// Pie chart does not work yet
// Plan is that when a user hovers over a country, the number of billionaires
// in that country is displayed, the GDP and a pie chart showing the different
// age groups of billionaires.

window.onload = function(){

  // http://bl.ocks.org/mapsam/6090056
  queue()
    .defer(d3.json, 'top1000billionaires.json')
    .defer(d3.json, 'imf_gdp.json')
    .awaitAll(data);

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
        defaultFill: 'blue',
        high: '#2171b5',
        medium: '#6baed6',
        low: '#bdd7e7',
        very_low:'#eff3ff',
        test: 'blue',
      },

      data: {
         RUS: {fillKey: 'test'},
         DEU: {fillKey: 'low'},
         NLD: {fillKey: 'medium'},
         ESP: {fillKey: 'test'},
         PRT: {fillKey: 'test'},
         FRA: {fillKey: 'test'},
         DNK: {fillKey: 'test'},
         GBR: {fillKey: 'test'},
         IRL: {fillKey: 'test'},
         CHE: {fillKey: 'test'},
         NOR: {fillKey: 'test'},
         SWE: {fillKey: 'test'},
         FIN: {fillKey: 'test'},
         POL: {fillKey: 'test'},
         ITA: {fillKey: 'test'},
         AUT: {fillKey: 'test'},
         CZE: {fillKey: 'test'},
         SVK: {fillKey: 'test'},
         HUN: {fillKey: 'test'},
         EST: {fillKey: 'test'},
         LVA: {fillKey: 'test'},
         LTU: {fillKey: 'test'},
         GRC: {fillKey: 'test'},
         BIH: {fillKey: 'test'},
         HRV: {fillKey: 'test'},
         MKD: {fillKey: 'test'},
         SRB: {fillKey: 'test'},
         TUR: {fillKey: 'test'},
         UKR: {fillKey: 'test'},
         MDA: {fillKey: 'test'},
         ROU: {fillKey: 'test'},
         BGR: {fillKey: 'test'},
         BLR: {fillKey: 'test'},
         BEL: {fillKey: 'test'},
         MNE: {fillKey: 'test'},
         SVN: {fillKey: 'test'},
         ALB: {fillKey: 'test'}
       },
       // https://github.com/markmarkoh/datamaps

       geographyConfig: {
              popupTemplate: function(geo, data) {

                /*
                 * Counts number of billionaires in a country
                 */
                function billionaire_counter(country){

                  // initiate counter
                  billionaire_counter = 0

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

                  var quarts = calculate_age_quartiles(country)
                  console.log(quarts);

                  d3.select("#pie").html("");

                  var canvas = d3.select('#pie')
                            .append('svg')
                            .attr({'width':650,'height':1100});

                    var data = [{"label":"one", "value": quarts[0]},
                            {"label":"two", "value": quarts[1]},
                            {"label":"three", "value": quarts[2]},
                            {"label":"four", "value": quarts[3]},];

                            var colors = ['red','blue'];

                            var colorscale = d3.scale.linear().domain([0,data.length]).range(colors);

                    var arc = d3.svg.arc()
                            .innerRadius(0)
                            .outerRadius(100);

                    var arcOver = d3.svg.arc()
                            .innerRadius(0)
                            .outerRadius(150 + 10);

                    var pie = d3.layout.pie()
                            .value(function(d){ return d.value; });

                    var renderarcs = canvas.append('g')
                            .attr('transform','translate(175,100)')
                            .selectAll('.arc')
                            .data(pie(data))
                            .enter()
                            .append('g')
                            .attr('class',"arc");

                    renderarcs.append('path')
                        .attr('d',arc)
                        .attr('fill',function(d,i){ return colorscale(i); })

                    renderarcs.append('text')
                        .attr('transform',function(d) {
                            if (d.value == 0){
                              d.value = ""
                            }
                            var c = arc.centroid(d);
                                  return "translate(" + c[0] +"," + c[1]+ ")";
                                })

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
};
}
