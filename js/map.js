/**
 *  Author: Ido Green @greenido
 *  date: Sep 2013
 */


// TODO - move then to their own object.
var map;
var markersArray = [];
var bounds = new google.maps.LatLngBounds();
var lastInfoWin;

//
// fetching the stations geo points and other data from our google sheet in JSON baby!
//
function fetchPoints() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'https://spreadsheets.google.com/feeds/list/0Ass6q5sTeDKidDlKY3BUU0NoSnk4UUZIQ2NuUDYtTHc/od6/public/basic?alt=json',
    success: function(response, status, xhr) {
      if (response !== "") {
        for (var i = 0; i < response.feed.entry.length; i++) {
          console.log("data: " + response.feed.entry[i].content.$t);
          console.log("waze link: " + response.feed.entry[i].title.$t);
          var tmpData = response.feed.entry[i].content.$t.split(":");
          tmpData[4] = tmpData[4].replace("city", "");
          tmpData[3] = tmpData[3].replace(", address", "");
          var address = tmpData[4] + " " + tmpData[5];
          $("#maintable").append(
                  '<div class="ui-block-a"><div class="ui-bar ui-bar-b" style="height:60px">' +
                  '<a target="_blank" href="https://maps.google.com/?q=' + encodeURI(tmpData[3]) + '">' +
                  address +
                  '</a></div></div>' +
                  '<div class="ui-block-b"><div class="ui-bar ui-bar-b" style="height:60px">' +
                  '<a href="' + response.feed.entry[i].title.$t +
                  '"><img src="img/waze48.png" alt="waze logo">לחץ לניווט</a></div></div>' +
                  '<div class="ui-block-c"><div class="ui-bar ui-bar-d" style="height:60px">TODO</div></div>'
                  );
          addStation(tmpData);
        }

      }
      else {
        console.error("blagan");
      }
    }
  });
}

//
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(31.7, 35.1),
    zoom: 12,
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
          mapOptions);


}

/**
 * This function will be called with all the geo data of the stations
 * @tmpData contain the info on our station
 * @returns {undefined}
 */
function addStation(tmpData) {
  for (var i = 0; i < 3; i++) { //tmpData.length
    var station = new Object;
    // geolong: 34.991614, geolat: 32.788131, geopoint: 32.788131,34.991614, address: היכל הספורט רוממה דרך פיקא 69, city: חיפה 
    var stationText = tmpData[4] + " " + tmpData[5];
    station.lang = tmpData[1].replace(", geolat", "");
    station.long = tmpData[2].replace(", geopoint", "");
    station.title = tmpData[5] + " - " + i; // TODO - change it
    station.contentString = '<div id="stationContent"><div id="bodyContent">' +
            station.title + "<br>" + stationText + '</div></div>';
    //station.infowindow = new google.maps.InfoWindow({content: station.contentString});
    //addMarker(station.lang, station.long, station);

    var infowindow = new google.maps.InfoWindow();

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(station.long,station.lang),
      map: map
    });

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent(tmpData[4] + tmpData[5]);
        infowindow.open(map, marker);
      }
    })(marker));


  }
 // map.fitBounds(bounds);

}


function addMarker(tmpLong, tmpLat, station) {
  console.log("-- going to put marker on: " + tmpLong + ", " + tmpLat);
  var position = new google.maps.LatLng(tmpLong, tmpLat);
  var alertIcon = "img/alert-60-50.png";
  var marker = new google.maps.Marker({
    position: position,
    mpa: map,
//      icon: alertIcon,
    title: "תחנת חלוקה"
  });
  var infowindow = new google.maps.InfoWindow();
  markersArray.push(marker);

  google.maps.event.addListener(marker,
          'click', (function(marker) {
    return function() {
      infowindow.setContent(station.title);
      infowindow.open(map, station.marker);
    }
  })(marker));

  bounds.extend(position);

//  google.maps.event.addListener(station.marker, 'click', function() {
//    if (lastInfoWin) {
//      lastInfoWin.close();
//    }
//    station.infowindow.open(map, station.marker);
//    lastInfoWin = station.infowindow;
//  });
//
//  (function(station) {
//    // add click event
//    google.maps.event.addListener(station.marker, 'click', function() {
//      infowindow = new google.maps.InfoWindow({
//        content: station.title
//      });
//      infowindow.open(map, station.marker);
//    });
//  })(station);



  // To add the marker to the map, call setMap();        
  //marker.setMap(map);


}

function clearOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}




$(document).on('pageinit', '[data-role=page]', function() {
  console.log("--start the map party--");

  initialize();
  $.mobile.touchOverflowEnabled = true;
  fetchPoints();

  $("#reload").click(function() {
    clearOverlays();
  });
//
//  $('#map').live("pageshow", function() {
//    google.maps.event.trigger(map, 'resize');
//  });

});


