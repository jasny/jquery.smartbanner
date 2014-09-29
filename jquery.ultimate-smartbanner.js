/*!
 * jQuery Smart Banner
 * Copyright (c) 2014 Nicolas KOKLA
 * Forked from the Copyrighted project 'jquery.smartbanner' [Copyright (c) 2012 Arnold Daniels <arnold@jasny.net>]
 * Based on 'jQuery Smart Web App Banner' by Kurt Zenisek @ kzeni.com
 */
!function ($) {
  var SmartBanner = function (options) {
    this.origHtmlMargin = parseFloat($('html').css('margin-top')) // Get the original margin-top of the HTML element so we can take that into account
    this.options = $.extend({}, $.smartbanner.defaults, options)

    var standalone = navigator.standalone; // Check if it's already a standalone web app or running within a webui view of an app (not mobile safari)

    // Detect banner type (iOS, Android, Windows Phone or Windows RT)
    if (this.options.force) {
      this.type = this.options.force
    } else if (navigator.userAgent.match(/iPad|iPhone|iPod/i) != null && navigator.userAgent.match(/Safari/i) != null) {
      if (
        (window.Number(navigator.userAgent.substr(navigator.userAgent.indexOf('OS ') + 3, 3).replace('_', '.')) < 6)
        || navigator.userAgent.match(/Version/i) == null
      )
        this.type = 'ios'; // Check webview and native smart banner support (iOS 6+)
    } else if (navigator.userAgent.match(/Android/i) != null) {
      this.type = 'android'
    } else if (navigator.userAgent.match(/Windows NT 6.2/i) != null) {
      this.type = 'windows'
    } else if (navigator.userAgent.match(/Windows Phone/i) != null) {
      this.type = 'windows-phone'
    }

    // Don't show banner if device isn't iOS or Android, website is loaded in app or user dismissed banner
    if (!this.type || standalone || this.getCookie('sb-closed') || this.getCookie('sb-installed')) {
      return
    }

    // Calculate scale
    this.scale = this.options.scale == 'auto' ? $(window).width() / window.screen.width : this.options.scale;
    if (this.scale < 1) this.scale = 1;

    // Get info from meta data
    var metaString, metaTrackingString;
    switch(this.type) {
      case 'windows':
        metaString = 'meta[name="msApplication-ID"]';
        metaTrackingString = 'meta[name="ms-store-rt-tracking"]';
        break;
      case 'windows-phone':
        metaString = 'meta[name="msApplication-WinPhonePackageUrl"]';
        metaTrackingString = 'meta[name="ms-store-phone-tracking"]';
        break;
      case 'android':
        metaString = 'meta[name="google-play-app"]';
        metaTrackingString = 'meta[name="google-play-app-tracking"]';
        break;
      case 'ios':
        metaString = 'meta[name="apple-itunes-app"]';
        metaTrackingString = 'meta[name="apple-itunes-app-tracking"]';
        break;
    }
    var meta = $(metaString);
    var metaTracking = $(metaTrackingString);

    if (meta.length == 0) return;
    if (metaTracking.length == 0) metaTracking = $('<meta name="" content="" />');

    // For Windows Store apps, get the PackageFamilyName for protocol launch
    if (this.type == 'windows') {
      this.pfn = $('meta[name="msApplication-PackageFamilyName"]').attr('content');
      this.appId = meta.attr('content')[1];
    } else if (this.type == 'windows-phone') {
      this.appId = meta.attr('content')
    } else {
      this.appId = /app-id=([^\s,]+)/.exec(meta.attr('content'))[1]
    }

    // Get Tracking URL :
    this.appTracking = metaTracking.attr('content');

    this.title = this.options.title ? this.options.title : $('title').text().replace(/\s*[|\-·].*$/, '');
    this.author = this.options.author ? this.options.author : ($('meta[name="author"]').length ? $('meta[name="author"]').attr('content') : window.location.hostname);

    // Create banner
    this.create();
    this.show();
    this.listen();
  }

  SmartBanner.prototype = {

    constructor: SmartBanner

    , create: function () {
      var iconURL, link
        , inStore = this.options.price ? '<span class="sb-price">'+ this.options.price + '</span> ' + (this.type == 'android' ? this.options.inGooglePlay : this.type == 'ios' ? this.options.inAppStore : this.options.inWindowsStore) : ''
        , gloss = this.options.iconGloss;

      if(this.appTracking == "") {
        switch(this.type){
          case('windows'):
            link = 'ms-windows-store:PDP?PFN=' + this.pfn;
            break;
          case('windows-phone'):
            link = 'http://windowsphone.com/s?appId='+this.appId;
            break;
          case('android'):
            link = 'market://details?id=' + this.appId;
            break;
          case('ios'):
            link = 'https://itunes.apple.com/' + this.options.appStoreLanguage + '/app/id' + this.appId;
            break;
        }
      } else {
        link = this.appTracking;
      }

      var container = this.options.container;
      if($(container).length<1) return;
      $(container).append(
        '<div id="smartbanner" class="' + this.type + '">' +
        '<div class="sb-container">' +
        '<a href="#" class="sb-close">&times;</a><span class="sb-icon"></span>' +
        '<div class="sb-info"><strong>' + this.title + '</strong><span>' + this.author + '</span><span>' + inStore + '</span></div>' +
        '<a href="' + link + '" target="_blank" class="sb-button"><span>' + this.options.button + '</span></a>' +
        '</div>' +
        '</div>'
      );

      var ejqSmartBanner = $('#smartbanner');

      if (this.options.icon) {
        iconURL = this.options.icon
      } else if ($('link[rel="apple-touch-icon-precomposed"]').length > 0) {
        iconURL = $('link[rel="apple-touch-icon-precomposed"]').attr('href');
      } else if ($('link[rel="apple-touch-icon"]').length > 0) {
        iconURL = $('link[rel="apple-touch-icon"]').attr('href');
      } else if ($('meta[name="msApplication-TileImage"]').length > 0) {
        iconURL = $('meta[name="msApplication-TileImage"]').attr('content');
      } else if ($('meta[name="msapplication-TileImage"]').length > 0) { /* redundant because ms docs show two case usages */
        iconURL = $('meta[name="msapplication-TileImage"]').attr('content');
      }
      if (iconURL) {
        var eSbIcon = $('#smartbanner .sb-icon');
        eSbIcon.css('background-image', 'url(' + iconURL + ')');
        if (gloss) eSbIcon.addClass('gloss');
      } else {
        ejqSmartBanner.addClass('no-icon');
      }

      if (this.scale > 1) {
        ejqSmartBanner
          .css('top', parseFloat(ejqSmartBanner.css('top')) * this.scale)
          .css('height', parseFloat(ejqSmartBanner.css('height')) * this.scale);
        $('#smartbanner .sb-container')
          .css('-webkit-transform', 'scale(' + this.scale + ')')
          .css('-msie-transform', 'scale(' + this.scale + ')')
          .css('-moz-transform', 'scale(' + this.scale + ')')
          .css('width', $(window).width() / this.scale)
      }
    }

    , listen: function () {
      $('#smartbanner .sb-close').on('click', $.proxy(this.close, this))
      $('#smartbanner .sb-button').on('click', $.proxy(this.install, this))
    }

    , show: function (callback) {
      var ejqHtml = $('html');
      ejqHtml.get(0).className = ejqHtml.get(0).className+' smartBanner ';
      if(callback)  callback();
    }

    , hide: function (callback) {
      $('html').removeClass('smartBanner');
      if(callback)  callback();
    }

    , close: function (e) {
      e.preventDefault();
      this.hide();
      this.setCookie('sb-closed', 'true', this.options.daysHidden);
    }

    , install: function (e) {
      this.hide();
      this.setCookie('sb-installed', 'true', this.options.daysReminder);
    }

    , setCookie: function (name, value, exdays) {
      var exdate = new Date();
      exdate.setDate(exdate.getDate() + exdays);
      value = encodeURIComponent(value) + ((exdays == null) ? '' : '; expires=' + exdate.toUTCString());
      document.cookie = name + '=' + value + '; path=/;';
    }

    , getCookie: function (name) {
      var i, x, y, ARRcookies = document.cookie.split(";");
      for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == name) {
          return decodeURIComponent(y);
        }
      }
      return null
    }

    // Demo only
    , switchType: function () {
      // Array.indexOf polyfill from mozilla : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
      if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
          if ( this === undefined || this === null ) throw new TypeError( '"this" is null or not defined' );
          var length = this.length >>> 0; // Hack to convert object.length to a UInt32
          fromIndex = +fromIndex || 0;
          if (Math.abs(fromIndex) === Infinity) fromIndex = 0;
          if (fromIndex < 0) {  fromIndex += length;  if (fromIndex < 0)  fromIndex = 0;  }
          for (;fromIndex < length; fromIndex++)  if (this[fromIndex] === searchElement)  return fromIndex;
          return -1;
        };
      }

      this.hide(function () {
        var that = this;
        var a_format = ['ios', 'android', 'windows', 'windows-phone'];

        //that.type = that.type == 'android' ? 'ios' : 'android';
        var newIndex = a_format.indexOf(that.type)+1;
        that.type = (!a_format[newIndex]) ? a_format[0] : a_format[newIndex];
        var meta = $(that.type == 'android' ? 'meta[name="google-play-app"]' : 'meta[name="apple-itunes-app"]').attr('content');
        that.appId = /app-id=([^\s,]+)/.exec(meta)[1];

        $('#smartbanner').detach();
        that.create();
        that.show();
        if(window.console && console.log) console.log(that.type);
      })
    }
  };

  $.smartbanner = function (option) {
    var $window = $(window)
      , data = $window.data('typeahead')
      , options = typeof option == 'object' && option;
    if (!data) $window.data('typeahead', (data = new SmartBanner(options)));
    if (typeof option == 'string') data[option]();
  };

  // override these globally if you like (they are all optional)
  $.smartbanner.defaults = {
    //Smart Banner default config :
    title: null, // What the title of the app should be in the banner (defaults to <title>)
    author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
    price: 'FREE', // Price of the app
    priceText: 'On the store', // Text of price for store
    icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
    button: 'View in Store', // Text for the install button
    appStoreLanguage: 'us', // Language code for App Store

    // Deprecated - replaced by 'priceText' and 'Device Config' section :
    inAppStore: 'On the App Store', // Text of price for iOS - iPhone
    inGooglePlay: 'In Google Play', // Text of price for Android Phone
    inWindowsStore: 'In the Windows Store', //Text of price for Windows Phone
    iconGloss: null, // Force gloss CSS effect for iOS even for precomposed

    // Technical config :
    daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
    daysReminder: 90, // Duration to hide the banner after "VIEW" is clicked *separate from when the close button is clicked* (0 = always show banner)
    scale: 'auto', // Scale based on viewport size (set to 1 to disable)
    container: 'body', // Container where the banner will be injected
    force: null, // Choose 'ios', 'android' or 'windows'. Don't do a browser check, just always show this banner

    // Device Config - Use JSON similar to the 'defaultDeviceConfig' variable :
    iphoneConfig: null,
    ipadConfig: null,
    androidConfig: null,
    androidTabsConfig: null,
    windowsPhoneConfig: null,
    windowsRtConfig: null
  };

  var defaultDeviceConfig = {
    title: null, // What the title of the app should be in the banner (defaults to <title>)
    author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
    price: 'FREE', // Price of the app
    icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
    button: 'View in Store', // Text for the install button
    storeLanguage: 'us' // Language code for App Store
  };

  $.smartbanner.Constructor = SmartBanner;

}(window.jQuery);
