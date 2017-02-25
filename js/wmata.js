function updateWmata() {
  getRail(config.wmata.railstation);
  getBus(config.wmata.busstation);
}

function fetchRail(station) {
  return $.get('https://api.wmata.com/StationPrediction.svc/json/GetPrediction/' + station,
   {'api_key': config.wmata.apikey});
}

function getRail(station) {
  fetchRail(station).then( function(data) {
    $('#rail').html(displayTrains(data.Trains));
  });
}

function displayTrains(trains) {
  var content = '<table class="train-times">' +
    '<tr class="table-heading">' +
    '<th></th>';
  if(config.wmata.railstation.indexOf(',') > -1) {
    content += '<th>Station</th>';
  }
  content += '<th>Destination</th>' +
    '<th>Cars</th>' +
    '<th>Next</th></tr>';

  for(var i = 0; i < trains.length; i++) {

    train = trains[i];

    content += '<tr>' +
      '<td class="train-line"><span class="line-' + train.Line + '">' + train.Line + '</span></td>';

    if(config.wmata.railstation.indexOf(',') > -1) {
      content += '<td class="train-station">' + train.LocationName + '</td>';
    }

    content +=
      '<td class="train-dest">' + train.DestinationName + '</td>' +
      '<td class="train-cars">' + train.Car + '</td>' +
      '<td class="train-time">' + train.Min + '</td>' +
      '</tr>';
  }

  content += '</table>';

  return content;
}

function fetchBus(station) {
  return $.get('https://api.wmata.com/NextBusService.svc/json/jPredictions',
    {'StopID': station, 'api_key': config.wmata.apikey});
}

function getBus(station) {
  // Aggregate our requests.
  var promises = [];
  for(i in station) {
    promises.push(fetchBus(station[i]));
  }

  Promise.all(promises).then( function(data) {
    // Concatenate our data.
    var routes = {};
    for(var i = 0; i < data.length; i++) {
      var response = data[i];

      for(var j = 0; j < response.Predictions.length; j++) {
        var next = response.Predictions[j];
        var key = next.RouteID + '-' + next.DirectionNum;

        if(!routes[key]) {
          routes[key] = {
            'id': next.RouteID,
            'direction': next.DirectionText,
            'stop': response.StopName,
            'next': []
          }
        }

        routes[key].next.push(next.Minutes);
      }
    }

    $('#bus').html(displayBusRoutes(routes));
  });
}

function displayBusRoutes(routes) {
  var content = '<table class="bus-times">' +
    '<tr class="table-heading">' +
    '<th>Route</th>';
  if(config.wmata.showstops && config.wmata.busstation.length > 1) {
    content += '<th>Stop</th>';
  }
  content += '<th>Direction</th><th>Next</th></tr>';
  for(var i in routes) {
    content += displayBus(routes[i]);
  }
  content += '</table>';

  return content;
}

function displayBus(route) {
  var content = '<tr>' +
    '<td class="bus-route">' + route.id + '</td>';

  if(config.wmata.showstops && config.wmata.busstation.length > 1) {
    content += '<td class="bus-stop">' + route.stop + '</td>';
  }

  content += '<td class="bus-direction">' + route.direction + '</td>' +
    '<td class="bus-next">';

  for(var i in route.next) {
    content += '<span class="bus-next-time">' + route.next[i] + '</span>';
  }

  content += '</td>' +
    '</tr>';

  return content;
}
