// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE. THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.

// BEGIN PLUGIN WE.DIGI HOUSE RD STATION CHECKOUT INTEGRATION
console.log("checkout custom google tag manager enhanced init - v.1.0.0 - 14/05/24 21:52");

const wdhGoogleTagManagerEnhanced = {

  settings : {
      gtmId : '',
      transportURL: '',
      gtmscript_url: ''
  },
  init: function() {
    console.log('Google Tag Manager Enhanced Init...');
    this.setupLoadAppSettings();
  },
  setupLoadAppSettings : function ()
  {
    fetch('/_v/settings')
    .then(response => response.json())
    .then((json) => {
        console.log(json);
        this.settings.gtmId = json.gtmId;
        this.settings.transportURL = json.transportUrl;
        this.setupBuildGTMScriptURL();
        this.setupScriptInjection();
    })
    .catch(function(error) {
      console.log(error);
    });
  },
  setupBuildGTMScriptURL: function() {
    this.settings.gtmscript_url = 'https://' + this.settings.transportURL + '/gtm.js?id=' + this.settings.gtmId;
  },
  setupScriptInjection: function ()
  {
    window.dataLayer = window.dataLayer || [];
    (function(w,d,s,l,i,tu){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://' + tu + '/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',this.settings.gtmId,  this.settings.transportURL)
  }
};
wdhGoogleTagManagerEnhanced.init();
// END PLUGIN WE.DIGI HOUSE GOOGLE TAG MANAGER ENHANCED
