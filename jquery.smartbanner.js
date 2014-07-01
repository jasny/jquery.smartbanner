/*!
 * jQuery Smart Banner
 * Copyright (c) 2012 Arnold Daniels <arnold@jasny.net>
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * Based on 'jQuery Smart Web App Banner' by Kurt Zenisek @ kzeni.com
 */
!function ($) {
    var SmartBanner = function (options) {
        var options = $.extend({}, $.smartbanner.defaults, options);
        
        this.os = options.force || this.detectOS();
        
        // Don't show banner if device OS isn't supported, website is loaded in app or user dismissed banner
        if (!options.force && (
            !this.os || this.hasNativeSupport() || (!options.showInUIWebView && this.isUIWebView())
            || getCookie('sb-closed') || getCookie('sb-installed')
        )) {
            return;
        }

        // Get info from meta data
        this.options = $.extend(options, this.getMeta(), options[this.os]);
        
        if (!this.options.appId) return;
        
        // Calculate scale
        this.scale = this.options.scale === 'auto' ? $(window).width() / window.screen.width : this.options.scale
        if (this.scale < 1) this.scale = 1;

        if (!this.options.title) this.options.title = $('title').text().replace(/\s*[|\-·].*$/, '');
        if (!this.options.author) this.options.author =
            ($('meta[name="author"]').length ? $('meta[name="author"]').attr('content') : window.location.hostname);

        // Create banner
        this.create();
        this.listen();
        this.show();
    }

    SmartBanner.prototype.constructor = SmartBanner;

    // Detect the operation system
    SmartBanner.prototype.detectOS = function() {
        var UA = navigator.userAgent;
        
        if (UA.match(/iPhone|iPod/i) || (UA.match(/iPad/i) && this.options.iOSUniversalApp)) {
            return 'ios';
        } else if (UA.match(/\bSilk\/(.*\bMobile Safari\b)?/) || UA.match(/\bKF\w/) || UA.match('Kindle Fire')) {
            return 'kindle';
        } else if (UA.match(/Android/i)) {
            return 'android';
        } else if (UA.match(/Windows Phone 8.0|Windows Phone OS|XBLWP7|ZuneWP7/i)) {
            return 'windows';
        }
        
        return null;
    }

    // Check native smart banner support (iOS 6+)
    SmartBanner.prototype.hasNativeSupport = function() {
        var UA = navigator.userAgent;
        
        return UA.match(/iPhone|iPod|iPad/i) && UA.match(/Safari/i) && !UA.match(/CriOS/i) &&
            Number(UA.substr(UA.indexOf('OS ') + 3, 3).replace('_', '.')) >= 6;
    }

    // Check if it's already a standalone web app or running within a webui view of an app (not mobile safari)
    SmartBanner.prototype.isUIWebView = function () {
        var UA = navigator.userAgent;
        return navigator.standalone || (UA.match(/iPhone|iPod|iPad/i) && !UA.match(/Safari/i));
    }
    
    // Get meta data
    SmartBanner.prototype.getMeta = function() {
        var selector;
        var regex = /([\w-]+)=([^,]+)/gi;
        var content;
        var meta = {};
        var match;
        
        switch (this.os) {
            case 'ios':     selector = 'meta[name="apple-itunes-app"]'; break;
            case 'android': selector = 'meta[name="google-play-app"]'; break;
            case 'kindle':  selector = 'meta[name="kindle-fire-app"]'; break;
            case 'windows': return this.getWindowsMeta();
        }
        
        content = $(selector).attr('content');
        
        while ((match = regex.exec(content))) {
            meta[camelCase(match[1])] = match[2];
        }
        
        $.extend(meta, $(selector).data());
        return meta;
    }
    
    SmartBanner.prototype.getWindowsMeta = function() {
        var meta = {};
        
        meta.appId = $('meta[name="msApplication-ID"]').attr('content');
        meta.appPfn = $('meta[name="msApplication-PackageFamilyName"]').attr('content');
        
        $.extend(meta, $('meta[name="msApplication-ID"]').data());
        return meta;
    }

    // Get application URL
    SmartBanner.prototype.getUrl = function () {
        if (this.options.url) return this.options.url;
        
        switch (this.os) {
            case 'ios':     return 'itmss://itunes.apple.com/' + this.options.language + '/app/id' + this.appId;
            case 'android': return 'market://details?id=' + this.options.appId;
            case 'kindle':  return 'amzn://apps/android?asin=' + this.options.appId;
            case 'windows': return 'ms-windows-store:PDP?PFN=' + this.options.appPfn;
        }
    }
    
    // Get the URL to the icon
    SmartBanner.prototype.getIconUrl = function() {
        var url;
        
        if (this.options.icon) return this.options.icon;
        
        switch (this.os) {
            case 'android':
            case 'kindle':
                url = $('link[rel="shortcut icon"][sizes="128x128"]').attr('href');
            case 'ios':
                if (!url) url = $('link[rel="apple-touch-icon-precomposed"]').attr('href');
                if (!url) url = $('link[rel="apple-touch-icon"]').attr('href');
                break;
                
            case 'windows':
                url = $('meta[name="msApplication-TileImage"], meta[name="msapplication-TileImage"]').att('content');
                break;
        }
        
        return url;
    }
    
    // Check if icon should have gloss effect
    SmartBanner.prototype.getIconGloss = function () {
        if (this.options.iconGloss !== null) return this.options.iconGloss;
        return this.os === 'ios' && $('link[rel="apple-touch-icon-precomposed"]').length > 0;
    }
    
    
    // Create the smartbanner element
    SmartBanner.prototype.create = function() {
        var iconURL = this.getIconUrl();
        var url = this.getUrl();
        var inStore = this.options.price ? this.options.price + (this.options.priceText ? ' - ' + this.options.priceText : '') : '';
        
        var banner = $('<div id="smartbanner">').attr('class', this.os)
            .append($('<div class="sb-container">')
                .append('<a href="#" class="sb-close">&times;</a>')
                .append($('<span class="sb-icon"></span>'))
                .append($('<div class="sb-info">')
                    .append($('<strong>').text(this.options.title))
                    .append($('<span>').text(this.options.author))
                    .append($('<span>').text(inStore))
                )
                .append($('<a class="sb-button">').attr('href', url)
                    .append($('<span>').text(this.options.button))
                )
            );
            
        $('body').prepend(banner);

        if (iconURL) {
            $('#smartbanner .sb-icon').css('background-image','url('+iconURL+')');
            if (this.options.iconGloss) $('#smartbanner .sb-icon').addClass('sb-gloss');
        } else{
            $('#smartbanner').addClass('no-icon');
        }

        this.bannerHeight = $('#smartbanner').outerHeight() + 2;

        if (this.scale > 1) {
            $('#smartbanner')
                .css('height', parseFloat($('#smartbanner').css('height')) * this.scale)
                .hide();
            $('#smartbanner .sb-container')
                .css('-webkit-transform', 'scale('+this.scale+')')
                .css('-msie-transform', 'scale('+this.scale+')')
                .css('-moz-transform', 'scale('+this.scale+')')
                .css('width', $(window).width() / this.scale);
        }
    }
    
    // Listen for click events
    SmartBanner.prototype.listen = function () {
        $('#smartbanner .sb-close').on('click', $.proxy(this.close, this));
        $('#smartbanner .sb-button').on('click', $.proxy(this.install, this));
    }
    
    // Show smartbanner
    SmartBanner.prototype.show = function() {
        var banner = $('#smartbanner');
        var speed = parseFloat(banner.css('transition-duration')) * 1000;

        banner.stop();
        
        if ($.support.transition) {
            banner
                .one($.support.transition.end, function() { 
                    banner.addClass('shown').removeClass('showing');
                })
                .emulateTransitionEnd(speed)
                .addClass('showing');
        } else {
            banner.animate({height: '78' * this.scale}, { duration: speed, easing: 'swing' }).addClass('shown');
        }
    }
    
    // Hide smartbanner
    SmartBanner.prototype.hide = function() {
        var banner = $('#smartbanner');
        var speed = parseFloat(banner.css('transition-duration')) * 1000;

        banner.stop();
        
        if ($.support.transition) {
            banner
                .one($.support.transition.end, function() {
                    $('#smartbanner').remove();
                })
                .emulateTransitionEnd(speed)
                .removeClass('shown');
        } else {
            banner.animate({height: 0}, { duration: speed, easing: 'swing' }).removeClass('shown');
        }
    }

    // Destroy the smartbanner
    SmartBanner.prototype.destroy = function() {
        $(document).one('hidden.smartbanner', $.proxy(function () {
            $('#smartbanner').remove();
            $(window).removeData('smartbanner');
        }, this));
        
        this.hide();
    }

    // Close event handler
    SmartBanner.prototype.close = function(e) {
        e.preventDefault();
        this.hide();
        setCookie('sb-closed', 'true', this.options.daysHidden);
    }
    
    // Install event handler
    SmartBanner.prototype.install = function(e) {
        if (this.options.hideOnInstall) this.hide();
        setCookie('sb-installed', 'true', this.options.daysReminder);
    }
       

    // Camelcase a string
    function camelCase(input) { 
        return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    }

    // Set a cookie
    function setCookie(name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        value = encodeURI(value) + ((typeof exdays === 'undefined') ? '' : '; expires=' + exdate.toUTCString());
        document.cookie = name + '=' + value + '; path=/;';
    }

    // Get a cookie
    function getCookie(name) {
        var i,x,y,ARRcookies = document.cookie.split(";");
        
        for (i=0;i<ARRcookies.length;i++) {
            x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x = x.replace(/^\s+|\s+$/g,"");
            if (x === name) return decodeURI(y);
        }
        return null;
    }
    
    
    $.smartbanner = function (option) {
        var $window = $(window);
        var data = $window.data('smartbanner');
        var options = typeof option === 'object' && option;
        
        if (!data) $window.data('smartbanner', (data = new SmartBanner(options)));
        if (typeof option === 'string') return data[option];
    }

    // override these globally if you like (they are all optional)
    $.smartbanner.defaults = {
        title: null, // What the title of the app should be in the banner (defaults to <title>)
        author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
        language: 'us', // Language code (used for App Store)
        url: null, // The URL for the button. Keep null if you want the button to link to the app store.
        icon: null, // The URL of the icon
        iconGloss: null, // Force gloss effect
        button: 'VIEW', // Text for the install button
        scale: 'auto', // Scale based on viewport size (set to 1 to disable)
        daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
        daysReminder: 90, // Duration to hide the banner after "VIEW" is clicked *separate from when the close button is clicked* (0 = always show banner)
        hideOnInstall: true, // Hide the banner after "VIEW" is clicked.

        // All of the options above can also be configured for each OS type
        
        ios: {
            price: 'FREE', // Price of the app
            priceText: 'On the App Store', // Text of price for iOS
            universalApp: true // If the iOS App is a universal app for both iPad and iPhone, display Smart Banner to iPad users, too.
        },
        android: {
            price: 'FREE', // Price of the app
            priceText: 'In Google Play', // Text of price for Android
            params: null // Aditional parameters for the market
        },
        kindle: {
            price: 'FREE', // Price of the app
            priceText: 'In the Amazon Appstore'
        },
        windows: {
            price: 'FREE', // Price of the app
            priceText: 'In the Windows Store' // Text of price for Windows
        },
        
        force: null // Choose 'ios', 'android' or 'windows'. Don't do a browser check, just always show this banner
    }
    
    $.smartbanner.Constructor = SmartBanner;
}(window.jQuery);

/*!
 * Bootstrap transition
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
!function ($) {
    function transitionEnd() {
        var el = document.createElement('smartbanner');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {end: transEndEventNames[name]};
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    if (typeof $.support.transition !== 'undefined')
        return;  // Prevent conflict with Twitter Bootstrap

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false, $el = this
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end);
        }
        setTimeout(callback, duration);
        return this;
    }

    $.support.transition = transitionEnd();
}(window.jQuery);
