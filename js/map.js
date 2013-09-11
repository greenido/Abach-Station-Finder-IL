/**
 *  Author: Ido Green @greenido
 *  date: Sep 2013
 */

// TODO - move to their own object.
var map;
var markersArray = [];
var bounds = new google.maps.LatLngBounds();
var gotTheData = false;

/**
 * Initialize our map obj.
 * @returns {undefined}
 */
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(31.7, 35.1),
    zoom: 10,
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
          mapOptions);
}

/**
 * Fetching the stations geo points and other data from our google sheet in JSON baby!
 * @returns {undefined}
 */
function fetchPoints() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'https://spreadsheets.google.com/feeds/list/0Ass6q5sTeDKidDlKY3BUU0NoSnk4UUZIQ2NuUDYtTHc/od7/public/basic?alt=json',
    success: function(response, status, xhr) {
      if (gotTheData) {
        return;
      }
      if (response !== "") {
        gotTheData = true;
        for (var i = 0; i < response.feed.entry.length; i++) {
          //console.log("data: " + response.feed.entry[i].content.$t);
          //console.log("waze link: " + response.feed.entry[i].title.$t);
          var tmpData = response.feed.entry[i].content.$t.split(":");
          tmpData[4] = tmpData[4].replace("city", "");
          tmpData[5] = tmpData[5].replace(", hours", "");
          tmpData[3] = tmpData[3].replace(", address", "");
          var address = tmpData[4] + " " + tmpData[5];
          $("#maintable").append(
                  '<div class="row-fluid righttext"> <div class="span5 inner-cell" >' +
                  '<a target="_blank" href="https://maps.google.com/?q=' + encodeURI(tmpData[3]) + '">' +
                  address +
                  '</a></div>' +
                  '<div class="span2 inner-cell mid-cell" >' +
                  '<a href="' + response.feed.entry[i].title.$t +
                  '"  class="btn btn-large wazeButton" type="button" title="לחץ ממכשיר נייד"><img src="img/waze48.png" alt="waze logo">Waze</a></div>' +
                  '<div class="span4 inner-cell righttext">' + tmpData[6] + '</div></div> </div>');
          addStation(tmpData);
        }
        map.fitBounds(bounds);
      }
      else {
        console.error("ERR: blagan... we didn't get any response from our google sheet JSON obj. Status" + status + " XHR:" + xhr);
      }
    }
  });
}


/**
 * Adding the station to our map
 * @param {type} tmpData
 * @returns {undefined}
 */
function addStation(tmpData) {
  var station = new Object;
  var stationText = tmpData[4] + " <br>" + tmpData[6];
  station.long = tmpData[1].replace(", geolong", "");
  station.lang = tmpData[2].replace(", geopoint", "");
  station.title = tmpData[5]; // TODO - change it
  station.contentString = "<div class='textright darkback'>" + station.title +
          "<br>" + stationText + "</div>";

  var infowindow = new google.maps.InfoWindow();
  var tmpPos = new google.maps.LatLng(station.long, station.lang);
  var marker = new google.maps.Marker({
    position: tmpPos,
    map: map
  });
  bounds.extend(tmpPos);
  google.maps.event.addListener(marker, 'click', (function(marker, i) {
    return function() {
      infowindow.setContent(station.contentString); //"תחנת חלוקה <br>" +  tmpData[4] 
      infowindow.open(map, marker);
    }
  })(marker));

}

/**
 * Clear all the markers
 * @returns {undefined}
 */
function clearOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}

/**
 * Start the party
 */
$(document).ready(function() {
  console.log("--start the map party--");

  initialize();
  fetchPoints();

  $("#reload").click(function() {
    clearOverlays();
  });

});

