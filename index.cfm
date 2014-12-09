<html>
<head>
<link rel="stylesheet" href="assets/css/ionic.css">
<!-- inject:css -->
<link rel="stylesheet" href="assets/css/build/discoveryapp-0.0.3.min.css">
<!-- endinject -->
</head>
<body>
	
<div class="bgoverlay"></div>

<div class="bar bar-header bar-assertive">
	<button class="button button-icon icon ion-ios7-minus-outline" id="resetZoomLevel" style="display: none;"></button>
	<div class="h1 title">Discovery</div>
	<button class="button button-icon icon ion-search ion-ios7-search" id="searchPlaces" style="display: none;"></button>
</div>

<div class="scroll-content has-header">
	<button id="actionBtn" style="display: none;" class="button button-block button-energized">Locate Me</button>	
	<div class="loading_ring" style="display: none;"></div>
	<div id="map" class="map" style="visibility: hidden; display: none;"></div>
</div>

<div class="modal" id="searchPlacesModal">
	<header class="bar bar-header bar-assertive">
		<h1 class="title">Find Places</h1>
	  	<button class="button button-icon icon ion-ios7-close-empty" id="closePlacesModal"></button>
	</header>
	<div class="scroll-content has-header scrollPadding" has-header="true">
  		<div class="list">
	    	<div class="placeSelectionHolder"></div>
	  		<div class="padding">
	    		<button class="button button-full button-energized" id="searchForPlaces">Search</button>
	  		</div>
		</div>
	</div>
</div>

<div class="modal" id="placeDetailModal">
<header class="bar bar-header bar-assertive">
	<h1 class="title">Details</h1>
	<button class="button button-icon icon ion-ios7-close-empty"></button>
</header>
<div id="placeDetailModalContent" class="scroll-content has-header scrollPadding" has-header="true"></div>
</div>
<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=true"></script>
<script type="text/javascript" src="assets/js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="assets/js/mustache.js"></script>
<script type="text/javascript" src="assets/js/moment.min.js"></script>
<!-- inject:js -->
<script src="assets/js/build/discoveryapp-0.0.3.min.js"></script>
<!-- endinject -->
		
<cfclientsettings detectdevice="true" />
<cfclientsettings enabledeviceapi="true" />
<cfclient>
<cfscript>

objDatasource = new com.monkeh.datasource();
app.init();

function populateTypeTable(data) {
	return objDatasource.populateTypeTable(data);
}

function getAllPlaceTypes() {
	return QueryToObject(objDatasource.getAllPlaceTypes());
}

function getCurrentLocation() {
	var options = {maximumAge: 3000, timeout: 10000, enableHighAccuracy: false };	
	try {
		var position = cfclient.geolocation.getCurrentPosition(options) ;
		return position;
	} catch (any e) {
		console.log("Exception in getLocation: " + e.message);
		return -1;
	}
}

function showConnectionType() {
	return cfclient.connection.getType();
}

cfclient.connection.onOffline(function() {
	app.connectionOff();
});

cfclient.connection.onOnline(function() {
	app.connectionOn();
});
</cfscript>
</cfclient>
	
</body>
</html>