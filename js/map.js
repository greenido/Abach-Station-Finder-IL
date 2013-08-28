var map;
var markersArray = [];
var bounds = new google.maps.LatLngBounds();
var lastInfoWin;

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
 * @returns {undefined}
 */
function addStations() {
  var station = new Object;
  var stationText = "TODO - bal-bla";
  station.lang = "31.794836";
  station.long = "35.222949";
  station.title = "מתנ\"ס שמואל הנביא מגן האלף 3";
  station.contentString = '<div id="stationContent"><div id="bodyContent">' + station.title + 
          "<br>" + stationText + 
          '</div></div>';
  station.infowindow = new google.maps.InfoWindow({content: station.contentString});
  addMarker(station.lang, station.long, station);
  
  var station = new Object();
  station.lang = "31.772058";
  station.long = "35.299141";
  station.title = "קניון אדומים קומת כניסה משער שלום דרך קדם  5 ";
  var stationText = "<table><tr style='background-color: #ECECEC;' align='right' dir='rtl'>                                                 <td class='tdrightborder' style='text-align: right; padding-right: 5px;'>                                                     &nbsp;א-ה 11:00-19:00, לא כולל יום ו'&nbsp;&nbsp;                                                 </td>                                                 <td class='tdrightborder' style='text-align: right; padding-right: 5px;'>                                                     18/8-29/8                                                 </td>                                                 <td class='tdrightborder' style='text-align: right; padding-right: 5px;'>                                                     קניון אדומים קומת כניסה משער שלום דרך קדם 5                                                 </td>                                                 <td class='tdleftborder' style='font-weight: bold; text-align: right; padding-right: 5px;'>                                                     מעלה אדומים                                                 </td>                                             </tr></table>";
  station.contentString = '<div id="stationContent"><div id="bodyContent">' + station.title + 
          "<br>" + stationText + 
          '</div></div>';
  station.infowindow = new google.maps.InfoWindow({content: station.contentString});
  addMarker(station.lang, station.long, station);
  
  var station = new Object();
  station.lang = "31.755888";
  station.long = "34.990023";
  station.title = "קניון BIG FASHION יגאל אלון 3 בית שמש ";
  var stationText = "<table><tr style='background-color: #ECECEC;' align='right' dir='rtl'>      <td class='tdrightborder' style='text-align: right; padding-right: 5px;'>           א-ה 11:00-19:00, לא כולל יום ו'        </td>      <td class='tdrightborder' style='text-align: right; padding-right: 5px;'>          4/8-29/8      </td>      <td class='tdrightborder' style='text-align: right; padding-right: 5px;'>          קניון BIG FASHION   יגאל אלון 3      </td>      <td class='tdleftborder' style='font-weight: bold; text-align: right; padding-right: 5px;'>          בית שמש      </td>  </tr></table>";
  station.contentString = '<div id="stationContent"><div id="bodyContent">' + station.title + 
          "<br>" + stationText + 
          '</div></div>';
  station.infowindow = new google.maps.InfoWindow({content: station.contentString});
  addMarker(station.lang, station.long, station);
  
  
  
  map.fitBounds(bounds);
  
}


function addMarker(tmpLong, tmpLat, station) {
  console.log("-- going to put marker on: " + tmpLong + ", " + tmpLat);
  var position = new google.maps.LatLng(tmpLong, tmpLat);
  var alertIcon = "img/alert-60-50.png";
  station['marker'] = new google.maps.Marker({
    position: position,
    mpa: map,
//      icon: alertIcon,
    title: "תחנת חלוקה"
  });
  markersArray.push(station['marker']);
  
  bounds.extend(position);

  google.maps.event.addListener(station.marker, 'click', function() {
    if (lastInfoWin) {
      lastInfoWin.close();
    }
    station.infowindow.open(map, station.marker);
    lastInfoWin = station.infowindow;
  });

  // To add the marker to the map, call setMap();        
  station.marker.setMap(map);

  
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

  addStations();
  $("#reload").click(function() {
    clearOverlays();

  });
});

$('#map').live("pageshow", function() {
  google.maps.event.trigger(map, 'resize');
});

