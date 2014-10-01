jQuery Ultimate Smart Banner
============================


[Smart Banners][1] are a new feature in iOS 6 to promote apps on the App Store from a website. This jQuery plugin
brings this feature to older iOS versions, Android devices and for Windows Store apps.

Ultimate Smart Banner is a fork of [jasny / jquery.smartbanner][2]. His integration is actually totally compatible with the original branch.

The differences with the original branch are :
- Differencing the applications to Apple Iphone And Apple Ipad formats
- Differencing the applications to Android Phones And Android Tablets formats
- Support Windows Phone
- Support Windows RT
- Animations of the banner with CSS

## Usage ##
The script "Ultimate Smart Banner" use "meta tags" for configuring the banner display.

```html

    <html>
      <head>
        <title>YouTube</title>

        <meta name="author" content="Twitter, Inc">
        <meta name="apple-itunes-app" content="app-id=333903271">
        <meta name="apple-itunes-app-tab" content="app-id=333903271">
        <meta name="google-play-app" content="app-id=com.twitter.android">
        <meta name="google-play-app-tab" content="app-id=com.twitter.android">
        <meta name="msApplication-ID" content="App" />
        <meta name="msApplication-TileImage" content="http://wscont1.apps.microsoft.com/winstore/1x/107a0080-d451-4367-bee0-ccbb49465360/Icon.102051.png" /> <!-- From the Windows RT store : http://apps.microsoft.com/windows/fr-fr/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35 -->
        <meta name="msApplication-PackageFamilyName" content="9E2F88E3.Twitter_wgeqdkkx372wm" /> <!-- Windows RT > PackageFamilyName is visible in the source page of the store : http://apps.microsoft.com/windows/fr-fr/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35 -->
        <meta name="msApplication-WinPhonePackageUrl" content="app-id=0b792c7c-14dc-df11-a844-00237de2db9e" /> <!-- Windows Phone > AppId is visible in the URL of the app in the windows phone store -->

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="jquery.ultimate-smartbanner.css" type="text/css" media="screen">
        <link rel="apple-touch-icon" href="apple-touch-icon.png">
      </head>
      <body>
        ...
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
        <script src="jquery.ultimate-smartbanner.js"></script>
        <script type="text/javascript">
          // Read the 'Options' section for know more about the details configuration.
          $(function() { $.smartbanner(options) } )
        </script>
      </body>
    </html>

```

## Options ##
Bellow, you can see the default options.

```javascript

    $.smartbanner({
        //Smart Banner default config :
        title: null, // What the title of the app should be in the banner (defaults to <title>)
        author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
        price: 'FREE', // Price of the app
        priceText: 'On the store', // Text of price for store
        icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
        button: 'View in Store', // Text for the install button
        appStoreLanguage: 'us', // Language code for iOS App Store
    
        // Deprecated - replaced by 'priceText' and 'Device Configuration Specific' section :
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
    
        // Device Configuration Specific - Use JSON datas who will surcharge the original datas :
        iphoneConfig: null,
        ipadConfig: null,
        androidConfig: null,
        androidTabsConfig: null,
        windowsPhoneConfig: null,
        windowsRtConfig: null
    })
    
```

## Call Sample ##

In this sample the default configuration display a Banner for download the 'Le Figaro' french news paper app. 
But for the iPhones and Android mobile phones, the Banner offers to download 'le Madame Figaro' fashion news paper app.
And for finish, for the iPads and Android tablets, she offers to download 'i-mad', the  digital magazine of 'le Madame Figaro' fashion news paper.

In the head of your web page :

```html
    <meta name="author" content="Twitter, Inc">
    <meta name="apple-itunes-app" content="app-id=399410598">
    <meta name="apple-itunes-app-tab" content="app-id=432482341">
    <meta name="google-play-app" content="app-id=com.milibris.app.LeFigaroMadame">
    <meta name="google-play-app-tab" content="app-id=com.lefigaro.imadandroid">
    <meta name="msApplication-ID" content="App" />
    <meta name="msApplication-TileImage" content="http://wscont1.apps.microsoft.com/winstore/1x/107a0080-d451-4367-bee0-ccbb49465360/Icon.102051.png" /> <!-- From the Windows RT store : http://apps.microsoft.com/windows/fr-fr/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35 -->
    <meta name="msApplication-PackageFamilyName" content="9E2F88E3.Twitter_wgeqdkkx372wm" /> <!-- Windows RT > PackageFamilyName is visible in the source page of the store : http://apps.microsoft.com/windows/fr-fr/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35 -->
    <meta name="msApplication-WinPhonePackageUrl" content="app-id=4789cb2f-14d6-df11-a844-00237de2db9e" /> <!-- Windows Phone > AppId is visible in the URL of the app in the windows phone store -->
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="stylesheet" href="jquery.ultimate-smartbanner.css" type="text/css" media="screen">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
```

In the body of your web page :

```html
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
    <script src="jquery.ultimate-smartbanner.js"></script>
    
    <script type="text/javascript">
    $.smartbanner({
        //Smart Banner default config :
        title: 'le Figaro.fr',
        author: Société du Figaro,
        price: 'FREE',
        icon: 'https://lh6.ggpht.com/LgbxCFAnb8XOqje6n4-feL-dcgD0awQGouHyfbICIEpy33796s8eqVS96sQRdLBLnUs=w300-rw',
        button: 'Download',
        appStoreLanguage: 'fr',
    
        // Technical config :
        daysHidden: 15,
        daysReminder: 90,
    
        // Device Configuration Specific :
        iphoneConfig: {
            title: 'Figaro Madame',
            icon: 'https://lh5.ggpht.com/UtmY5cjFDM5YFQ2QJJjYj51zJ2WQ_V1QAHCIbGQBFe7wZkEbM9YIAx17tdOaKFGs96Y=w300-rw',
        },
        ipadConfig: {
           title: 'i-mad',
           icon: 'https://lh5.ggpht.com/yNZRuzfM464vReZYy-9ArJPKaloXctGb9RLMJbAmHl4Ah9EDU20H1unOeRevVDeL_qWT=w300-rw',
       },
        androidConfig: {
            title: 'Figaro Madame',
            icon: 'https://lh5.ggpht.com/UtmY5cjFDM5YFQ2QJJjYj51zJ2WQ_V1QAHCIbGQBFe7wZkEbM9YIAx17tdOaKFGs96Y=w300-rw',
        },
        androidTabsConfig: {
           title: 'i-mad',
           icon: 'https://lh5.ggpht.com/yNZRuzfM464vReZYy-9ArJPKaloXctGb9RLMJbAmHl4Ah9EDU20H1unOeRevVDeL_qWT=w300-rw',
       }
    })
    </script>
```

  [1]: http://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/PromotingAppswithAppBanners/PromotingAppswithAppBanners.html
  [2]: https://github.com/jasny/jquery.smartbanner
