/*
 *  Jitse Schol
 *  Data Processing
 *  10781463
 *  Creates scatter plot
 *  API laadt niet altijd goed. Dit komt door de API zelf en ik kan hier dus niets aan doen.
 *  Tim zei daarom dat prima was als ik de data in local files gebruik, mocht de API niet goed inladen.
 */

window.onload = function() {

  var data_aapl = "https://www.quandl.com/api/v3/datasets/WIKI/AAPL.json?start_date=2012-12-31&end_date=2016-12-31&order=asc&column_index=4&collapse=monthly&api_key=z7HWxtETQLyGKJgd_Jx9"
  var data_msft = "https://www.quandl.com/api/v3/datasets/WIKI/MSFT.json?start_date=2012-12-31&end_date=2016-12-31&order=asc&column_index=4&collapse=monthly&api_key=z7HWxtETQLyGKJgd_Jx9"
  var data_amzn =  "https://www.quandl.com/api/v3/datasets/WIKI/AMZN.json?start_date=2012-12-31&end_date=2016-12-31&order=asc&column_index=4&collapse=monthly&api_key=z7HWxtETQLyGKJgd_Jx9"
  var data_nflx =  "https://www.quandl.com/api/v3/datasets/WIKI/NFLX.json?start_date=2012-12-31&end_date=2016-12-31&order=asc&column_index=4&collapse=monthly&api_key=z7HWxtETQLyGKJgd_Jx9"

  // initiate x and y scale variables
  var x_scale = 0
  var y_scale = 0

  svg_height = 600;
  svg_width = 1000;

  // create SVG element, http://alignedleft.com/tutorials/d3/making-a-scatterplot
  var svg = d3.select("body")
      .append("svg")
      .attr("width", svg_width)
      .attr("height", svg_height)
      .attr("class", "svg");

  // initalize empty arrays
  aapl_changes = []
  msft_changes = []
  amzn_changes = []
  nflx_changes = []

  // create array that stores minimum and maximum values of x coordinates
  min_max_x_values = []

  stock_amzn_changes = []
  aapl_amzn_changes = []
  msft_amzn_changes = []
  nflx_amzn_changes = []

  d3.queue()
    .defer(d3.request, data_aapl)
    .defer(d3.request, data_msft)
    .defer(d3.request, data_amzn)
    .defer(d3.request, data_nflx)
    .awaitAll(data);
};

function data(error, response){

  // if response failed, load local files
  if (!response){
    d3.queue()
      .defer(d3.json, "aapl.json")
      .defer(d3.json, "msft.json")
      .defer(d3.json, "amzn.json")
      .defer(d3.json, "nflx.json")
      .awaitAll(data);
  }

  // if response was from API
  else if (response[0].responseText){
    console.log("API:")

    // parse aapl data
    aapl_json = JSON.parse(response[0]['response'])
    aapl_json = aapl_json['dataset']['data']

    // parse msft data
    msft_json = JSON.parse(response[1]['response'])
    msft_json = msft_json['dataset']['data']

    // parse amzn data
    amzn_json = JSON.parse(response[2]['response'])
    amzn_json = amzn_json['dataset']['data']

    // parse netflix data
    nflx_json = JSON.parse(response[3]['response'])
    nflx_json = nflx_json['dataset']['data']


    scatter_data(aapl_changes, stock_amzn_changes)
    scatter_data(msft_changes, stock_amzn_changes)
    scatter_data(nflx_changes, stock_amzn_changes)
    create_axes()
    create_circles(stock_amzn_changes)

    // check for user click
    stock_click()
  }

  // if local file is used
  else {
    console.log("local:")
    aapl_json = response[0]['dataset']['data']
    msft_json = response[1]['dataset']['data']
    amzn_json = response[2]['dataset']['data']
    nflx_json = response[3]['dataset']['data']

    // call scatter_data function for all stocks stored in one array
    scatter_data(aapl_changes, stock_amzn_changes)
    scatter_data(msft_changes, stock_amzn_changes)
    scatter_data(nflx_changes, stock_amzn_changes)
    create_axes()
    create_circles(stock_amzn_changes)

    // check for user click
    stock_click()
  }
};

function scales(){

  // set domain and range for x
  var domain_min_x = Math.min.apply(null, min_max_x_values);
  var domain_max_x = Math.max.apply(null, min_max_x_values);
  var range_min_x = 0;
  var range_max_x = svg_width;


  // create x scale using x domain and x range
  x_scale = d3.scaleLinear()
      .domain([domain_min_x, domain_max_x])
      .range([range_min_x, range_max_x]);


  // set domain and range for y
  var domain_min_y = Math.min.apply(null, amzn_changes)
  var domain_max_y = Math.max.apply(null, amzn_changes)
  var range_min_y = svg_height;
  var range_max_y = 0;


  // create y scale using y domain and y range
  y_scale = d3.scaleLinear()
      .domain([domain_min_y, domain_max_y])
      .range([range_min_y, range_max_y]);

  return x_scale, y_scale

};

