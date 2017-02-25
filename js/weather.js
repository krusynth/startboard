function getCurrentWeather() {
  return $.get('http://api.openweathermap.org/data/2.5/weather', {
    'zip': config.weather.location,
    'units': 'imperial',
    'APPID': config.weather.apikey
  });
}

function getForecast() {
  return $.get('http://api.openweathermap.org/data/2.5/forecast', {
    'zip': config.weather.location,
    'units': 'imperial',
    'APPID': config.weather.apikey
  });
}

function updateWeather() {
  getCurrentWeather().then(function(data) {
    displayWeather(parseWeather(data));
  });

  getForecast().then(function(data) {
    var forecast = parseForecast(data);
    displayTodayForecast(forecast.today);
    displayWeekForecast(forecast.week);
  });
}

function parseWeather(data) {
  return {
    'time': moment(data.dt*1000),
    'temp': Math.round(data.main.temp),
    'low': Math.round(data.main.temp_min),
    'high': Math.round(data.main.temp_max),
    'icon': data.weather[0].id
  };
}

function formatWeather(data) {
  var content =
    '<span class="datetime">' +
      '<span class="day">' + data.time.format('ddd') + '</span>' +
      '<span class="date">' + data.time.format('MMM D') + '</span>' +
      '<span class="time">' + data.time.format('h a') + '</span>' +
    '</span>' +
    '<span class="weather-glyph wi wi-owm-' + data.icon + '"/>'+
    '<span class="temp-list">' +
      '<span class="temp">' + data.temp + '°</span>';;

  if(data.low && data.high) {
    content += '<span class="high-low-temp">' +
    '<span class="low-temp">' + data.low + '°</span>' +
    '<span class="high-temp">' + data.high + '°</span>' +
    '</span>';
  }
  content += '</span>';
  return content;
}

function displayWeather(data) {
  $('#weather-today').html(
    '<div class="weather-current">' +
    formatWeather(data) +
    '</div>'
  );
}

function displayTodayForecast(data) {
  var today = $('<ul class="forecast forecast-today"></ul>');
  for(var i = 0; i < data.length; i++) {
    today.append(
      '<li>' + formatWeather(data[i]) + '</li>'
    );
  }

  $('#weather-forecast').html(today);
}

function displayWeekForecast(data) {
  var today = $('<ul class="forecast forecast-week"></ul>');
  for(var i in data) {
    today.append(
      '<li>' + formatWeather(data[i]) + '</li>'
    );
  }

  $('#weather-week').html(today);
}

function parseForecast(data) {
  var today = new Date();

  var todays_forecast = [];
  var week_forecast = {};


  for(var i = 0; i < data.list.length; i++) {
    var forecast = data.list[i];
    var date = new Date(parseInt(forecast.dt)*1000);

    // If this is later today.
    if(
      date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth()
    ) {
      todays_forecast.push(parseWeather(forecast));
    }
    // If this is later in the week.
    else {
      // We need to aggregate for the day, since we have multiple
      // entries per day.
      var key = date.getMonth()+1 + '-' + date.getDate();
      var day = parseWeather(forecast)

      // If this is our first forecast, save it.
      if(!week_forecast[key]) {
        week_forecast[key] = day;
      }
      // Otherwise, see if we have a higher high or lower low.
      else {
        if(day.high > week_forecast[key].high) {
          week_forecast[key].high = day.high;
        }
        if(day.low < week_forecast[key].low) {
          week_forecast[key].low = day.low;
        }
      }
    }
  }

  return {'today': todays_forecast, 'week': week_forecast};
}


