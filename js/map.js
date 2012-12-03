var map;
var markersArray = [];
var lastInfoWin;

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(32.07, 34.8),
    zoom: 10,
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
      mapOptions);

  fetchAndDraw("israel");
}

function addMarker(tmpLong, tmpLat, tweet) {
  // console.log ("-- going to put marker on: " +tmpLong + ", " +tmpLat);
  var myLatlng = new google.maps.LatLng(tmpLong, tmpLat);
  var alertIcon = "img/alert-60-50.png";
  tweet['marker'] = new google.maps.Marker({
      position: myLatlng,
      mpa: map,
      icon: alertIcon,
      title:"Rocket zone"
  });
  markersArray.push(tweet['marker']);

  var tweetTime = RocknCoder.Tweet.timeAgo(tweet.created_at);
  var tweetText = replaceURLWithHTMLLinks(tweet.text);
  // todo - add option to click on links
  tweet['contentString'] = '<div id="tweetContent">'+
    '<img src="' + tweet.profile_image_url + '" style="float:left; width: 56px; height:56px; padding-right:0.5em"/>' + 
    '<span class="userTweet"><a href="https://twitter.com/'+ tweet.from_user + '" target="_blank">' + 
    tweet.from_user +'</a></span>'+
    '<div id="bodyContent">'+
    tweetText +
    '<br/><small>Created at: ' + tweetTime + '</small>'+
    '</div></div>';

  tweet['infowindow'] = new google.maps.InfoWindow({
    content: tweet.contentString
  });

  google.maps.event.addListener(tweet.marker, 'click', function() {
    if (lastInfoWin) {
      lastInfoWin.close();
    }
    tweet.infowindow.open(map, tweet.marker);
    lastInfoWin = tweet.infowindow;
  });

  // To add the marker to the map, call setMap();        
  tweet.marker.setMap(map);

}

function clearOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}

// tune the fetching of relevate tweets
function fetchAndDraw(searchTerm) {
  var searchTerm = encodeURI(searchTerm);
  $.mobile.showPageLoadingMsg();
  // TODO - make the 30mi part of the settings
  $.ajax({
    url: 'http://search.twitter.com/search.json?geocode=32.781157,34.398720,30mi&rpp=100&q='+searchTerm,
    type: 'GET',
    dataType: 'jsonp',
    success: function(data, textStatus, xhr) {
      var i;
      $.mobile.hidePageLoadingMsg();
      var bounds = new google.maps.LatLngBounds();
      for (i = 0; i < data.results.length; i++) {
        var tweet = data.results[i];
        if (tweet.geo != null) {
          addMarker(tweet.geo.coordinates[0], tweet.geo.coordinates[1], tweet);
          var pos = new google.maps.LatLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
          bounds.extend(pos);
        }
        else {
          // TODO: translate from location to long/lat
          //console.log("no geo but location: " + tweet.location);
        }
      }
      // make sure our map is AROUND all the tweets
      map.fitBounds(bounds);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.error("Opss... Error: " + errorThrown);
      $.mobile.hidePageLoadingMsg();
    }
  });

  // check again every minute? setTimeout(fetchAndDraw, 60000);
}

$(document).on('pageinit','[data-role=page]', function(){
  console.log("--start the map party--");
  initialize();
  $.mobile.touchOverflowEnabled = true;
  $("#reload").click(function() {
    clearOverlays();
    // to 'url' the strings
    fetchAndDraw($("#tweetSearch").val());
  });
});

$('#map').live("pageshow", function() {
  google.maps.event.trigger(map,'resize');
});

