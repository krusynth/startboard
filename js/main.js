var config;

$(document).ready( function() {
  // $.getJSON('./config.json').then(function(data) {
    // config = data;

    updateDateTime();
    // Update every second.
    setInterval(updateDateTime, 1000);

    updateWeather();
    // Update every 15 minutes.
    setInterval(updateWeather, 1000 * 60 * 15);

    updateWmata()
    // Update every minute.
    setInterval(updateWmata, 1000 * 60);
  // });
});

function updateDateTime() {
  var format = 'dddd MMM Do YYYY h';
  if(config.time.military) {
    hour = 'dddd MMM Do YYYY kk';
  }

  var spacer = ':'
  if(config.time.blink && moment().format('s') % 2 == 0) {
    spacer = ' '
  }

  format += spacer + 'mm';

  if(config.time.seconds) {
    format += spacer + 'ss';
  }

  if(!config.time.military) {
    format += ' A';
  }

  $('#current-time').html('<span>' + moment().format(format) + '</span>');
}
