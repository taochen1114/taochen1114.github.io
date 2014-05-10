var token;
var hashid;
var socialid;
var mHeight;
var mWidth;

var checkin_x = [];
var checkin_y = [];
var checkins = [];
var fristRun = 1;
var mylocation = null;
var sharerLocation;
var sharer;
var map;
var viewCenter;
var polyline;
var markers;
var num_of_checkin = -1;
var num_of_point = 0;

function locate() {
	map.panTo(sharerLocation);
}

$.drawTrip = function(token){
	var trip =[];
	var stime;
	var etime;
	var eta;
	var distance;
	var speed;
    var url = "http://www.plash.tw/api/antrack/get.php";
    $.post(url, { "token": token }, function(data){
    	//alert(JSON.stringify(data));
        if (data.status_code == "200") {
			var prevLatLng, currLatLng, prevVelocity, prevDistance, totalDistance, avgVelocity, points;
        	$.each(data.trip, function(i, marker) {
				if (i <= 0) {
					var lat = marker.lat.valueOf();
	                var lng = marker.lng.valueOf();
					prevLatLng = L.latLng(lat, lng);
					prevVelocity = 0;
					prevDistance = 0;
					totalDistance = 0;
					avgVelocity = 0;
					points = 1;
    	            trip.push(prevLatLng);
				}
            	var lat = marker.lat.valueOf();
                var lng = marker.lng.valueOf();
				currLatLng = L.latLng(lat, lng);
				var currDistance = currLatLng.distanceTo(prevLatLng);
				var currVelocity = currDistance / 10;
				var acc = Math.abs(currVelocity - prevVelocity) / 10;
				if (acc < 8 && acc != 0) {
                	trip.push(currLatLng);
					prevLatLng = currLatLng;
					prevDistance = currDistance;
					prevVelocity = currVelocity;
					totalDistance = currDistance + totalDistance;
					points++;
					avgVelocity = totalDistance / (points*10);
				}
            });

			sharerLocation = trip[trip.length-1];
			viewCenter.options.vcLatLng = trip[trip.length-1];
			viewCenter.options.title = 'Go to Current Location';
			viewCenter.options.vcZoom = map.getZoom();
			if(trip.length > num_of_point) {
				if (fristRun == 1) {
					polyline = L.polyline(trip, {color: 'red'}).addTo(map);
				} else {
					polyline.addLatLng(trip[trip.length-1]);
				}
				num_of_point = trip.length;
			}
			$.each(data.checkin, function(i, marker) {
				if(i > num_of_checkin) {
                	var lat = marker.lat.valueOf();
                	var lng = marker.lng.valueOf();
					var icon_html = "<img src=\"" + marker.thumb + "\" width=50 height=50 />";
					var image = L.divIcon({
						iconSize: [50, 50],
						iconAnchor: [25, 25],
						className: 'thumb',
						html: icon_html
					});
					var checkin = L.marker([lat, lng], {icon: image});
					checkin.on('click', function(e) {
						var checkinContent;
						if (mWidth > mHeight) {
							$('#pbox').attr({
								src:marker.url,
								height:mHeight
							});
							$("#picturebox").width($("#pbox").width());
							$("#picturebox").height(mHeight);
						} else {
							$('#pbox').attr({
                                src:marker.url,                                                                 
                                width:mWidth
                            });
							$("#picturebox").width(mWidth);
							$("#picturebox").height($("#pbox").height());
						}
                		$("#picturebox").overlay().load();
                        $("#picturebox").width($("#pbox").width());
                        $("#picturebox").height($("#pbox").height());    					
					});
					markers.addLayer(checkin);
					map.addLayer(markers);		
					num_of_checkin = i;
				}				
            });
			
			if (fristRun == 1) {
				var shareIcon = L.icon({
                        iconUrl: 'images/currentLoc.png',
                        iconRetinaUrl: 'images/currentLoc.png',
						iconAnchor: [14, 40],
                        });
				sharer = L.marker(trip[trip.length-1], {icon: shareIcon}).addTo(map);
				map.panTo(trip[trip.length-1]);
				fristRun = 0;
			} else {
				if (sharer.getLatLng() == trip[trip.length-1]) { 
				} else {
                	sharer.setLatLng(trip[trip.length-1]).update();
				}
			}
			var wlist = "<li><a href=\"#home\" class=\"contentLink\">Sharer </a></li><li class=\"active\"><a href=\"#home\" class=\"contentLink\"><img src=\"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash4/c178.0.604.604/s160x160/252231_1002029915278_1941483569_n.jpg\" alt=\"Smiley face\" width=\"42\" height=\"42\">  " + data.sharer + "</br></a></li><li><a href=\"#home\" class=\"contentLink\">Start </a></li><li class=\"active\"><a href=\"#home\" class=\"contentLink\">" + data.start + "</a></li><li><a href=\"#home\" class=\"contentLink\">Duration </a></li><li class=\"active\"><a href=\"#home\" class=\"contentLink\">" + data.eta + " minutes</a></li><li><a href=\"#home\" class=\"contentLink\">Distance</a></li><li class=\"active\"><a href=\"#home\" class=\"contentLink\">" + data.distance.toString() + " KM</a></li><li><a href=\"#home\" class=\"contentLink\">Speed</a></li><li class=\"active\"><a href=\"#home\" class=\"contentLink\">" + data.speed.toString() + " KM/Hr</a></li><li><a href=\"#home\" class=\"contentLink\">Watchers</a></li><li class=\"active\"><a href=\"#home\" class=\"contentLink\">" + data.number_of_watcher + " Followers</a></li>";
			$("#watcherlist").html(wlist);

			if (data.token_status == 1) {
				var message = "<h2>Sharing is not updated since " + data.end + 
					"</h2><p>User may end the sharing or disconnect the AnTrack service.<br>You can get ANTrack App on  " + 
					"<a href=\"https://play.google.com/store/apps/details?id=tw.plash.antrack\">"+
					"<img src=\"images/google_play_store_icon.png\" width=78 height=30 style=\"position:relative; top:+10px\"/></a></p>";
				$('#expiredbox').html(message);
				if ($(window).width() <= 640) {
					$('#expiredbox').width(mWidth);
				} else {
					$('#expiredbox').width(512);
				}
	            $('#expiredbox').overlay().load();
			} else if (data.token_status == 2) {
				var message = "<h2>Sharing has been stoped since " + data.end +
					"</h2><p>User may end the sharing or disconnect the AnTrack service.<br>You can get ANTrack App on  " + 
					"<a href=\"https://play.google.com/store/apps/details?id=tw.plash.antrack\">"+
					"<img src=\"images/google_play_store_icon.png\" width=78 height=30 style=\"position:relative; top:+10px\" /></a></p>";
                $('#expiredbox').html(message);
                if ($(window).width() <= 640) {
                    $('#expiredbox').width(mWidth);
                } else {
                    $('#expiredbox').width(512);
                }
                $('#expiredbox').overlay().load();
			}
        } else {
            $('#closebox').width(mWidth);
            $('#closebox').overlay().load();
        }
		
		$('#loadingbox').overlay().close();
	});
}

