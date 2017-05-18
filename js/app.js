$(document).ready(function(){
// map height to bottom of viewport
	var  $header = $("header")
		,$mapBox = $(".map-box")
		;
	$(window).resize(function(){
			$mapBox.outerHeight(function(){
				return verge.viewportH() - $header.outerHeight();
			})
		// }
	});
	$(window).trigger("resize");

// search_form toggle button
	// треба ф-я перерахунку позиції, бо відкрита форма анімовано позиціонується відносно top (а не css.bottom)
		var closedSearchFormHeight = $(".map-box__inner .container").outerHeight();	// висота мінімізованого .map-box__inner (кнопка форми фактично)
	var minimizedMenuPosition = function(){ 
		// console.log(closedSearchFormHeight);
		return ($mapBox.outerHeight() - closedSearchFormHeight - 20);	
	}
	$(".searchForm__btn_toggle").click(function(){
		if ($(".map-box__inner").hasClass("js-opened")){
			$(".map-box__inner").animate({
				opacity: 0.5,
				top: minimizedMenuPosition()	// тепер плясати приходиться від top :(
			},300);

		} else{
			$(".map-box__inner").animate({
				opacity: 1,
				top: 0
			},300);
		}
		$(this).parents(".container_mapForm").find("#form_search").toggle(300);
		$(this).children().toggleClass("rotate_vertical");
		$(".map-box__inner").toggleClass("js-opened");
	});
	// оскільки тепер прив'язка до top через js, то при ресайзі вікна мінімізований .map-box__inner треба переміщати
	$(window).resize(function(){
		$(".map-box__inner").css("top", minimizedMenuPosition());
		if (verge.viewportW()<768){
			if (!$(".map-box__inner").hasClass("js-opened")){
				closedSearchFormHeight = $(".map-box__inner .container").outerHeight();
			} else{
				$(".map-box__inner").css("top", 0);
			}
		}else{
			$(".map-box__inner").attr("style", "");
			$("#form_search").attr("display", "block")
			closedSearchFormHeight = $(".map-box__inner .container").outerHeight();
		}
	});

// map initialization (Leaflet.js plugin)
	if ($("#map")[0]){	// uinitialize if map container exists
	var map = L.map('map').setView([50.4036, 30.4812], 11);	//створюємо карту, виставляємо координати + зум
	// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {	// шар зображення карти
		// L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {	// шар зображення карти
		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {	// шар зображення карти
			subdomains: ["a", "b", "c"],
		    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
	map.scrollWheelZoom.disable();	// disable zoom on map by mousewheel
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
                   // layer.bindPopup('<strong>' + feature.properties.title +'</strong>' + '<br>' + feature.properties.content);	// for map(old).json
                   layer.bindPopup("<strong><a href='" + feature.properties.link + "'>"+ feature.properties.title +'</a></strong>' + '<br>' + feature.properties.content);
           }
		});
		markers.addLayer(layer);
		// markers.addTo(map);
		map.addLayer(markers);
	};

	var  geoDataUrlBase = "./ajax/map.json"
		,geoDataUrl
		;
	geoDataUrl = geoDataUrlBase;
	// $.get("./ajax/map.json", {}, geoDataSuccess);   

	//map markers request form
	var  $form = $("#form_search")
		,$search = $form.find("#search")
		,$rubric = $form.find("#rubric")
		,$city = $form.find("#city")
		,$dateRange = $form.find("#dateRange")
		,$radius = $form.find("#radius")
		,$sellOrBuy = $form.find("input[name='sellOrBuy']")
		;

	$(".map-box #form_search button[type='submit']").click(function(event){
		event.preventDefault();
		// geoDataUrl = geoDataUrlBase + "?search=" + $search.val() + "&rubric=" + $rubric.val() + "&city=" + $city.val() + "&dateRange=" + $dateRange.val() + "&radius=" + $radius.val() + "&sellOrBuy=" + $sellOrBuy.val();
		// $.get(geoDataUrl, {}, geoDataSuccess);
		markers.clearLayers();
		$.get(geoDataUrlBase, {
			search: $search.val(),
			rubric: $rubric.val(),
			city: $city.val(),
			dateRange: $dateRange.val(),
			radius: $radius.val(),
			sellOrBuy: $sellOrBuy.filter(":checked").val()
		}, geoDataSuccess);
	});
	$(".map-box #form_search button[type='submit']").trigger("click");
	} // if end

