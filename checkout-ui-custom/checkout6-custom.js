// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE. THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.

// BEGIN PLUGIN WE.DIGI HOUSE GOOGLE TAG MANAGER INTEGRATION
var ga4ClientID = '';

$(window).on('orderFormUpdated.vtex', function(evt, orderForm) {

  wdhGoogleTagManagerEnhanced.syncGA4ClientIDOnOrderForm(evt, orderForm);

});
const wdhGoogleTagManagerEnhanced = {

  settings : {
      gtmId : '',
      transportURL: '',
      gtmscript_url: '',
      ga4MeasurementID: '',
  },
  init: function() {
    console.log('Google Tag Manager Enhanced Init - v.1.1.0 - 03/01/25 16:27...');
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
        this.settings.ga4MeasurementID = json.ga4PropertyId;
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
  },
  syncGA4ClientIDOnOrderForm: function(evt, orderForm) {

    var orderFormID = orderForm.orderFormId;

    var cookie = {};
    document.cookie.split(';').forEach(function(el) {
        var splitCookie = el.split('=');
        var key = splitCookie[0].trim();
        var value = splitCookie[1];
        cookie[key] = value;
    });
    ga4ClientID = cookie["_ga"].substring(6);

    const formatedGtmID = this.settings.ga4MeasurementID.replace('G-','');
    const cookieKey = '_ga_' + formatedGtmID;
    const gaCookieValue = cookie[cookieKey];

    console.log('Trasty Data: GA4 Client ID - ', ga4ClientID);
    console.log('Trasty Data: GA4 Cookie Session - ', gaCookieValue);

    if (ga4ClientID)
    {
        var orderFormAppPayload = {
          'ga4clientid':  ga4ClientID,
          'ga4sessionid':  gaCookieValue
        };

        fetch('/api/checkout/pub/orderForm/' + orderFormID + '/customData/trasty-data', {
            "method": "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderFormAppPayload)
            })
            .then(response => {
                console.log(response);
            })
            .catch(err => {
                console.error(err);
            });
    }
  }
};
wdhGoogleTagManagerEnhanced.init();
// END PLUGIN WE.DIGI HOUSE GOOGLE TAG MANAGER INTEGRATION
