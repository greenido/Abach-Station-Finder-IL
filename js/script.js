/* Author: Ido Green
 * @greenido
*  date: Sep 2013
 */


// TODO: configuration - some globals that need/must move to encapsulated object
var maxLength = 25;
var GtweetSearch;
var GtweetRaduis;

// TODO - change it to something better with append
document.write(
  '<div data-role="page" id="mainstuff" data-theme="e" id="list">' +
  '<div data-role="header" data-position="fixed">' +
  '<h1><span id="widgetTitle">Abach Finder IL</span>' +
  '</h1><a href="#options" data-icon="gear" data-transition="slide" class="ui-btn-right">Options</a>' +
  '</div><div data-role="content">' +
  '<ul data-role="listview" id="articleList">' +
  '<div data-role="footer" data-theme="c"> <div data-role="navbar" data-iconpos="bottom">' +
  '<ul><li><a href="#map" data-icon="forward">Map</a></li> <li><a href="#tweet" data-icon="search">רשימת תחנות</a></li> </ul>' +
  ' </div><!-- navbar --> </div>'
);

// add the list of alerts
for(var i=1; i<=maxLength; i++){
  document.write('<li id="list' + i + 
    '"><a href="#article'       + i + 
    '" id="link'                + i + 
    '">&nbsp;</a></li>'
  );
}

document.write('</ul>' + '  </div>' +'</div>' );

for(i = 1; i <= maxLength; i++) {
  document.write(
    '<div data-role="page" data-theme="e" id="article' + i + '">' +
    ' <div data-role="header" data-theme="d" data-position="inline">' +
    '   <a href="#mainstuff" data-role="button" data-icon="grid" data-back="true">Home</a>' +
    '   <h1 id="articleHeader' + i + '">&nbsp;</h1>' +
    '   <a href="#" id="openButton' + i + '" data-role="button" data-icon="forward"' +
    '      class="ui-btn-right" rel="external">Source</a>' +
    '   </div>' + '  <div data-role="content">' +
    '    <div id="articleContent' + i + '" class="articleContent" style="direction: rtl;"></div>' +
    '      <div data-role="controlgroup" data-type="horizontal" style="direction: rtl;">' +
    '      <a href="#article' + String(i-1) + '" data-role="button" data-icon="arrow-l"' +
    '        data-inline="true" class="prevButton">Back</a>' +
    '      <a href="#article' + String(i+1) + '" data-role="button" data-icon="arrow-r"' +
    '        data-inline="true" class="nextButton" data-iconpos="right">Next</a>' +
    '   </div> </div> </div>'
  );
}

//
// use y! pipes for caching and easy mange to the feeds:
// parse them and fetch some more data base on the basic entries.
//
$(function(){

  // to skip pipes cache during dev mode - TODO remove it in prod
  // var tmpRand = Math.floor((Math.random()*100000)+1);
  getOnlineFeed('http://pipes.yahoo.com/pipes/pipe.run?_id=866c24404f4ae093008efc6cff7d0d09' +
      // '&_randomstuff='+ tmpRand +
      '&_render=rss')
  });

/* helpers */
var listEntries = function(json) {
  if (!json.responseData.feed.entries) {
    console.error("could not fetch the items from our feed");
    return false;
  } 
    
  var articleLength = json.responseData.feed.entries.length;
  articleLength     = (articleLength > maxLength) ? maxLength : articleLength;
  
  for (var i = 1; i <= articleLength ; i++) {
    var entry = json.responseData.feed.entries[i-1];

    var tmpLink = entry.link;
    $('#link' + i).text(entry.title);
    $('#articleHeader' + i).text(entry.title);
    $('#openButton' + i).attr('href', tmpLink);
    $('#openButton' + i).attr('target', "_blank");

    var pubDate = RocknCoder.Tweet.timeAgo(entry.publishedDate);
    var desc = entry.content.replace(/(<\/p><\/span>[\s\S]*)/img,"");
    desc = desc.replace(/(<([^>]+)>)/ig,"");
    if (desc.indexOf("maps.googleapis.com") > -1) {
      // http://maps.googleapis.com/maps/api/staticmap?center=31.5159%2C34.5951&size=400x400&sensor=false
      desc = desc.replace(/(http:\/\/maps.googleapis.com.*)/img, 
         "<img src='$1&zoom=13&markers=color:red%7Ccolor:red%7Clabel:*%7C" + 
         tmpLink + "' style='margin: 0 auto;'\/>");
      // &markers=color:red%7Ccolor:red%7Clabel:C%7C40.718217,-73.998284
    }

    desc += "<br/><span>" + pubDate + "</span>";
    $('#articleContent' + i).append(desc);
  }

  $('#article1 .prevButton').remove();
  $('#article' + articleLength + ' .nextButton').remove();
  if (articleLength < maxLength) {
    for (i = articleLength + 1; i <= maxLength; i++) {
      $('#list' + i).remove();
      $('#article' + i).remove();
    }
  }
};