//ajax city autocomplete
	var  oJS
		,cities = []
	    ,ids = []
	    ;
	$("#city").autoComplete({
		minChars: 2,
	    source: function(term, response){
	        $.getJSON('./ajax/autocomplete.json', { city: term }, function(data){
	        	// console.log(data.cities[0].name);\
	        	cities = []; // масив міст
	    		ids = [];	// масив id міст
	        	oJS = data;	//відповідний JSоб'єкт до JSON об'єкту AJAX відповіді

	        	for (var i = 0; i < oJS.cities.length; ++i) {	// наповнимо масив міст і їхніх id
	        		cities.push(oJS.cities[i].name);
	        		ids.push(oJS.cities[i].id);
	        	};
	        	response(cities);
	        });
	    },
	    onSelect: function (event, term, item) {
	    	var cityIndex = cities.indexOf(term);	// індекс міста в масиві
	    	$("#cityId").val(ids[cityIndex]);	// повертаємо id міста прихованому елементу форми
	    }
	});

// ads catalogue without ajax
	var $btnsPropos = $(".btn_propos").click(function(event){
		event.preventDefault();
		var  $rubricBuy = $("#rubric_buy")
			,$rubricSell = $("#rubric_sell")
			,$rubrics
			;
		$rubrics = $rubricBuy.add($rubricSell);	// об'єднуємо $rubricBuy і $rubricSell в $rubrics

		if (!$rubrics.is(":animated")){	// відпрацьовує лише коли анімація блоків скінчилася
			// стилізуємо кнопки
			$btnsPropos.parent("li").removeClass("active");
			$(this).parent("li").addClass("active");

			if ($(this).attr("id")=="buyPropos"){
				console.log("buy");
				console.log(!$rubricBuy.hasClass("js-active"));
				if (!$rubricBuy.hasClass("js-active")) {
					$rubricSell.removeClass("js-active").fadeOut(200, function(){
						$rubricBuy.addClass("js-active").fadeIn(200);
					})
				};
			}else if ($(this).attr("id")=="sellPropos"){
				console.log("sell");
				console.log(!$rubricSell.hasClass("js-active"));
				if (!$rubricSell.hasClass("js-active")) {
					$rubricBuy.removeClass("js-active").fadeOut(200, function(){
						$rubricSell.addClass("js-active").fadeIn(200);
					})
				};
			}
		}
	});

