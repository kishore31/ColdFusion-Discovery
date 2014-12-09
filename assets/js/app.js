/*jslint browser: true*/
/*jslint plusplus: true */
/*global $, jQuery, Mustache, google, alert, console, invokeCFClientFunction*/
var app = {

	isOnline: false,
	template: '',
	map: '',
	placetypes: '',
	selPlaceType: [],
	selSearchType: 'PROMINENCE',
	lat: '',
	lon: '',
			
	init: function () {
		"use strict";
		app.bindEvents();
		app.getTemplate();
	},
	
	bindEvents: function () {
		"use strict";
		$("#actionBtn").addClass("findLocation");
		$("#actionBtn").on("click", function (e) {
			if ($(this).hasClass("findLocation")) {
				app.toggleElementClass("loading_ring", "block");
				app.startProcess();
			} else if ($(this).hasClass("placeTypeSelect")) {
				var $searchModal = $("#searchPlacesModal");
				$searchModal.addClass("slide-in-up");
				$("#closePlacesModal").on("click", function (e) {
					$searchModal.removeClass("slide-in-up");
				});
			}
		});
		
		$(".ion-ios7-close-empty").on("click", function (e) {
			$(".modal").removeClass("slide-in-up");
		});
		
		$("#searchPlaces").on("click", function (e) {
			var $searchModal = $("#searchPlacesModal");
			$searchModal.addClass("slide-in-up");
			$("#closePlacesModal").on("click", function (e) {
				$searchModal.removeClass("slide-in-up");
			});
		});
		$("#resetZoomLevel").on("click", function (e) {
			app.googlemap.resetZoomLevel();
		});
		
		$("#searchForPlaces").on("click", function (e) {
			var lat = $("#map").data("lat"),
				lon = $("#map").data("lon");
			app.selPlaceType = [];		
			app.googlemap.clearMarkers();
			//app.selSearchType = $("#searchBySelectParent").find(":selected").val();
			app.selPlaceType.push($("#placeSelectParent").find(":selected").val());
			app.googlemap.getPlacesByCoords(lat, lon, app.selPlaceType);
			$("#searchPlacesModal").removeClass("slide-in-up");
		});
	},
		
	toggleHeaderButtons: function (display) {
		$.each($(".bar-header .button"), function ( i, el ) {
			$(el).css("display", display);
		});
	},
	
	startProcess: function () {
		var $actionButton = $("#actionBtn");
		$actionButton.html("Tracking you down... don't move.").removeClass("button-energized").addClass("button-stable");
		invokeCFClientFunction('getCurrentLocation', function (position) {
			if (position === -1) {
				$actionButton.html('I was unable to find you. Try again?').removeClass("button-stable").addClass("button-energized");
				app.toggleElementClass("loading_ring", "none");
				app.toggleHeaderButtons("none");
				console.log("Timed out in invokeCFClientFunction for getCurrentLocation");
			} else {
				$actionButton.html('Got you!');
				app.googlemap.generateMap(position.coords.latitude, position.coords.longitude);
				invokeCFClientFunction('getAllPlaceTypes', function (placeTypes) {
					var placeData = {places: placeTypes};				
					$(".placeSelectionHolder").html(Mustache.render(app.template.filter('#placeTypeSelectRenderTpl').html(), placeData));
					$("#map").css("visibility", "visible").css("display", "block");
					app.toggleElementClass("loading_ring", "none");
					$actionButton.html('Select a place type').addClass("placeTypeSelect").removeClass("findLocation").removeClass("button-stable").addClass("button-energized");
					app.toggleHeaderButtons("block");
					$("#map").data("lat", position.coords.latitude);
					$("#map").data("lon", position.coords.longitude);
				});
				//app.flickr.getLocationPhotos(position.coords.latitude, position.coords.longitude);
			}				
		});
		
	},
	
	toggleElementClass: function (elementclass, display) {
		$("." + elementclass).css("display", display);
	},
	
	getTemplate: function () {
		"use strict";
		$.get("assets/templates/mustache.html", function (template) {
			app.template = $(template);
			app.docReady();
		});
	},
	
	loadPlacetypes: function () {
		"use strict";
		$.get('assets/place_types.json', function (data) {
			populateTypeTable(data);
		});
	},
			
	docReady: function () {
		"use strict";
		var connType;
		app.loadPlacetypes();
		connType = showConnectionType();
		app.isOnline = app.manageConnection(connType);
		if (app.isOnline) {
			$("#actionBtn").css('display', 'block');
		}
	},
	
	connectionOff: function () {
		"use strict";
		invokeCFClientFunction('showConnectionType', function (connType) {
			app.isOnline = app.manageConnection(connType);
		});
	},
	
	connectionOn: function () {
		"use strict";
		invokeCFClientFunction('showConnectionType', function (connType) {
			app.isOnline = app.manageConnection(connType);
		});
	},
	
	manageConnection: function (connectionType) {
		"use strict";
		switch (connectionType) {
		case 'none':
			app.toggleElementClass("bgoverlay", "block");
			app.toggleElementClass("loading_ring", "block");
			return false;
		default:
			app.toggleElementClass("bgoverlay", "none");
			app.toggleElementClass("loading_ring", "none");
			return true;
		}
	},
	
	flickr: {
		
		baseURL: 'http://api.flickr.com/services/rest/',
		api_key: 'fe2a32290c7d39d8617b6b16685a5217',
		
		getLocationPhotos: function (lat, lng) {
			"use strict";
			$.ajax({
				url: app.flickr.baseURL,
				type: "GET",
				data: {
					method: 'flickr.photos.search',
					group_id: '1463451@N25',
					safe_search: 1,
					jsoncallback: 'app.flickr.locationPhotoResponse',
					api_key: app.flickr.api_key,
					lat: lat,
					lon: lng,
					format: 'json'
				},
				dataType: "jsonp"
			});
		},

		locationPhotoResponse: function (photoData) {
			"use strict";
			var intPhotos = photoData.photos.photo.length,
				selectedPhoto = '';
			if (intPhotos) {
				selectedPhoto = photoData.photos.photo[app.flickr.pickRandRange(0, intPhotos)];
				if (selectedPhoto === undefined) {
					selectedPhoto = photoData.photos.photo[0];
					app.flickr.getLargePhotoByID(selectedPhoto.id);
				} else {
					app.flickr.getLargePhotoByID(selectedPhoto.id);
				}
			}
		},
	
		getLargePhotoByID: function (photoID) {
			"use strict";
			$.ajax({
				url: app.flickr.baseURL,
				type: "GET",
				data: {
					method: 'flickr.photos.getSizes',
					photo_id: photoID,
					jsoncallback: 'app.flickr.getPhotoImageResponse',
					api_key: app.flickr.api_key,
					format: 'json'
				},
				dataType: "jsonp"
			});
		},

		getPhotoImageResponse: function (photoData) {
			"use strict";
			var photoSizes = photoData.sizes.size;
			if (photoSizes.length) {
				$.each(photoSizes, function (index, object) {
					if (object.label === 'Medium') {
						$("body").css("background-image", "url(" + object.source + ")");
					}
				});
			}
		},

		pickRandRange: function (lower, upper) {
			"use strict";
			return Math.floor(Math.random() * (upper - lower + 1)) + lower;
		}
		
	},
	
	
	googlemap: {
		
		map: '',
		service: '',
		infowindow: '',
		placeMarkers: [],
		api_key: 'AIzaSyDB3TA-c8elVRPcjFDYLqJ3K1VNmU7r_Ys',
		bounds: '',
		
		resetZoomLevel: function () {
			app.googlemap.map.setZoom(15);
		},
		
		generateMap: function (lat, lng) {
			"use strict";
			var latlng = new google.maps.LatLng(lat, lng);
			app.googlemap.map = new google.maps.Map(document.getElementById('map'), {
				center: latlng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: true,
				mapTypeControl: false
			});
			var marker = new google.maps.Marker({
				position: latlng,
				map: app.googlemap.map,
				icon: new google.maps.MarkerImage('assets/img/client-location.svg', null, null, null, new google.maps.Size(40,40)),
			});
		},
		
		getPlacesByCoords: function (lat, lng, types) {
			"use strict";
			var $actionButton = $("#actionBtn"),
				bounds = new google.maps.LatLngBounds(),
				placeData = {},
				latlng = new google.maps.LatLng(lat, lng),
				request = {
					location: latlng,
					types: types,
					rankBy: google.maps.places.RankBy.DISTANCE
				},
				placeIndex = 0;
			$actionButton.html('Plotting results...').removeClass("placeTypeSelect").removeClass("findLocation").removeClass("button-energized").addClass("button-stable");
			app.toggleElementClass("loading_ring", "block");
			app.googlemap.service = new google.maps.places.PlacesService(app.googlemap.map);
			app.googlemap.service.nearbySearch(request, function (results, status) {
				console.log(results);
				console.log(status);
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					for (placeIndex = 0; placeIndex < results.length; placeIndex++) {
						var place = results[placeIndex];
						app.googlemap.createMarker(place);
					}
				}
				for(var i in app.googlemap.placeMarkers) {
					bounds.extend(app.googlemap.placeMarkers[i].getPosition());
				}
				app.toggleElementClass("loading_ring", "none");
				$actionButton.html('Select a place type').addClass("placeTypeSelect").removeClass("findLocation").removeClass("button-stable").addClass("button-energized");
				app.googlemap.map.fitBounds(bounds);
			});
		},

		clearMarkers: function () {
			"use strict";
			if (app.googlemap.placeMarkers.length) {
				for (var i = 0; i < app.googlemap.placeMarkers.length; i++) {
					app.googlemap.placeMarkers[i].setMap(null);
				}
				app.googlemap.placeMarkers = [];
			}
		},
		
		createMarker: function (place) {
			"use strict";
			var $actionButton = $("#actionBtn"),
				placeLoc = place.geometry.location,
				gpmarker = new google.maps.MarkerImage('assets/img/marker.svg', null, null, null, new google.maps.Size(40, 40)),
				marker = new google.maps.Marker({
					map: app.googlemap.map,
					position: placeLoc,
					title: place.name,
					icon: gpmarker
				});
				app.googlemap.placeMarkers.push(marker);
			google.maps.event.addListener(marker, 'click', function () {
				var request = {reference: place.reference};
				app.toggleElementClass("loading_ring", "block");
				$actionButton.html('Getting details...').removeClass("placeTypeSelect").removeClass("findLocation");
				app.googlemap.service.getDetails(request, function(placeDetails, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						app.toggleElementClass("loading_ring", "none");
						$actionButton.html('Select a place type').addClass("placeTypeSelect").removeClass("findLocation");
						if (place.photos) {
							var placePhoto = place.photos[0].getUrl({'maxWidth': 268,'maxHeight': 151});
							placeDetails.photo = placePhoto;
						}
						placeDetails.human_time = function () {
							var time = this.time*1000;
							var date = new Date(time);
							return moment(date).fromNow();
						};	
						placeDetails.openLTFormat = function () {
							return moment(this.open.nextDate).format('LT');
						};
						placeDetails.closeLTFormat = function () {
							return moment(this.close.nextDate).format('LT');
						};
						placeDetails.dayOfWeekFromInt = function () {
							var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
							return days[this.open.day];
						};
						$("#placeDetailModalContent").html(Mustache.render(app.template.filter('#placeDetailModalRenderTpl').html(), placeDetails));
						$("#placeDetailModal").addClass("slide-in-up");
						//console.log(placeDetails);
					}
				});
			});
		}	
	}
};

var QueryToObject = function(q) {
	var col, i, r, _i, _len, _ref, _ref2, _results;
    _results = [];
    for (i = 0, _ref = q.ROWCOUNT; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
	r = {};
      _ref2 = q.COLUMNS;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        col = _ref2[_i];
        r[col.toLowerCase()] = q.DATA[col][i];
      }
      _results.push(r);}
	return _results;
};