/**
 *  Author: Ido Green @greenido
 *  date: Sep 2013
 */

// TODO - move to their own object.
var map;
var markersArray = [];
var bounds = new google.maps.LatLngBounds();

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
      if (response !== "") {
        for (var i = 0; i < response.feed.entry.length; i++) {
          //console.log("data: " + response.feed.entry[i].content.$t);
          //console.log("waze link: " + response.feed.entry[i].title.$t);
          var tmpData = response.feed.entry[i].content.$t.split(":");
          tmpData[4] = tmpData[4].replace("city", "");
          tmpData[5] = tmpData[5].replace(", hours", "");   
          tmpData[3] = tmpData[3].replace(", address", "");
          var address = tmpData[4] + " " + tmpData[5];
          $("#maintable").append(
                  '<div class="ui-block-a righttext"><div class="ui-bar ui-bar-b" style="height:75px">' +
                  '<a target="_blank" href="https://maps.google.com/?q=' + encodeURI(tmpData[3]) + '">' +
                  address +
                  '</a></div></div>' +
                  '<div class="ui-block-b"><div class="ui-bar ui-bar-b" style="height:75px">' +
                  '<a href="' + response.feed.entry[i].title.$t +
                  '" data-role="button" class="wazeButton"><img src="img/waze48.png" alt="waze logo"><span class="butText">לחץ לניווט  </span></a></div></div>' +
                  '<div class="ui-block-c righttext"><div class="ui-bar ui-bar-d" style="height:75px">' +
                  tmpData[6] +'</div></div>'
                  );
          addStation(tmpData);
        }
        map.fitBounds(bounds);
        $(".wazeButton").buttonMarkup( "refresh" );
      }
      else {
        console.error("ERR: blagan... we didn't get any response from our google sheet JSON obj. Status"+status + " XHR:"+xhr);
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
    var stationText = tmpData[4] + " <br>"  + tmpData[6];
    station.long = tmpData[1].replace(", geolong", "");
    station.lang = tmpData[2].replace(", geopoint", "");
    station.title = tmpData[5] ; // TODO - change it
    station.contentString = "<div class='textright darkback'>"+  station.title + 
            "<br>" + stationText + "</div>";

    var infowindow = new google.maps.InfoWindow();
    var tmpPos = new google.maps.LatLng(station.long,station.lang);
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
$(document).on('pageinit', '[data-role=page]', function() {
  console.log("--start the map party--");

  initialize();
  $.mobile.touchOverflowEnabled = true;
  fetchPoints();

  $("#reload").click(function() {
    clearOverlays();
  });

});