//ajax new in ads load
	$(".ajax_newInAds").load("./ajax/_ads-new.html", function(){
		//new in ads slider initialization
		var $newInAdsSlick = $("#newInAds>.ajax_newInAds").slick({
			// lazyLoad: 'ondemand',
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
			// lazyLoad: 'ondemand',
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
	var refreshRadius = function(){	//записуватимемо значення jQuery UI слайдера в прихований html повзунок
		var radius = $(this).slider("value");
		$(this).parents(".wrap__slider").find("input[type='range']").val(radius);
		$(this).parents(".row").find(".span_radius").text(radius);
		// console.log($(this).parents(".row").find(".span_radius"))
	}

	var jqUiSlider = $( "#slider" ).slider({
		range: "min",
		max: 100,	// максимальне значення
      	value: 12,	//початкове значення
      	create: function(){
      		var radius = $(this).slider("value");
			$(this).parents(".wrap__slider").find("input[type='range']").val(radius).addClass("sr-only");	//ховаємо html повзунок
      	},
      	slide: refreshRadius,
      	change: refreshRadius
	});

//=catalog.html =====================
// selects in form
	$("#form_catalog select").selectric({
		customClass: {
	      prefix: 'selectriccatalog', // Type: String.  Description: Prefixed string of every class name.
	      camelCase: false     // Type: Boolean. Description: Switch classes style between camelCase or dash-case.
	    },
	    onInit: function() {
			$(".selectriccatalog-wrapper>.selectriccatalog-items ul>li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
		},
		onChange: function() {
		    $(this).parents(".selectriccatalog-wrapper").find(".selectriccatalog .label").css("color", "#3b5e8a");
		}
	});
//підвантажуватимемо маркери при зміні значень в полях форми
	var  $catalogForm = $("#form_catalog");

	if ($catalogForm[0]){
		$city = $catalogForm.find("#city");
		$radius = $catalogForm.find("#radius");
		$rubric = $catalogForm.find("#rubric");
		$sellOrBuy = $catalogForm.find("input[name='sellOrBuy']");
		
		var  $district = $catalogForm.find("#district")
			,$sort = $catalogForm.find("#sort")
			,$view = $catalogForm.find("input[name='view']")
			;

		$catalogForm.find("input, select").change(function(){
			if ($(this).attr("name")=="view"){	//не перезавантажуватимемо маркери при зміні вигляду (плитка/список)
				return;
			} else{
				markers.clearLayers();	//очистимо карту від маркерів
				$.get(geoDataUrlBase, {	//завнтажимо новий geojson
					city: $city.val(),
					radius: $radius.val(),
					rubric: $rubric.val(),
					sellOrBuy: $sellOrBuy.filter(":checked").val(),
					district: $district.val(),
					sort: $sort.val()
				}, function(data){
						geoDataSuccess(data);	//наносимо маркери із отриманого geojson
						
						// запишемо нові об'яви і нову пагінацію
						if ($view.filter(":checked").val()=="list"){
							$.get("./ajax/_catalogue-list.html", {
								city: $city.val(),
								radius: $radius.val(),
								rubric: $rubric.val(),
								sellOrBuy: $sellOrBuy.filter(":checked").val(),
								district: $district.val(),
								sort: $sort.val(),
								view: "list"
							}, function(data1) {
								$(".ajax_catalog_view").html(data1);
							});
							$.get("./ajax/_pagination-list.html", {
								city: $city.val(),
								radius: $radius.val(),
								rubric: $rubric.val(),
								sellOrBuy: $sellOrBuy.filter(":checked").val(),
								district: $district.val(),
								sort: $sort.val(),
								view: "list"
							}, function(data1) {
								$(".ajax_pagination").html(data1);
							});
						} else if ($view.filter(":checked").val()=="tiles") {
							$.get("./ajax/_catalogue-tiles.html", {
								city: $city.val(),
								radius: $radius.val(),
								rubric: $rubric.val(),
								sellOrBuy: $sellOrBuy.filter(":checked").val(),
								district: $district.val(),
								sort: $sort.val(),
								view: "tiles"
							}, function(data1) {
								$(".ajax_catalog_view").html(data1);
							});
							$.get("./ajax/_pagination-tiles.html", {
								city: $city.val(),
								radius: $radius.val(),
								rubric: $rubric.val(),
								sellOrBuy: $sellOrBuy.filter(":checked").val(),
								district: $district.val(),
								sort: $sort.val(),
								view: "tiles"
							}, function(data1) {
								$(".ajax_pagination").html(data1);
							});
						}
				});
			}
		});
		$("label[for='sell']").click();
	}
	

//ajax list/tiles view
	var  $listBtn = $catalogForm.find("label[for='list']")
		,$tilesBtn = $catalogForm.find("label[for='tiles']")
		;

	$listBtn.click(function(){	//підвантажує об'яви у вигляді списку
		$(".ajax_catalog_view").load("./ajax/_catalogue-list.html");
		$(".ajax_pagination").load("./ajax/_pagination-list.html");
	})
	$tilesBtn.click(function(){	//підвантажує об'яви у вигляді плитки
		$(".ajax_catalog_view").load("./ajax/_catalogue-tiles.html");
		$(".ajax_pagination").load("./ajax/_pagination-tiles.html");
	})
	$listBtn.trigger("click");	//завантажимо спочатку об'яви у вигляді списка'

//seotext readmore
	$(".b-readmore").click(function(){
		$(this).prev().addClass("visible").css("height", "auto");	//приховуємо білий градієнт і показуємо увесь текст
		$(this).fadeOut(300);	// ховаємо кнопку
	});

// map in lot page
	var	 $sellerMap = $("#map.seller__map")
		,lotMarker
		,lotCoordinates
		,lotIcon = L.divIcon({	// сірий маркер
					className: 'arrow_box',	//custom html div marker
					iconSize:     [35, 35],	//marker size
					iconAnchor: [17.5, 39],	//making arrow points ti a place, not top left corner of div
					popupAnchor:  [0, -37],
					html: "<div class='arrowBox__circle circle_"+"grey"+"'></div>"	// circle inside the marker
				});

		if($sellerMap[0]){	// lot page check
			var  lotLat = $sellerMap.attr("data-lat")
				,lotLng = $sellerMap.attr("data-lng")
				;
			map.setView([lotLat, lotLng], 10); // centering map with custom zoom value
			lotMarker = new L.marker([lotLat, lotLng], {icon: lotIcon});
			lotMarker.addTo(map);
		}	
// like activation
	$(".likeBlock").click(function(event){
		event.preventDefault();
		$(this).toggleClass("likeBlock_active");
	})
// слайдер в сторінці лота
	// ініціалізація
	var $otherAdsSlick = $("#otherAds>.row").slick({
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
	//add buttons to otherAds slider
	var  $prevBtnOther = $otherAdsSlick.parents(".section_otherAds").find("a.prevBtn")
		,$nextBtnOther = $otherAdsSlick.parents(".section_otherAds").find("a.nextBtn")
		;

	$prevBtnOther.click(function(event){
		event.preventDefault();
		$otherAdsSlick.slick("slickPrev");
	});	
	$nextBtnOther.click(function(event){
		event.preventDefault();
		$otherAdsSlick.slick("slickNext");
	});
// галерея в лоті 
	$(".lot__image_small").click(function(){
		var  srcSmall = $(this).find("img").attr("src")	//адреса клікнутого фото
			// ,srcLarge
			;
		$(this).parents(".lot__images").find(".lot__image_large img").attr("src", srcSmall);	// покажемо у великому зображенні клікнуте фото
	})
// authentification/registration page
	$(".authentification .nav-tabs>li>a").click(function(event){
		event.preventDefault();
		if (!$(this).parent().hasClass("active")){
			var  $authBlock = $(this).parents(".authentification")
				,$enterLI = $authBlock.find("#authEnter").parent()
				,$regLI = $authBlock.find("#authReg").parent()
				,$enterForm = $("#formAuth")
				,$regForm = $("#formReg")
				;
			$(this).parent().toggleClass("active");
			if ($(this).attr("id") == "authEnter"){
				$regForm.slideUp(400);
				$enterForm.slideDown(400);
				$regLI.toggleClass("active");
			} else if ($(this).attr("id") == "authReg") {
				
				$enterForm.slideUp(400);
				$regForm.slideDown(400);
				$enterLI.toggleClass("active");
			}
		}
	});
// select in lot creation
	$("#formCreate select").selectric({
		customClass: {
	      prefix: 'selectriccatalog', // Type: String.  Description: Prefixed string of every class name.
	      camelCase: false     // Type: Boolean. Description: Switch classes style between camelCase or dash-case.
	    },
	    onInit: function() {
			$(".selectriccatalog-wrapper>.selectriccatalog-items ul>li.disabled").remove();	//прибираємо з меню неактивний пункт (placeholder)
		},
		onChange: function() {
		    $(this).parents(".selectriccatalog-wrapper").find(".selectriccatalog .label").css("color", "#3b5e8a");
		}
	});
// map in create.html
	if ($("#mapNewLot")[0]){	// uinitialize if map container exists
		var map = L.map('mapNewLot').setView([50.4036, 30.4812], 11);	//створюємо карту, виставляємо координати + зум
		// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {	// шар зображення карти
		// L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {	// шар зображення карти
		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {	// шар зображення карти
			subdomains: ["a", "b", "c"],
		    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		map.on("click", function(e){
			// map.clearLayers();
			// var markers = L.markerClusterGroup();
			if (lotMarker){
				map.removeLayer(lotMarker);
			}
			lotCoordinates = e.latlng;
			lotMarker = new L.marker(e.latlng, {draggable:'true'});
//			$("#formCreate #coordinates").val("широта: " + lotCoordinates.lat + "; долгота: " + lotCoordinates.lng + ";");
			$("#formCreate #latitude").val(lotCoordinates.lat);
			$("#formCreate #longitude").val(lotCoordinates.lng);
			lotMarker.on('dragend', function(event){
			    lotMarker = event.target;
			    lotCoordinates = lotMarker.getLatLng();
			    lotMarker.setLatLng(new L.LatLng(lotCoordinates.lat, lotCoordinates.lng),{draggable:'true'});
			    map.panTo(new L.LatLng(lotCoordinates.lat, lotCoordinates.lng));
				$("#formCreate #latitude").val(lotCoordinates.lat);
				$("#formCreate #longitude").val(lotCoordinates.lng);
			});
			map.addLayer(lotMarker);
		});
	}
// messages in conversation send by enter button
	if ($(".ad__conversation")[0]) {
		$("#message_send #message").on("keyup", function(event){
			if ( event.which == 13 ) {
				$(this).parents("#message_send").submit();
			}
		});
	};
});