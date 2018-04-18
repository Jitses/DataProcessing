// split into lines
var weather_info = document.getElementById("rawdata").innerHTML.split('\n');

// create empty array for temperatures
temp = [];

// create empty array for dates
dates = [];

for (i = 0; i < weather_info.length - 1; i++){

  // split commas for each line
  weather_info[i] = weather_info[i].split(',');

  // push dates into dates array
  dates.push(weather_info[i][0])

  // push temperatures to temp array
  temp.push(weather_info[i][1]);

  // idea retrieved from https://stackoverflow.com/questions/10607935/convert-returned-string-yyyymmdd-to-date
  var year        = dates[i].substring(0,3);
  console.log(dates[i]);
  var month       = dates[i].substring(4,5) - 1;
  var day         = dates[i].substring(6,7);
  dates_string        = year + '-' + month + '-' + day;
  console.log(dates_string)
  dates[i]        = new Date(dates_string);
}

console.log(dates);
console.log(temp);

// retrieved from https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');



// function createTransform(domain, range){
// 	// domain is a two-element array of the data bounds [domain_min, domain_max]
// 	// range is a two-element array of the screen bounds [range_min, range_max]
// 	// this gives you two equations to solve:
// 	// range_min = alpha * domain_min + beta
// 	// range_max = alpha * domain_max + beta
//
//     var domain_min = domain[]
//     var domain_max = domain[1]
//     var range_min = range[0]
//     var range_max = range[1]
//
//     // formulas to calculate the alpha and the beta
//    	var alpha = (range_max - range_min) / (domain_max - domain_min)
//     var beta = range_max - alpha * domain_max
//
//     // returns the function for the linear transformation (y= a * x + b)
//     return function(x){
//       return alpha * x + beta;
//     }
// }
