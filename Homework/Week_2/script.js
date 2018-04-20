// retrieved from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange
var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "https://raw.githubusercontent.com/Jitses/DataProcessing/master/Homework/Week_2/KNMI_20171231.txt";

xhr.open(method, url, true);
xhr.onreadystatechange = function () {
  if(xhr.readyState === 4 && xhr.status === 200) {

    // set weather info to responsetext
    var weather_info = xhr.responseText;

    // split newlines
    weather_info = weather_info.split('\n');

    // create empty array for temperatures
    temp = [];

    // create empty array for dates
    dates = [];

    // iterate over weather info
    for (i = 0; i < weather_info.length - 1; i++){

      // split commas for each line
      weather_info[i] = weather_info[i].split(',');

      // push dates into dates array
      dates.push(weather_info[i][0])

      // push temperatures to temp array
      temp.push(weather_info[i][1]);

      // strip whitespace
      dates[i] = dates[i].trim();

      // idea retrieved from https://stackoverflow.com/questions/10607935/convert-returned-string-yyyymmdd-to-date
      var year = dates[i].substring(0,4);
      var month = dates[i].substring(4,6);
      var day = dates[i].substring(6,8);

      // put - between year, month and date
      dates_string = year + '-' + month + '-' + day;

      // convert to date
      dates[i] = new Date(dates_string);

      /** retrieved from https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
       * sets days from 1-365
       */
      var start = new Date(dates[i].getFullYear(), 0, 0);
      var diff = (dates[i] - start) + ((start.getTimezoneOffset() - dates[i].getTimezoneOffset()) * 60 * 1000);
      var oneDay = 1000 * 60 * 60 * 24;
      dates[i] = Math.floor(diff / oneDay);
    }

    // make empty array
    temp_domain = []

    // store minimum temperature in array
    temp_domain.push(Math.min(...temp));

    // store maximum temperature in array
    temp_domain.push(Math.max(...temp));

    // make empty array
    date_domain = []

    // store minimum date in date_domain
    date_domain.push(Math.min(...dates));

    // store maximum date in date_domain
    date_domain.push(Math.max(...dates));

    function createTransform(domain, range){

    	/** domain is a two-element array of the data bounds [domain_min, domain_max]
    	 * range is a two-element array of the screen bounds [range_min, range_max]
       */
        var domain_min = domain[0]
        var domain_max = domain[1]
        var range_min = range[0]
        var range_max = range[1]

        // formulas to calculate the alpha and the beta
       	var alpha = (range_max - range_min) / (domain_max - domain_min)
        var beta = range_max - alpha * domain_max

        // returns the function for the linear transformation (y= a * x + b)
        return function(x){
          return alpha * x + beta;
        }
    }

    // retrieved from https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
    var canvas = document.getElementById('myCanvas');

    // set canvas width
    canvas.width = 800;

    // set canvas height
    canvas.height = 500;

    var ctx = canvas.getContext('2d');

    ctx.translate(0, 500);

    // create temperature range array
    range_temp = [];

    // push 0 into range_temp array
    range_temp.push(0);

    // push canvas height into range_y array
    range_temp.push(canvas.height - 30);

    // create date range array
    range_date = [];

    // push 0 into range_date array
    range_date.push(0);

    // push canvas width in to range x_array
    range_date.push(canvas.width - 30);

    // calculate scales by using createtransform function
    scale_y = createTransform(temp_domain, range_temp);
    scale_x = createTransform(date_domain, range_date);

    // retrieved from https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect
    ctx.beginPath();

    // start of line graph
    ctx.moveTo(0, 0);

    // iterate over arrays
    for (i = 0; i < dates.length - 1; i++)
    {
      // move line to correct temperature and date positions
      ctx.lineTo(scale_x(dates[i]), -scale_y(temp[i]))

    }
    // draw line graph
    ctx.stroke();

    // begin line path for vertical grid
    ctx.beginPath();

    // move to start
    ctx.moveTo(0, 0);

    // draw vertical grid line with 10 degrees added each time
    for (i = - 40; i <= 240; i += 10){
      ctx.lineTo(0, -scale_y(i));

      // draw horizontal
      ctx.lineTo(5, -scale_y(i));

      // write temperature
      ctx.fillText(i, scale_x(5), -scale_y(i));

      // move back to vertical grid
      ctx.moveTo(0, -scale_y(i));
    }

    // draw horizontal grid line with 10 degrees added each time
    for (i = date_domain[0] - 1; i <= date_domain[1]; i += 10){
      ctx.lineTo(scale_x(i), -scale_y(0));

      // draw vertical stripe
      ctx.lineTo(scale_x(i), -scale_y(5));

      // write date
      ctx.fillText(Math.round(i), scale_x(i), -scale_y(10));

      // move back to horizontal grid line
      ctx.moveTo(scale_x(i), -scale_y(0));
    }

    // line to x axis 365
    ctx.lineTo(scale_x(365), -scale_y(0));

    // draw vertical stripe
    ctx.lineTo(scale_x(365), -scale_y(-5));

    // draw text 365
    ctx.fillText(365, scale_x(365), -scale_y(-10))

    // draw
    ctx.stroke()
  }
};

xhr.send();
