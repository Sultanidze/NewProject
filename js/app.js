$(document).ready(function(){
// map initialization (Leaflet.js plugin)
	var map = L.map('map').setView([50.4036, 30.4812], 11);	//створюємо карту, виставляємо координати + зум
	// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {	// шар зображення карти
		L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {	// шар зображення карти
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	var markers = L.markerClusterGroup();
	var geoDataSuccess = function(data){	//function fired after succesfull geoJson data ajax load
		var layer = L.geoJSON(data,{
			pointToLayer: function(feature, latlng) {
				var color = feature.properties.color;	//save current feature marker color
				var myIcon = L.divIcon({
					className: 'arrow_box',	//custom html div marker
					iconSize:     [35, 35],	//marker size
					iconAnchor: [17.5, 39],	//making arrow points ti a place, not top left corner of div
					popupAnchor:  [0, -37],
					html: "<div class='arrowBox__circle circle_"+color+"'></div>"	// circle inside the marker
				});
				return L.marker(latlng, {icon: myIcon});	//custom html marker icon
			},
			onEachFeature: function (feature, layer) {
                   layer.bindPopup('<strong>' + feature.properties.title +'</strong>' + '<br>'
                                                 + feature.properties.content);
           }

		});
		markers.addLayer(layer);
		// markers.addTo(map);
		map.addLayer(markers);
	};

	var geoDataUrl = "./ajax/map.json";
	$.get(geoDataUrl, {}, geoDataSuccess);
//ajax ads catalog load
	var  $rubricsAjax = $(".ajax_rubrics").load("./ajax/_buy-catalogue.html")	// before proposition buttons click
	//
		,$btnsPropos = $(".btn_propos").click(function(event){
			event.preventDefault();
			$btnsPropos.parent("li").removeClass("active");
			$(this).parent("li").addClass("active");
			// console.log($(this));
			if ($(this).attr("id")=="buyPropos"){
				$rubricsAjax.load("./ajax/_buy-catalogue.html");
			}else{
				$rubricsAjax.load("./ajax/_sell-catalogue.html");
			}
		});
//ajax new in ads load
	$(".ajax_newInAds").load("./ajax/_ads-new.html", function(){
		//new in ads slider initialization
		var $newInAdsSlick = $("#newInAds>.ajax_newInAds").slick({
			lazyLoad: 'ondemand',
			arrows: false,
			infinite: false,
			speed: 300,
			slidesToShow: 3,
			slidesToScroll: 3,
			responsive: [{
					breakpoint: 992,
					settings: {
					slidesToShow: 2,
					slidesToScroll: 2,
					}
				},
				{
					breakpoint: 768,
					settings: {
					slidesToShow: 1,
					slidesToScroll: 1
					}
			}]
		});
		// add my buttons to ads slider
		var  $prevBtnAds = $newInAdsSlick.parent("#newInAds").nextAll().find("a.prevBtn")
			,$nextBtnAds = $newInAdsSlick.parent("#newInAds").nextAll().find("a.nextBtn")
			;

		$prevBtnAds.click(function(event){
			event.preventDefault();
			$newInAdsSlick.slick("slickPrev");
		});	
		$nextBtnAds.click(function(event){
			event.preventDefault();
			$newInAdsSlick.slick("slickNext");
		});
	});

//ajax new in blog load
	$(".ajax_newInBlog").load("./ajax/_blog-new.html", function(){
		//new in blog slider initialization
		var $newInBlogSlick = $("#newInBlog>.row").slick({
			lazyLoad: 'ondemand',
			arrows: false,
			infinite: false,
			speed: 300,
			slidesToShow: 4,
			slidesToScroll: 4,
			responsive: [{
					breakpoint: 1200,
					settings: {
					slidesToShow: 3,
					slidesToScroll: 3,
					}
				},
				{
					breakpoint: 992,
					settings: {
					slidesToShow: 2,
					slidesToScroll: 2,
					}
				},
				{
					breakpoint: 768,
					settings: {
					slidesToShow: 1,
					slidesToScroll: 1
					}
			}]
		});
		// add my buttons to blog slider
		var  $prevBtnBlog = $newInBlogSlick.parent("#newInBlog").nextAll().find("a.prevBtn")
			,$nextBtnBlog = $newInBlogSlick.parent("#newInBlog").nextAll().find("a.nextBtn")
			;

		$prevBtnBlog.click(function(event){
			event.preventDefault();
			$newInBlogSlick.slick("slickPrev");
		});	
		$nextBtnBlog.click(function(event){
			event.preventDefault();
			$newInBlogSlick.slick("slickNext");
		});
	});

//selectric initialization
	// map form
	$("#form_search select").selectric({
		onInit: function() {
			$(".selectric-wrapper>.selectric-items ul>li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
		},
		onChange: function() {
		    $(this).parents(".selectric-wrapper").find(".selectric .label").css("color", "#3b5e8a");
		}
	});
	//footer city phone number select
	var phoneNumFill = function(){	//fill contactUs span with select value (phone number)
		var number = $(this).val();
		$(this).parents(".contactUs").find(".contactUsPhone").text(number);
	}
	$(".footer_main select#citiesPhoneNums").selectric({
		customClass: {
	      prefix: 'selectricfooter', // Type: String.  Description: Prefixed string of every class name.
	      camelCase: false     // Type: Boolean. Description: Switch classes style between camelCase or dash-case.
	    },
	    onInit: phoneNumFill,
	    onChange: phoneNumFill
	});

//slider for map radius (uses jQuery UI)
	var refreshRadius = function(){
		var radius = $(this).slider("value");
		$(this).parents(".wrap__slider").find("input[type='range']").val(radius);
		$(this).parents(".row").find(".span_radius").text(radius);
		console.log($(this).parents(".row").find(".span_radius"))
	}

	var jqUiSlider = $( "#slider" ).slider({
		range: "min",
		max: 100,
      	value: 12,
      	create: function(){
      		var radius = $(this).slider("value");
			$(this).parents(".wrap__slider").find("input[type='range']").val(radius).addClass("sr-only");
      	},
      	slide: refreshRadius,
      	change: refreshRadius
	});
	
});