$.startWatch = function(){
	var d = new Date();
    var timestamp = d.Timestamp();
    var url = "http://www.plash.tw/api/antrack/startwatch.php";
    $.post(url, { "token": token, "hashid": hashid, "socialid": socialid, "timestamp": timestamp }, function(data){
    	if (data.status_code != "200") {
			$.startWatch();
        }
	});
}

$(document).bind("mobileinit", function () {
    $.mobile.pushStateEnabled = true;
	$('#menu').hide();	
});
 
$(document).ready(function () {
    var menuStatus;
	mHeight = Math.round($(window).height()*0.8); 
	mWidth = Math.round($(window).width()*0.8);
	$('#loadingbox').overlay({
		top: Math.round($(window).height()*0.4),
        mask: {
            color: '#fff',
            loadSpeed: 200,
            opacity: 0.3
        },
        closeOnClick: false,
        load: false 
    });
    $('#loadingbox').overlay().load();
    $('#closebox').overlay({
    	mask: {
        	color: '#ebecff',
            loadSpeed: 200,
            opacity: 0.3
        }, 
		closeOnClick: false,
		load: false
	});
    $("#picturebox").overlay({
        // custom top position
        //top: 60,
		left: Math.round($(window).width()*0.1),
        // some mask tweaks suitable for facebox-looking dialogs
        mask: {
            // you might also consider a "transparent" color for the mask
            color: '#fff',
            // load mask a little faster
            loadSpeed: 200,
            // very transparent
            opacity: 0.5
        },
        // disable this for modal dialog-type of overlays
        closeOnClick: true,
        // load it immediately after the construction
        load: false,
    });
    // Show menu
    $("a.showMenu").click(function () {
        if (menuStatus != true) {
	            $(".ui-page-active").animate({
                marginLeft: "165px",
            }, 300, function () {
                menuStatus = true
            });
            return false;
        } else {
            $(".ui-page-active").animate({
                marginLeft: "0px",
            }, 300, function () {
                menuStatus = false
            });
            return false;
        }
    });
    $('div[data-role="page"]').live('pagebeforeshow', function (event, ui) {
        menuStatus = false;
        $(".pages").css("margin-left", "0");
    });
 
    // Menu behaviour
    $("#menu li a").click(function () {
        var p = $(this).parent();
        if ($(p).hasClass('active')) {
            $("#menu li").removeClass('active');
        } else {
            $("#menu li").removeClass('active');
            $(p).addClass('active');
        }
    });

	// Map
	token = $.urlParam('token');
	hashid = $.cookie("hashid");
	$('#mapSwitcher').attr("href", "gmap.html?token="+token);
    if(hashid==null) {
		hashid = $.uniqID(20);
        $.cookie("hashid", hashid);
    }
   	$.startWatch();
	$('#map_canvas').height($(window).height() - $('#header').height() - 2);
	map = L.map('map_canvas').setView([25.04,121.61],16);
	L.tileLayer('http://map.plash.tw/osm_tiles/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}).addTo(map);
	//var googleLayer = new L.Google('ROADMAP');
	//map.addLayer(googleLayer);
	markers = L.markerClusterGroup({spiderfyDistanceMultiplier:3,maxClusterRadius:120});
	viewCenter = new L.Control.ViewCenter();
	map.addControl(viewCenter);
	map.on("locationfound", function(location) {
    	if (!mylocation)
        	mylocation = L.userMarker(location.latlng,{pulsing:true}).addTo(map);

    	mylocation.setLatLng(location.latlng);
    	mylocation.setAccuracy(location.accuracy);
	});
	map.locate({
    	watch: true,
    	locate: true,
    	setView: false,
    	enableHighAccuracy: true
	});		
    gettrip = setInterval(function(){$.drawTrip(token)},5000);
	
	$(window).unload(function(){
        //alert("close page");
        var url = "http://www.plash.tw/api/antrack/stopwatch.php";
                $.post(url, { "token": token, "hashid": hashid }, function(data){
                        if (data.status_code != "200") {
                        }
                });
    });
/*
    $(window).bind('beforeunload', function() {
        alert("close page 1");
        var url = "http://www.plash.tw/api/antrack/stopwatch.php";
                $.post(url, { "token": token, "hashid": hashid }, function(data){
                        if (data.status_code != "200") {
                        }
                });
    });
*/
});
 
