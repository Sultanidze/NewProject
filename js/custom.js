$(document).ready(function(){
    
    // скролл сообщений при загрузке страницы диалога
    if($(".ad__messages").length)
    {
        $(".ad__messages").animate({ scrollTop: $(".ad__messages")[0].scrollHeight}, 1000);    
    }
        
    // закрытие лота    
    $(document).on('click', ".close__lot", function(){
        var button = $(this);
        var lot_id = button.data('lotId');
        
        $.ajax({
            method: "POST",
            url: "/lots/close-lot",
            data: { lot_id : lot_id },
            cache: false,
            dataType: 'json',
            success: function(response) {
                if(response.ans == true) {
                    var lot = button.closest(".lot_my");
                    $(lot).removeClass('lot_active').addClass('lot_inactive');
                    $(lot).find('a').removeAttr('href');
                    button.attr("disabled", true);
                } else {
                    console.log(response.msg);
                }
            }            
        });
    });
    
    // отправка сообщения
    $('#message_send').submit(function(e){
        e.preventDefault();
        var form = $('#message_send');
        var data = form.serialize();
        var text_msg = $('#message_send #message').val();
        $.ajax({
            // method: "POST",
            // url: "/dialogs/send-message",
            method: "get",
            url: "./ajax/send-message.json",
            data: data,
            cache: false,
            dataType: 'json',
            beforeSend: function(){
                // заблокируем полее ввода сообщения, пока запрос отправляется
                $('#message_send #message').attr('disabled', true);
            },
            success: function(response) {
                console.log(response);
                $('#message_send #message').attr('disabled', false);
                if(response.ans == true) {
                    $('#message_send #message').val(''); // очищаем поле ввода текста сообщения 
                    $('#message_send #message').focus();
                    // формируем текущую дату
                    var date = new Date();
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var fomatted_date = date.getHours() + ":" + date.getMinutes() + " " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
                    var view = "<div class='wrap_message'>"+
                                "<div class='ad__message message_request'>"+
                                    "<div class='message__content'>"+
                                        "<span class='message__date'>" + fomatted_date + "</span>"+
                                        "<p class='message__text'>" + text_msg + "</p>"+
                                    "</div>"+
                                    "<aside>"+
                                        "<img src='/img/user.svg' class='message__avatar'>"+
                                    "</aside>"+
                                "</div>"+
                            "</div>";
                    if($('.wrap_message').length)
                    {
                        $(view).insertAfter(".wrap_message:last");
                    }
                    else
                    {
                        $(view).appendTo(".ad__messages");
                    }
                    
                    // скроллим блок сообщений вниз
                    $(".ad__messages").animate({ scrollTop: $(".ad__messages")[0].scrollHeight}, 1000);
                } else {
                    // надо бы что-то показать, если произошла ошибка при создании сообщения
                    console.log(response.msg);
                }
            }            
        });
        
        return false;
    });
    
    // google autocomplite places   
    var input = /** @type {!HTMLInputElement} */
        document.getElementById('address');

    if(typeof input === 'object')
    {
        var autocomplete = new google.maps.places.Autocomplete(input);
        var infowindow = new google.maps.InfoWindow();

        autocomplete.addListener('place_changed', function() {
            infowindow.close();
            var place = autocomplete.getPlace();
            var lat = place.geometry.location.lat(),
                lng = place.geometry.location.lng();

                $('#google_address').val(place.name);        
                $('#latitude').val(lat);
                $('#longitude').val(lng);
                // иницируем маркер на карте
                $('#longitude').trigger('change');
                   
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No details available for input: '" + place.name + "'");
                return;
            }

//            var address = '';
//            if (place.address_components) {
//                address = [
//                  (place.address_components[0] && place.address_components[0].short_name || '')
//                  (place.address_components[1] && place.address_components[1].short_name || ''),
//                  (place.address_components[2] && place.address_components[2].short_name || '')
//                ].join(' ');
//            }

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>');

        }); 
    }
    
    
    // create/delete bookmarks
    $(document).on('click', '.otherAd__like', function(e){
        e.preventDefault();
        var link = $(this);
        var lot_id = link.data('lot');

        $.ajax({
            type: 'post',
            url : '/user-bookmarks/bookmark/' + lot_id,
            cache: false,
            success: function(response){
                if(response.status == true)
                {
                    link.parent('.likeBlock').toggleClass('likeBlock_active');   
                }
            }
        });
        return false;
    });

// изменение некоторых настроек юзера
    $('.form_change_settings').submit(function(e){
        e.preventDefault();    
        var data = $('.form_change_settings').serialize();
        $.ajax({
            type: 'post',
            data: data,
            url : '/user/change-settings',
            cache: false,
            dataType: 'json',
            success: function(response){
                console.log(response);
            }
        });
        return false;
    });
    
});