var getOnlineFeed = function(url) {
  var script = document.createElement('script');
  script.setAttribute('src', 'http://ajax.googleapis.com/ajax/services/feed/load?callback=listEntries&hl=ja&output=json-in-script&q='
                      + encodeURIComponent(url)
                      + '&v=1.0&num=' + maxLength);
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
};

var getOfflineFeed = function(url) {
  var script = document.createElement('script');
  script.setAttribute('src', url);
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
};


//
// tweet stuff
//
var RocknCoder = RocknCoder || {};

// this is the object that takes care of all of our twitter business
RocknCoder.Tweet = function () {
  var searchTerm = "",
    $appendTo,
    tmpl = "",
    numTweets = 10,

  init = function() {
    $appendTo = $("#tweets");
    tmpl = $("#tweet-template").html();
  },
  // load data from twitter
  load = function(search) {
    searchTerm = search || searchTerm;
    $.mobile.showPageLoadingMsg();
//    $.ajax({
//      url: 'http://search.twitter.com/search.json?q='+searchTerm,
//      type: 'GET',
//      dataType: 'jsonp',
//      success: function(data, textStatus, xhr) {
//        var i, tweet, compiled;
//        // clear all old tweets but not the search row
//        $("#tweets").html("");
//        $.mobile.hidePageLoadingMsg();
//        // add info
//        var tweetsData = "<ul data-role='listview'>";
//        for (i = 0; i < data.results.length; i++) {
//          tweet = data.results[i];
//          tweet.timeAgo = timeAgo(tweet.created_at);
//
//          compiled = tweet.text + "<br/>" + tweet.timeAgo;
//          compiled = replaceURLWithHTMLLinks(compiled);
//          tweetsData += "<li><span class='tweetlink'>" + compiled + "</span></li>";
//        }
//        $("#tweets").append(tweetsData + "</ul>");
//        $("#tweets").trigger('create');
//      },
//      error: function(jqXHR, textStatus, errorThrown){
//        console.error("Opss... Error: " + errorThrown);
//        $.mobile.hidePageLoadingMsg();
//      }
//    });

    // check again every minute
//    setTimeout(RocknCoder.Tweet.load, 60*1000);
  },
  // format the time returned by Twitter
  timeAgo = function(dateString) {
    var rightNow = new Date(),
      then = new Date(dateString),
      diff = rightNow - then,
      second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24,
      week = day * 7;

    // return blank string if unknown
    if (isNaN(diff) || diff < 0) {
      return "";
    }

    // within 2 seconds
    if (diff < second * 2) {
      return "right now";
    }

    if (diff < minute) {
      return "about " + Math.floor(diff / second) + " seconds ago";
    }

    if (diff < minute * 2) {
      return "about 1 minute ago";
    }

    if (diff < hour) {
      return "about " + Math.floor(diff / minute) + " minutes ago";
    }

    if (diff < hour * 2) {
      return "about 1 hour ago";
    }

    if (diff < day) {
      return  "about " + Math.floor(diff / hour) + " hours ago";
    }

    if (diff > day && diff < day * 2) {
      return "yesterday";
    }

    if (diff < day * 365) {
      return "about " + Math.floor(diff / day) + " days ago";
    }
    else {
      return "over a year ago";
    }
  };
  
  return {
    load: load,
    timeAgo: timeAgo,
    init: init
  };
}();

//
// start of the party
//
$(document).on('pageinit','[data-role=page]', function(){

  console.log("--start the party--"); 
  $.mobile.touchOverflowEnabled = true;
  $.mobile.changePage("#map");
    
//  $("#refreshTweets").click(function(){
//    RocknCoder.Tweet.load(GtweetSearch);
//  });

  $("#save-options").click(function() {
    // save the options to local storage
    saveOptions($("#tweet-term").val(), $("#select-radius").val() );
    $("#saveMsg").popup("close");
    setTimeout(function() { 
      $.mobile.changePage("#mainstuff");
      window.scrollTo(0, 1);
    }, 1500);

  }); 

  loadOptions();
//  RocknCoder.Tweet.load(GtweetSearch);
});

//
// Handle with the options saving them locally for the user with local storage
// 
function loadOptions() {
  GtweetSearch = window.localStorage["tweetSearch"];
  if (GtweetSearch === undefined) {
    GtweetSearch = "Israel";
  }
  $("#tweet-term").val(GtweetSearch);
  $("#tweetSearch").val(GtweetSearch); // For the quick map search

  GtweetRaduis = window.localStorage["tweetRadius"];
  if (GtweetRaduis === undefined) {
    GtweetRaduis =  50; // default to 50k
  }
  $("#select-radius").val(GtweetRaduis);
  $( '#options' ).live( 'pageinit',function(event){
    $("#select-radius").selectmenu('refresh');      
  });
}

// TODO - validate this input
function saveOptions(search, radius) {
  localStorage.setItem("tweetSearch", search);
  localStorage.setItem("tweetRadius", radius);
}

// Util functions
function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}