/*
 * Calculates annual percentage change in price of the given data
 * The change is added to the array which is given as an argument
 */

function percentageChange(data, change_array){
  for (i = 0; i < 48; i++){
    new_price = data[i+1][1]
    old_price = data[i][1]
    change = (new_price - old_price) / old_price

    // retrieved from https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
    change = Math.round(change * 1000) / 1000
    change_array.push(change)
  }
}

/*
* First calculates annual percentage change of price by using percentageChange
* function.
* After that, the data is pushed into the stock_amzn_changes
* arrays, so that it can be used in the scatter plot
*/
function scatter_data(stock_array, comparison_array){
  percentageChange(aapl_json, aapl_changes)
  percentageChange(msft_json, msft_changes)
  percentageChange(amzn_json, amzn_changes)
  percentageChange(nflx_json, nflx_changes)


  for (i = 0; i < 48; i++){

    // push stock percentage change as x axis variables and amzn as y axis
    comparison_array.push([stock_array[i], amzn_changes[i]])
  }
  // store maximum and minimum values of msft, aapl, amzn and nflx into min_max_x_values array
  // math.max/min.apply retrieved from https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript
  min_max_x_values.push(Math.min.apply(null, aapl_changes))
  min_max_x_values.push(Math.max.apply(null, aapl_changes))
  min_max_x_values.push(Math.min.apply(null, msft_changes))
  min_max_x_values.push(Math.max.apply(null, msft_changes))
  // min_max_x_values.push(Math.min.apply(null, amzn_changes))
  // min_max_x_values.push(Math.max.apply(null, amzn_changes))
  min_max_x_values.push(Math.min.apply(null, nflx_changes))
  min_max_x_values.push(Math.max.apply(null, nflx_changes))
}

/*
 * Creates scaled scatterplot
 */
function create_circles(dataset){

  var svg = d3.select("svg")

  scales()

  // Initiate j counter
  j = 0

  svg.selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")

      .attr("cx", function(d) {
              return x_scale(d[0]);

         })
      .attr("cy", function(d) {
              return y_scale(d[1]);
         })
      .attr("r", 5)

      // checks which stock it is and gives it right color
      .style("fill", function(d) {

              j++

              // Apple data
              if (dataset == aapl_amzn_changes){
                return "#984ea3";
              }
              // Microsoft data
              else if (dataset == msft_amzn_changes){
                return "#377eb8";
              }

              // if entire dataset is scattered
              else if (dataset == stock_amzn_changes){
                if (j <= 49){
                  return "#984ea3";
                }
                else if (j <= 97){
                  return "#377eb8"
                }
                else {
                  return "#e41a1c"
                }
              }
              // Netflix data
              else {
                return "#e41a1c";
              }

            });
}

/*
 * Creates x and y axes
 * https://github.com/d3/d3-axis
 */
function create_axes(){

  scales()
  var x_axis = d3.axisBottom(x_scale);
  var y_axis = d3.axisLeft(y_scale);


  var svg = d3.select("svg")

  svg.append("g")
    .attr("transform", "translate(0," + svg_height + ")")
    .call(x_axis);

  svg.append("g")
      .attr("transform", "translate(0)")
      .call(y_axis);
}


/* Retrieved from https://www.w3schools.com/howto/howto_js_dropdown.asp
When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropDownFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// if apple is clicked in drop down menu, create scatter plot for apple
function stock_click(){

  var svg = d3.select("svg")

  window.onclick = function(event){
    if (event.target.matches('.Apple')) {

      // remove old circles, https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
      svg.selectAll("circle")
        .remove();

      // create scatter plot for Apple
      scatter_data(aapl_changes, aapl_amzn_changes)
      create_circles(aapl_amzn_changes)
    }
    else if (event.target.matches('.Microsoft')) {

      // remove old circles, https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
      svg.selectAll("circle")
        .remove();

      // create scatter plot for Microsoft
      scatter_data(msft_changes, msft_amzn_changes)
      create_circles(msft_amzn_changes)
  }
    else if (event.target.matches('.Netflix')) {

      // remove old circles, https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
      svg.selectAll("circle")
        .remove();

      // create scatter plot for Netflix
      scatter_data(nflx_changes, nflx_amzn_changes)
      create_circles(nflx_amzn_changes)
}
    else if (event.target.matches('.all')) {
      // remove old circles, https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content
      svg.selectAll("circle")
        .remove();

      // create scatter plot for all stocks
      create_circles(stock_amzn_changes)
    }
  }
}
