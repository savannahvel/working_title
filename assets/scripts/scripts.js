var weatherAPIkey = '6c2804129ff3cbd5d74a5aa5eb917a4c';
var googleAPIkey = `AIzaSyDZMxrOcwvMPEtvRL8YuYM4DJAH6kNw2Fw`;
var weather = [];
var locations = [];
var submitButton = document.getElementById('fetch-button');
var geocoder;
var map;

function initialize() {
  // initial map pre-destination search
  geocoder = new google.maps.Geocoder();
  var loca = new google.maps.LatLng(45.5152, -122.6784);

  map = new google.maps.Map(document.getElementById('map'), {
    center: loca,
    zoom: 11
  });
}

function riverRunner() {
  // gets destination input and centers and marks map
  let cityEl = document.getElementById('city').value;
  let stateEl = document.getElementById('state').value;
  let address = `${cityEl}, ${stateEl}`;
  
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });

  // USGS water conditions API
  var requestWaterUrl = 'https://waterwatch.usgs.gov/webservices/realtime?region=or&format=json';

  fetch(requestWaterUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      
      //looping over the fetch response and inserting the data from the API to the locations array
      for (var i = 0; i < data.sites.length; i++) {

        locations.push([
          data.sites[i].station_nm, // station name
          data.sites[i].dec_lat_va, // latitude
          data.sites[i].dec_long_va, // longitude
          String(data.sites[i].stage), // stage in ft
          String(data.sites[i].flow), // flow in cubic feet per second
          data.sites[i].url, // URL for more data
        ])

      };
      
      
      var pinColor = "2861ff";
      var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34));
      
      for (i = 0; i < locations.length; i++) {  
        var marker, i;
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i][1], locations[i][2]),
          map: map,
          icon: pinImage
        });
        
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            var contentString = `<h3> ${locations[i][0]} </h3>` +
            // `<p> Weather: </p>` +
            // // `<li> Temperature: ${weather[i][0]} F` +
            // // `<li> Wind Speed: ${weather[i][1]} mph` +
            `<p> Water Conditions: </p>` +
            `<li> Stage: ${locations[i][3]} ft` +
            `<li> Flowrate: ${locations[i][4]} cfs` +
            `<li> URL: <a href=${locations[i][5]}> https://waterdata.usgs.gov </a> </li>`;
            const infowindow = new google.maps.InfoWindow();
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
          }
        })(marker, i));
      }  
    })
    return;
  };
  
  function weatherAPI() {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${results[0].geometry.location}&units=imperial&appid=${weatherAPIkey}`;
    fetch(requestUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        // console.log(data);
        weather.push([
          String(data.main.temp), 
          String(data.wind.speed)]);
      });
      return;
  };
  // weatherAPI();

  google.maps.event.addDomListener(window, 'load', initialize);
  submitButton.addEventListener('click', riverRunner);