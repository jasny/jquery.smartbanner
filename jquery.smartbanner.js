/*!
 * jQuery Smart Banner
 * Copyright (c) 2012 Arnold Daniels <arnold@jasny.net>
 * Based on 'jQuery Smart Web App Banner' by Kurt Zenisek @ kzeni.com
 */
!function($){
    var SmartBanner = function(options){
        this.origHtmlMargin = parseFloat($('html').css('margin-top')) // Get the original margin-top of the HTML element so we can take that into account
        this.bannerHeight = 81
        this.options = $.extend({}, $.fn.smartbanner.defaults, options)
        
        var standalone = navigator.standalone // Check if it's already a standalone web app or running within a webui view of an app (not mobile safari)

        // Detect banner type (iOS or Android)
        if(this.options.force) {
            this.type = this.options.force
        }else if(navigator.userAgent.match(/iPad|iPhone/i) != null){
            if (window.Number(navigator.userAgent.substr(navigator.userAgent.indexOf('OS ') + 3, 3).replace( '_', '.' )) < 6) this.type = 'ios' // Check native smart banner support (iOS 6+)
        }else if(navigator.userAgent.match(/Android/i) != null){
            this.type = 'android'
        }
        
        if(this.type && !standalone && !this.getCookie('sb-closed') && !this.getCookie('sb-installed')){
            var meta = $(this.type=='android' ? 'meta[name="google-play-app"]' : 'meta[name="apple-itunes-app"]').attr('content')
            this.appId = /app-id=([^\s,]+)/.exec(meta)[1]
            
            this.title = this.options.title ? this.options.title : $('title').text().replace(/\s*[|\-·].*$/, '')
            this.author = this.options.author ? this.options.author : window.location.hostname
            
            this.create()
            this.show()
            this.listen()
        }
    }
        
    SmartBanner.prototype = {

        constructor: SmartBanner
    
      , create: function() {
            var iconURL
              , link=(this.type=='android' ? 'https://play.google.com/store/apps/details?id=' : 'https://itunes.apple.com/nl/app/myradio/id') + this.appId
              , inStore=this.options.price ? this.options.price + ' - ' + (this.type=='android' ? this.options.inGooglePlay : this.options.inAppStore) + ' <span class="sb-arrow">&rsaquo;</span>' : ''
              , gloss=this.options.iconGloss === null ? (this.type=='ios') : this.options.iconGloss

            $('body').append('<div id="smartbanner" class="'+this.type+'"><a href="#" class="sb-close">&times;</a><span class="sb-icon"></span><div class="sb-info"><strong>'+this.title+'</strong><span>'+this.author+'</span><span>'+inStore+'</span></div><a href="'+link+'" class="sb-button"><span>'+this.options.button+'</span></a></div>')
            
            if(this.options.icon){
                iconURL = this.options.icon
            }else if($('link[rel="apple-touch-icon-precomposed"]').length > 0){
                iconURL = $('link[rel="apple-touch-icon-precomposed"]').attr('href')
                if (this.options.iconGloss === null) gloss = false
            }else if($('link[rel="apple-touch-icon"]').length > 0){
                iconURL = $('link[rel="apple-touch-icon"]').attr('href')
            }
            if(iconURL){
                $('#smartbanner .sb-icon').css('background-image','url('+iconURL+')')
                if (gloss) $('#smartbanner .sb-icon').addClass('gloss')
            }else{
                $('#smartbanner').addClass('no-icon')
            }
        }
        
      , listen: function () {
            $('#smartbanner .sb-close').on('click',$.proxy(this.close, this))
            $('#smartbanner .sb-button').on('click',$.proxy(this.install, this))
        }
        
      , show: function() {
            $('#smartbanner').stop().animate({top:0},this.options.speedIn).addClass('shown')
            $('html').animate({marginTop:this.origHtmlMargin+this.bannerHeight},this.options.speedIn)
        }
        
      , hide: function() {
            $('#smartbanner').stop().animate({top:-82},this.options.speedOut).removeClass('shown')
            $('html').animate({marginTop:this.origHtmlMargin},this.options.speedOut)
        }
      
      , close: function(e) {
            e.preventDefault()
            this.hide()
            this.setCookie('sb-closed','true',this.options.daysHidden)
        }
       
      , install: function(e) {
            this.hide()
            this.setCookie('sb-installed','true',this.options.daysReminder)
        }
       
      , setCookie: function(name, value, exdays) {
            var exdate = new Date()
            exdate.setDate(exdate.getDate()+exdays)
            value=escape(value)+((exdays==null)?'':'; expires='+exdate.toUTCString())
            document.cookie=name+'='+value+'; path=/;'
        }
        
      , getCookie: function(name) {
            var i,x,y,ARRcookies = document.cookie.split(";")
            for(i=0;i<ARRcookies.length;i++){
                x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="))
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1)
                x = x.replace(/^\s+|\s+$/g,"")
                if(x==name){
                    return unescape(y)
                }
            }
            return null
        } 
    }

    $.fn.smartbanner = function(option) {
        var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new SmartBanner(options)))
      if (typeof option == 'string') data[option]()
    }
    
    // override these globally if you like (they are all optional)
    $.fn.smartbanner.defaults = {
        title: null, // What the title of the app should be in the banner (defaults to apple-touch-icon)
        author: null, // What the author of the app should be in the banner (defaults to domain name)
        price: 'Free', // Price of the app
        inAppStore: 'In de App Store', // Text of price for iOS
        inGooglePlay: 'In Google Play', // Text of price for Android
        icon: null, // The URL of the icon (defaults to <link>)
        iconGloss: null, // Force gloss effect for iOS even for precomposed
        button: 'VIEW',
        speedIn: 300, // Show animation speed of the banner
        speedOut: 400, // Close animation speed of the banner
        daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
        daysReminder: 90, // Duration to hide the banner after "VIEW" is clicked *separate from when the close button is clicked* (0 = always show banner)
        force: null // Choose 'ios' or 'android'. Don't do a browser check, just always show this banner
    }
    
    $.fn.smartbanner.Constructor = SmartBanner

}(window.jQuery);