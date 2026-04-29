// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE. THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.

(function () {
  var sessionStorageKey = '__pixel_session_id__'

  function safeParseUrl(url) {
    if (!url) return null

    try {
      return new URL(url, window.location.href)
    } catch (error) {
      return null
    }
  }

  function getReferrerInfo(referrerUrl) {
    var referrerHost = referrerUrl && referrerUrl.hostname ? referrerUrl.hostname.replace(/^www\./, '') : ''

    return {
      url: document.referrer || null,
      host: referrerHost || null,
    }
  }

  function detectDeviceType() {
    var userAgent = navigator.userAgent || ''
    var hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window

    if (/tablet|ipad/i.test(userAgent) || (hasTouch && window.innerWidth >= 768 && window.innerWidth <= 1366)) {
      return 'tablet'
    }

    if (/mobi|android|iphone|ipod/i.test(userAgent) || (hasTouch && window.innerWidth < 768)) {
      return 'mobile'
    }

    return 'desktop'
  }

  function generateSessionId() {
    return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
  }

  function getSessionId() {
    try {
      var existingSessionId = window.sessionStorage.getItem(sessionStorageKey)
      if (existingSessionId) return existingSessionId

      var nextSessionId = generateSessionId()
      window.sessionStorage.setItem(sessionStorageKey, nextSessionId)
      return nextSessionId
    } catch (error) {
      return generateSessionId()
    }
  }

  function buildNavigationPayload() {
    var currentUrl = new URL(window.location.href)
    var referrerUrl = safeParseUrl(document.referrer)
    var searchParams = currentUrl.searchParams
    var referrerInfo = getReferrerInfo(referrerUrl)
    var navEntry = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    var userAgentData = navigator.userAgentData || null

    return {
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      context: 'checkout',
      page: {
        title: document.title || null,
        url: currentUrl.href,
        host: currentUrl.hostname || null,
        path: currentUrl.pathname,
        query: currentUrl.search || null,
        hash: currentUrl.hash || null,
      },
      acquisition: {
        referrer: referrerInfo.url,
        referrerHost: referrerInfo.host,
        landingParams: {
          utm_source: searchParams.get('utm_source'),
          utm_medium: searchParams.get('utm_medium'),
          utm_campaign: searchParams.get('utm_campaign'),
          utm_id: searchParams.get('utm_id'),
          utm_term: searchParams.get('utm_term'),
          utm_content: searchParams.get('utm_content'),
          gclid: searchParams.get('gclid'),
          fbclid: searchParams.get('fbclid'),
          msclkid: searchParams.get('msclkid'),
          ttclid: searchParams.get('ttclid'),
          twclid: searchParams.get('twclid'),
        },
      },
      device: {
        type: detectDeviceType(),
        platform: navigator.platform || null,
        vendor: navigator.vendor || null,
        userAgent: navigator.userAgent || null,
        userAgentData: userAgentData ? {
          mobile: userAgentData.mobile,
          brands: userAgentData.brands || null,
          platform: userAgentData.platform || null,
        } : null,
        language: navigator.language || null,
        languages: navigator.languages || null,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || null,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory || null,
      },
      screen: {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        layoutWidth: document.documentElement.clientWidth,
        layoutHeight: document.documentElement.clientHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        availableWidth: window.screen.availWidth,
        availableHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: window.screen.orientation ? window.screen.orientation.type : null,
      },
      browser: {
        online: navigator.onLine,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        historyLength: window.history.length,
        documentVisibility: document.visibilityState,
        navigationType: navEntry ? navEntry.type : null,
        redirectCount: navEntry ? navEntry.redirectCount : null,
      },
      network: connection ? {
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
        saveData: connection.saveData || false,
      } : null,
    }
  }

  try {
    window.__pixelNavigationPayload__ = buildNavigationPayload()
  } catch (error) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Pixel] Failed to build checkout navigation payload.', error)
    }
  }
})()

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
    console.log('Google Tag Manager Enhanced Init - v.1.1.7');
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

    if (cookie["_ga"]) {
      ga4ClientID = cookie["_ga"].substring(6) || '';
    }
    else {
      ga4ClientID = '---';
    }

    var ga4MeasurementID = typeof this.settings.ga4MeasurementID === 'string'
      ? this.settings.ga4MeasurementID
      : '';
    var formatedGtmID = ga4MeasurementID.replace('G-', '');
    var cookieKey = formatedGtmID ? '_ga_' + formatedGtmID : '';

    var gaCookieValue = '';
    if (cookieKey && cookie[cookieKey])
      gaCookieValue = (cookie[cookieKey]);
    else
      gaCookieValue = '---';

    // --- LÓGICA DO FACEBOOK (_FBP e _FBC) ---
    var fbpValue = cookie['_fbp'] || '---';
    var fbcValue = cookie['_fbc'] || '---';

    console.log('Trasty Data: GA4 Client ID - ', ga4ClientID);
    console.log('Trasty Data: GA4 Cookie Session - ', gaCookieValue);
    console.log('Trasty Data: FBP - ', fbpValue);
    console.log('Trasty Data: FBC - ', fbcValue);


    if (ga4ClientID)
    {
        var orderFormAppPayload = {
          'ga4clientid':  ga4ClientID,
          'ga4sessionid':  gaCookieValue,
          'fbp': fbpValue,
          'fbc': fbcValue
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

// BEGIN TRASTY CHECKOUT INTEGRATION
;(function () {
  'use strict'

  var _apiKey = ''
  var _apiUrl = 'https://pipeline.trasty.io'
  var _trackerUrl = 'https://cdn.trasty.io/tracker/trasty.js'
  var _enableCheckoutTracking = false
  var _readyTimer = null
  var _depsResolved = false
  var _bootstrapStarted = false

  function _log(level) {
    var args = Array.prototype.slice.call(arguments, 1)
    if (typeof console !== 'undefined' && console[level]) {
      console[level].apply(console, ['[Trasty]'].concat(args))
    }
  }

  function _logEvent(name, payload) {
    console.log(
      '%c[Trasty] Evento enviado ✓',
      'color: #7c3aed; font-weight: bold',
      { event: name, payload: payload || null }
    )
  }

  function _getTrastyGlobal() {
    return window.trsty || window.Trasty || window.__trasty || null
  }

  function _normalizeUrl(value, fallback) {
    var url = value || fallback
    try {
      if (/%[0-9A-Fa-f]{2}/.test(url)) url = decodeURIComponent(url)
    } catch (_) {}
    return url
  }

  function _applyConfig(config) {
    if (!config) return
    if (config.apiKey) _apiKey = config.apiKey
    if (config.apiUrl) _apiUrl = config.apiUrl
    if (config.trackerUrl) _trackerUrl = config.trackerUrl
    if (typeof config.enableCheckoutTracking !== 'undefined') {
      _enableCheckoutTracking = config.enableCheckoutTracking === true || config.enableCheckoutTracking === 'true'
    }
  }

  function _persistConfig() {
    try {
      if (_apiKey) localStorage.setItem('trasty:apiKey', _apiKey)
      if (_apiUrl) localStorage.setItem('trasty:apiUrl', _apiUrl)
      localStorage.setItem('trasty:enableCheckoutTracking', _enableCheckoutTracking ? 'true' : 'false')
    } catch (_) {}
  }

  function _startTrackingBootstrap() {
    if (_bootstrapStarted) return
    _bootstrapStarted = true

    _apiUrl = _normalizeUrl(_apiUrl, 'https://pipeline.trasty.io')
    _trackerUrl = _normalizeUrl(_trackerUrl, 'https://cdn.trasty.io/tracker/trasty.js')
    _persistConfig()

    _log('info', 'Checkout script iniciado.', {
      hasApiKey: !!_apiKey,
      enableCheckoutTracking: _enableCheckoutTracking,
      apiUrl: _apiUrl,
      trackerUrl: _trackerUrl,
    })

    if (!_enableCheckoutTracking) {
      _log('info', 'Tracking de checkout desativado por configuração.')
      return
    }

    if (!_apiKey) {
      _log('warn', 'API Key não configurada. Tracking de checkout desativado.')
      return
    }

    window.TrastyConfig = {
      apiKey: _apiKey,
      apiUrl: _apiUrl,
      enableCheckoutTracking: _enableCheckoutTracking
    }

    if (!document.querySelector('script[src*="trasty.io/tracker"]')) {
      var _script = document.createElement('script')
      _script.src = _trackerUrl
      _script.async = false
      document.head.appendChild(_script)

      _script.onload = function () {
        _log('info', 'Tracker do checkout carregado, aguardando API global...')
        _waitForTrackerReady()
      }
      _script.onerror = function () {
        _log('error', 'Falha ao carregar tracker do checkout.', { trackerUrl: _trackerUrl })
      }
    } else {
      _log('info', 'Tracker já presente no checkout, aguardando API global existente.')
      var _checkReady = setInterval(function () {
        if (_getTrastyGlobal()) { clearInterval(_checkReady); _initTracking() }
      }, 100)
      setTimeout(function () { clearInterval(_checkReady) }, 8000)
    }
  }

  try {
    _apiKey    = localStorage.getItem('trasty:apiKey') || ''
    _apiUrl    = localStorage.getItem('trasty:apiUrl') || _apiUrl
    _enableCheckoutTracking = localStorage.getItem('trasty:enableCheckoutTracking') === 'true'
  } catch (_) {}

  if (!_apiKey && window.TrastyConfig) {
    _apiKey  = window.TrastyConfig.apiKey  || ''
    _apiUrl  = window.TrastyConfig.apiUrl  || _apiUrl
  }
  if (window.TrastyConfig && typeof window.TrastyConfig.enableCheckoutTracking !== 'undefined') {
    _enableCheckoutTracking = window.TrastyConfig.enableCheckoutTracking === true
  }

  if (!_apiKey || (!window.TrastyConfig && !_enableCheckoutTracking)) {
    fetch('/_v/settings')
      .then(function (response) { return response.json() })
      .then(function (json) {
        _applyConfig({
          apiKey: json.apiKey,
          apiUrl: json.apiUrl,
          trackerUrl: json.trackerUrl,
          enableCheckoutTracking: json.enableCheckoutTracking
        })
        _startTrackingBootstrap()
      })
      .catch(function () {
        _startTrackingBootstrap()
      })
  } else {
    _startTrackingBootstrap()
  }

  function _waitForTrackerReady() {
    var attempts = 0
    if (_readyTimer) clearInterval(_readyTimer)

    if (_getTrastyGlobal()) {
      _initTracking()
      return
    }

    _readyTimer = setInterval(function () {
      attempts += 1
      if (_getTrastyGlobal()) {
        clearInterval(_readyTimer)
        _readyTimer = null
        _initTracking()
        return
      }

      if (attempts >= 40) {
        clearInterval(_readyTimer)
        _readyTimer = null
        _log('warn', 'Tracker do checkout carregou, mas nenhuma API global ficou disponível.')
      }
    }, 250)
  }

  function _initTracking() {
    var trsty = _getTrastyGlobal()
    if (!trsty) {
      _log('warn', 'Init do checkout abortado: window.trsty indisponível.')
      return
    }
    if (!window.trsty) window.trsty = trsty
    _log('info', 'Init do checkout iniciado.', {
      anonId: trsty.anonId,
      hasJquery: !!window.jQuery,
      hasVtexjs: !!window.vtexjs,
    })

    var T = {
      sentKeys: {},
      eventStats: {},
      errorCooldowns: {},
      lastStep: '',
      stepEnteredAt: 0,
      maxReachedStepRank: 0,
      lastOrderFormId: '',
      orderFormReadySentFor: '',
      lastShippingSignature: '',
      lastPaymentSignature: '',
      lastKnownEmail: '',
      lastKnownName: '',
      lastKnownPhone: '',
      paymentAttemptCounter: 0,
      currentAttemptId: '',
      currentAttemptStartedAt: 0,
      currentAttemptClosed: true,

      getOF: function () {
        return (vtexjs && vtexjs.checkout && vtexjs.checkout.orderForm)
          ? vtexjs.checkout.orderForm
          : null
      },

      currentStep: function () {
        var hash = (location.hash || '').replace('#/', '')
        var path = (location.pathname || '').toLowerCase()
        if (hash === 'email') return 'login'
        if (hash === 'profile') return 'cadastro'
        if (hash === 'shipping') return 'shipping'
        if (hash === 'payment') return 'payment'
        if (hash === 'cart') return 'cart'
        if (hash.indexOf('orderplaced') !== -1 || path.indexOf('orderplaced') !== -1) return 'purchase'
        return hash || 'unknown'
      },

      stepRank: function (step) {
        var map = { cart: 0, login: 1, cadastro: 2, shipping: 3, payment: 4, purchase: 5 }
        return map[step] !== undefined ? map[step] : -1
      },

      hasReachedStep: function (step) {
        return this.maxReachedStepRank >= this.stepRank(step)
      },

      updateReachedStep: function () {
        var rank = this.stepRank(this.currentStep())
        if (rank >= 0 && rank > this.maxReachedStepRank) {
          this.maxReachedStepRank = rank
        }
      },

      createAttemptId: function () {
        return 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
      },

      shouldEmit: function (eventName) {
        var policy = {
          checkout_error: { cooldownMs: 500, maxPerSession: 60 },
        }
        var cfg = policy[eventName]
        if (!cfg) return true

        var now = Date.now()
        var stat = this.eventStats[eventName] || { count: 0, lastAt: 0 }
        if (cfg.maxPerSession && stat.count >= cfg.maxPerSession) return false
        if (cfg.cooldownMs && stat.lastAt && (now - stat.lastAt) < cfg.cooldownMs) return false

        stat.count += 1
        stat.lastAt = now
        this.eventStats[eventName] = stat
        return true
      },

      shouldEmitError: function (sig) {
        var now = Date.now()
        var last = this.errorCooldowns[sig] || 0
        if (now - last < 10000) return false
        this.errorCooldowns[sig] = now
        return true
      },

      getRequestMeta: function (jqxhr, settings, extra) {
        var headers = {}
        var responseHeaders = {}

        try {
          var raw = jqxhr && jqxhr.getAllResponseHeaders ? jqxhr.getAllResponseHeaders() : ''
          String(raw || '').trim().split(/\r?\n/).forEach(function (line) {
            var idx = line.indexOf(':')
            if (idx <= 0) return
            var key = line.slice(0, idx).trim().toLowerCase()
            var value = line.slice(idx + 1).trim()
            responseHeaders[key] = value
          })
        } catch (_) {}

        try {
          headers = (settings && settings.headers) ? settings.headers : {}
        } catch (_) {}

        var requestId =
          responseHeaders['x-request-id'] ||
          responseHeaders['x-vtex-operation-id'] ||
          responseHeaders['x-vtex-trace-id'] ||
          ''

        return Object.assign({
          url: String(settings && settings.url || '').slice(0, 300),
          method: String(settings && (settings.type || settings.method) || 'GET').toUpperCase(),
          status: Number(jqxhr && jqxhr.status || 0),
          request_id: requestId || undefined,
          request_headers: headers,
          response_headers: responseHeaders,
        }, extra || {})
      },

      track: function (eventName, data, dedupeKey) {
        if (!trsty || !eventName) {
          _log('warn', 'Track ignorado: tracker ou eventName ausente.', { eventName: eventName })
          return
        }
        if (!this.shouldEmit(eventName)) {
          _log('info', 'Track suprimido por política de cooldown/limite.', { event: eventName })
          return
        }
        if (dedupeKey) {
          if (this.sentKeys[dedupeKey]) {
            _log('info', 'Track deduplicado.', { event: eventName, dedupeKey: dedupeKey })
            return
          }
          this.sentKeys[dedupeKey] = true
        }
        trsty.track(eventName, data || {})
        _logEvent(eventName, data || {})
      },

      buildCart: function (of) {
        var items = of.items || []
        var discountTotalizer = (of.totalizers || []).find(function (t) { return t.id === 'Discounts' })
        var coupon = of.marketingData && of.marketingData.coupon || undefined

        return {
          items: items.map(function (i) {
            return {
              product_id: String(i.productId || ''),
              sku: String(i.id || ''),
              name: String(i.name || ''),
              quantity: Number(i.quantity || 0),
              unit_price: Number((i.sellingPrice || 0) / 100),
              total_price: Number(((i.sellingPrice || 0) * (i.quantity || 1)) / 100),
            }
          }),
          items_count: items.length,
          total: Number((of.value || 0) / 100),
          discount: discountTotalizer ? Math.abs(discountTotalizer.value / 100) : 0,
          coupon_code: coupon,
        }
      },

      buildCustomer: function (p) {
        p = p || {}
        return {
          email: p.email || null,
          name: [p.firstName, p.lastName].filter(Boolean).join(' ') || null,
          phone: p.phone || p.homePhone || null,
          document: p.document || null,
        }
      },

      getShipping: function (of) {
        return (trsty.adapters && trsty.adapters.vtex)
          ? trsty.adapters.vtex.shippingFromLogistics(of)
          : null
      },

      getPayment: function (of) {
        var paymentData = (of && of.paymentData) || {}
        var selectedPayment = (paymentData.payments || [])[0]
        var systems = paymentData.paymentSystems || []
        var system = null
        var adapterPayment = (trsty.adapters && trsty.adapters.vtex)
          ? trsty.adapters.vtex.paymentFromData(of)
          : null

        if (!selectedPayment) return adapterPayment || null

        for (var i = 0; i < systems.length; i++) {
          var candidate = systems[i]
          if (!candidate) continue
          if (String(candidate.id) === String(selectedPayment.paymentSystem || '') || String(candidate.stringId) === String(selectedPayment.paymentSystem || '')) {
            system = candidate
            break
          }
        }

        var groupName = String(system && system.groupName || '').toLowerCase()
        var systemName = String(system && system.name || selectedPayment.paymentSystemName || '').trim()
        var lowerName = systemName.toLowerCase()
        var paymentType = adapterPayment && adapterPayment.payment_type || 'other'

        if (groupName === 'creditcardpaymentgroup' || groupName.indexOf('creditcard') !== -1) paymentType = 'credit_card'
        else if (groupName === 'debitcardpaymentgroup' || groupName.indexOf('debitcard') !== -1) paymentType = 'debit_card'
        else if (groupName === 'giftcardpaymentgroup') paymentType = 'gift_card'
        else if (lowerName.indexOf('pix') !== -1 || groupName.indexOf('pix') !== -1) paymentType = 'pix'
        else if (lowerName.indexOf('boleto') !== -1 || groupName.indexOf('bankinvoice') !== -1) paymentType = 'boleto'
        else if (lowerName.indexOf('voucher') !== -1 || groupName.indexOf('voucher') !== -1) paymentType = 'voucher'
        else if (lowerName.indexOf('wallet') !== -1 || lowerName.indexOf('pay') !== -1 || groupName.indexOf('wallet') !== -1) paymentType = 'wallet'

        var installments = Number(selectedPayment.installments || adapterPayment && adapterPayment.installments || 1) || 1
        var paymentValue = Number((selectedPayment.value != null ? selectedPayment.value : of && of.value) || 0)
        paymentValue = paymentValue > 999 ? paymentValue / 100 : paymentValue
        var installmentValue = installments > 0 ? paymentValue / installments : paymentValue

        return {
          payment_type: paymentType,
          payment_brand: systemName || adapterPayment && adapterPayment.payment_brand || null,
          installments: installments,
          installment_value: installmentValue || null,
          payment_value: paymentValue || null,
          card_bin: selectedPayment.bin || adapterPayment && adapterPayment.card_bin || null,
          card_last_digits: selectedPayment.lastDigits || selectedPayment.accountId || adapterPayment && adapterPayment.card_last_digits || null,
        }
      },

      getCustomData: function (of) {
        return of && of.customData ? of.customData : null
      },

      rememberIdentity: function (email, name, phone) {
        if (email) this.lastKnownEmail = String(email).trim().toLowerCase()
        if (name) this.lastKnownName = String(name).trim()
        if (phone) this.lastKnownPhone = String(phone).replace(/\D/g, '')

        try {
          if (email) sessionStorage.setItem('_trasty_ck_email', this.lastKnownEmail)
          if (name) sessionStorage.setItem('_trasty_ck_name', this.lastKnownName)
          if (phone) sessionStorage.setItem('_trasty_ck_phone', this.lastKnownPhone)
        } catch (_) {}
      },

      hydrateIdentity: function () {
        try {
          if (!this.lastKnownEmail) this.lastKnownEmail = sessionStorage.getItem('_trasty_ck_email') || ''
          if (!this.lastKnownName) this.lastKnownName = sessionStorage.getItem('_trasty_ck_name') || ''
          if (!this.lastKnownPhone) this.lastKnownPhone = sessionStorage.getItem('_trasty_ck_phone') || ''
        } catch (_) {}
      },

      getSessionEventKey: function (eventName, orderFormId) {
        return '_trasty_ck_evt::' + String(eventName || '') + '::' + String(orderFormId || 'global')
      },

      getSessionData: function (key) {
        try {
          return sessionStorage.getItem(key) || ''
        } catch (_) {
          return ''
        }
      },

      setSessionData: function (key, value) {
        try {
          sessionStorage.setItem(key, String(value || ''))
        } catch (_) {}
      },

      getSessionEventSignature: function (eventName, orderFormId) {
        try {
          return sessionStorage.getItem(this.getSessionEventKey(eventName, orderFormId)) || ''
        } catch (_) {
          return ''
        }
      },

      setSessionEventSignature: function (eventName, orderFormId, signature) {
        try {
          sessionStorage.setItem(this.getSessionEventKey(eventName, orderFormId), String(signature || ''))
        } catch (_) {}
      },

      shouldEmitBySignature: function (eventName, orderFormId, signature) {
        if (!signature) return true
        var prev = this.getSessionEventSignature(eventName, orderFormId)
        if (prev && prev === signature) return false
        this.setSessionEventSignature(eventName, orderFormId, signature)
        return true
      },

      getInterfaceBaselineKey: function (stepKey) {
        return '_trasty_ck_ui_base::' + String(stepKey || 'global')
      },

      loadInterfaceBaseline: function (stepKey) {
        var raw = this.getSessionData(this.getInterfaceBaselineKey(stepKey))
        if (!raw) return {}
        try {
          var parsed = JSON.parse(raw)
          return parsed && typeof parsed === 'object' ? parsed : {}
        } catch (_) {
          return {}
        }
      },

      saveInterfaceBaseline: function (stepKey, baseline) {
        var keys = Object.keys(baseline || {})
        if (keys.length > 50) {
          var trimmed = {}
          for (var i = 0; i < 50; i++) trimmed[keys[i]] = true
          baseline = trimmed
        }
        this.setSessionData(this.getInterfaceBaselineKey(stepKey), JSON.stringify(baseline || {}))
      },

      emitOrderFormReady: function () {
        var of = this.getOF()
        var id = of && of.orderFormId ? String(of.orderFormId) : ''
        if (!id || this.orderFormReadySentFor === id) return
        this.orderFormReadySentFor = id

        this.track('checkout_orderform_ready', {
          orderform_id: id,
          cart: (of.items && of.items.length) ? this.buildCart(of) : undefined,
        }, 'orderform_ready::' + id)
      },

      emitBeginCheckout: function () {
        var of = this.getOF()
        if (!of || !(of.items && of.items.length)) return
        var id = of.orderFormId || ''
        var cart = this.buildCart(of)
        var signature = JSON.stringify({
          items: cart.items.map(function (i) { return [i.sku, i.quantity, i.unit_price] }),
          total: cart.total,
          coupon: cart.coupon_code || '',
        })
        if (!this.shouldEmitBySignature('begin_checkout', id, signature)) return
        this.track('begin_checkout', {
          orderform_id: id,
          cart: cart,
        }, 'begin_checkout::' + id)
      },

      trackStepView: function () {
        var step = this.currentStep()
        if (!step || step === this.lastStep) return
        this.updateReachedStep()

        var of = this.getOF() || {}
        var id = of.orderFormId || ''

        if (this.lastStep === 'payment' && step !== 'payment') {
          this.currentAttemptClosed = true
        }

        this.lastStep = step
        this.stepEnteredAt = Date.now()

        var stepViewEvent = {
          login: 'checkout_login_view',
          cadastro: 'checkout_profile_view',
          shipping: 'checkout_shipping_view',
          payment: 'checkout_payment_view',
          cart: 'view_cart',
        }

        if (stepViewEvent[step]) {
          var stepPayload = { orderform_id: id }
          if (step === 'cart' && of.items && of.items.length) {
            stepPayload.cart = this.buildCart(of)
          }
          if (step === 'payment') {
            stepPayload.payment = this.getPayment(of) || undefined
            stepPayload.custom_data = this.getCustomData(of) || undefined
          }
          this.track(stepViewEvent[step], stepPayload, stepViewEvent[step] + '::' + id)
        }
      },

      trackProgress: function () {
        var of = this.getOF()
        if (!of) return
        this.updateReachedStep()

        var id = of.orderFormId || ''
        if (id && id !== this.lastOrderFormId) {
          this.lastOrderFormId = id
          this.lastShippingSignature = ''
          this.lastPaymentSignature = ''
        }

        var p = of.clientProfileData || {}
        var email = (p.email || '').trim()

        if (email && this.hasReachedStep('login')) {
          var loginSignature = JSON.stringify({ email: email })
          if (this.shouldEmitBySignature('checkout_login_submit', id, loginSignature)) {
            this.rememberIdentity(email, [p.firstName, p.lastName].filter(Boolean).join(' '), (p.phone || p.homePhone || '').replace(/\D/g, ''))

            if (trsty.identify) {
              trsty.identify({
                email: email,
                name: this.lastKnownName || undefined,
                phone: this.lastKnownPhone || undefined,
              })
            }

            this.track('checkout_login_submit', {
              orderform_id: id,
              customer: { email: email, name: this.lastKnownName || null },
            }, 'login::' + id + '::' + email)
          }
        }

        var hasProfile = !!(p.firstName && p.lastName && (p.document || p.corporateDocument))
        if (hasProfile && this.hasReachedStep('cadastro')) {
          var profileSignature = JSON.stringify({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            document: p.document || p.corporateDocument || '',
            phone: p.phone || p.homePhone || '',
          })
          if (this.shouldEmitBySignature('checkout_profile_submit', id, profileSignature)) {
            this.track('checkout_profile_submit', {
              orderform_id: id,
              customer: this.buildCustomer(p),
            }, 'profile::' + id)
          }
        }

        var logistics = (of.shippingData && of.shippingData.logisticsInfo) || []
        var slas = logistics.map(function (l) { return (l && l.selectedSla) ? l.selectedSla : '' }).filter(Boolean)
        var shippingSig = slas.join('|')

        if (shippingSig && shippingSig !== this.lastShippingSignature && this.hasReachedStep('shipping')) {
          var shipping = this.getShipping(of)
          if (!shipping) return
          var shippingSignature = JSON.stringify({
            slas: slas,
            address: of.shippingData && of.shippingData.address ? {
              postalCode: of.shippingData.address.postalCode || '',
              city: of.shippingData.address.city || '',
              state: of.shippingData.address.state || '',
              country: of.shippingData.address.country || '',
            } : {},
            pickup: shipping && shipping.pickup_type || '',
            price: shipping && shipping.shipping || '',
          })
          if (this.shouldEmitBySignature('checkout_shipping_submit', id, shippingSignature)) {
            this.lastShippingSignature = shippingSig
            this.track('checkout_shipping_submit', {
              orderform_id: id,
              shipping: shipping,
            }, 'shipping::' + id + '::' + shippingSig)
          }
        }

        var payments = (of.paymentData && of.paymentData.payments) || []
        var paySystems = payments.map(function (pay) { return (pay && pay.paymentSystem) ? String(pay.paymentSystem) : '' }).filter(Boolean)
        var paymentSig = paySystems.join('|')

        if (paymentSig && paymentSig !== this.lastPaymentSignature && this.hasReachedStep('payment')) {
          var payment = this.getPayment(of)
          if (!payment) return
          var selectedPayment = ((of.paymentData || {}).payments || [])[0] || {}
          var paymentSystems = ((of.paymentData || {}).paymentSystems || [])
          var selectedSystem = null
          for (var pIdx = 0; pIdx < paymentSystems.length; pIdx++) {
            if (String(paymentSystems[pIdx].id) === String(selectedPayment.paymentSystem || '') || String(paymentSystems[pIdx].stringId) === String(selectedPayment.paymentSystem || '')) {
              selectedSystem = paymentSystems[pIdx]
              break
            }
          }
          var paymentSignature = JSON.stringify({
            paymentSystems: paySystems,
            total: of.value || 0,
            installments: payments.map(function (pay) { return pay && pay.installments || 0 }),
          })
          if (this.shouldEmitBySignature('checkout_payment_select', id, paymentSignature)) {
            this.lastPaymentSignature = paymentSig
            this.track('checkout_payment_select', {
              orderform_id: id,
              payment: payment,
              custom_data: this.getCustomData(of) || undefined,
              raw_meta: {
                payment_system_id: selectedPayment.paymentSystem || null,
                payment_system_name: selectedSystem && selectedSystem.name || selectedPayment.paymentSystemName || null,
                payment_group_name: selectedSystem && selectedSystem.groupName || null,
                installments: selectedPayment.installments || null,
              },
            }, 'payment_select::' + id + '::' + paymentSig)
          }
        }
      },

      startPaymentAttempt: function (source) {
        if (this.currentStep() !== 'payment') return
        if (this.currentAttemptId && !this.currentAttemptClosed) return

        var of = this.getOF() || {}
        var payment = this.getPayment(of)
        if (!payment) {
          _log('warn', 'checkout_payment_submit não enviado: payment indisponível.', {
            orderFormId: of.orderFormId || '',
            source: source || 'ui_click',
          })
          return
        }
        var submitSignature = JSON.stringify({
          payment: payment,
          source: source || 'ui_click',
        })
        if (!this.shouldEmitBySignature('checkout_payment_submit', of.orderFormId || '', submitSignature)) return

        this.paymentAttemptCounter += 1
        this.currentAttemptId = this.createAttemptId()
        this.currentAttemptStartedAt = Date.now()
        this.currentAttemptClosed = false

        var selectedPayment = ((of.paymentData || {}).payments || [])[0] || {}
        var paymentSystems = ((of.paymentData || {}).paymentSystems || [])
        var selectedSystem = null
        for (var ps = 0; ps < paymentSystems.length; ps++) {
          if (String(paymentSystems[ps].id) === String(selectedPayment.paymentSystem || '') || String(paymentSystems[ps].stringId) === String(selectedPayment.paymentSystem || '')) {
            selectedSystem = paymentSystems[ps]
            break
          }
        }
        this.track('checkout_payment_submit', {
          orderform_id: of.orderFormId || '',
          payment: payment,
          custom_data: this.getCustomData(of) || undefined,
          raw_meta: {
            attempt_number: this.paymentAttemptCounter,
            attempt_id: this.currentAttemptId,
            trigger_source: source || 'ui_click',
            payment_system_id: selectedPayment.paymentSystem || null,
            payment_system_name: selectedSystem && selectedSystem.name || selectedPayment.paymentSystemName || null,
            payment_group_name: selectedSystem && selectedSystem.groupName || null,
          },
        })
      },

      succeedPaymentAttempt: function (source, extra) {
        if (!this.currentAttemptId || this.currentAttemptClosed) return
        this.currentAttemptClosed = true

        var of = this.getOF() || {}
        var payment = this.getPayment(of)
        this.track('checkout_order_placed', {
          orderform_id: of.orderFormId || '',
          payment: payment || undefined,
          cart: (of.items && of.items.length) ? this.buildCart(of) : undefined,
          raw_meta: Object.assign({
            reason: source || 'success',
            attempt_id: this.currentAttemptId,
            duration_ms: this.currentAttemptStartedAt ? (Date.now() - this.currentAttemptStartedAt) : 0,
          }, extra || {}),
        })
      },

      failPaymentAttempt: function (reason, extra) {
        if (!this.currentAttemptId || this.currentAttemptClosed) return
        this.currentAttemptClosed = true

        var of = this.getOF() || {}
        this.track('checkout_error', {
          orderform_id: of.orderFormId || '',
          raw_meta: Object.assign({
            error_type: 'payment_failed',
            reason: reason || 'unknown',
            attempt_id: this.currentAttemptId,
            duration_ms: this.currentAttemptStartedAt ? (Date.now() - this.currentAttemptStartedAt) : 0,
          }, extra || {}),
        })
      },

      trackPurchaseIfOnOrderPlacedPage: function () {
        var params = new URLSearchParams(location.search || '')
        var og = params.get('og') || params.get('orderGroup') || ''
        var hash = (location.hash || '').toLowerCase()
        var path = (location.pathname || '').toLowerCase()
        var isPurchasePage = !!og || hash.indexOf('orderplaced') !== -1 || path.indexOf('orderplaced') !== -1

        if (!isPurchasePage) return

        var of = this.getOF() || {}
        var shipping = of.orderFormId ? this.getShipping(of) : null
        var payment = of.orderFormId ? this.getPayment(of) : null
        var purchaseSignature = JSON.stringify({
          orderGroup: og || '',
          orderFormId: of.orderFormId || '',
          total: of.value || 0,
        })
        if (!this.shouldEmitBySignature('purchase', og || of.orderFormId || '', purchaseSignature)) return
        _log('info', 'Página orderPlaced detectada no checkout. Disparando conclusão de compra.', {
          orderGroup: og,
          orderFormId: of.orderFormId || '',
        })
        this.succeedPaymentAttempt('purchase_page_detected', { order_group: og })

        this.track('purchase', {
          orderform_id: of.orderFormId || '',
          cart: (of.items && of.items.length) ? this.buildCart(of) : undefined,
          shipping: shipping,
          payment: payment,
          customer: this.buildCustomer(of.clientProfileData),
          raw_meta: { order_group: og },
        }, 'purchase::' + (og || of.orderFormId || ''))
      },

      installErrorHooks: function () {
        var self = this

        window.addEventListener('error', function (evt) {
          var msg = String(evt && evt.message || 'unknown_error')
          var file = String(evt && evt.filename || '')
          var line = Number(evt && evt.lineno || 0)
          if (msg.toLowerCase() === 'script error.' && !file && !line) return

          var sig = 'window_error::' + msg + '::' + file + '::' + line
          if (!self.shouldEmitError(sig)) return

          var of = self.getOF() || {}
          self.track('checkout_error', {
            orderform_id: of.orderFormId || '',
            raw_meta: {
              error_type: 'window_error',
              step: self.currentStep(),
              message: msg.slice(0, 300),
              file: file,
              line: line,
            },
          })
        })

        window.addEventListener('unhandledrejection', function (evt) {
          var reason = evt && evt.reason
          var msg = (reason && reason.message) ? reason.message : String(reason || 'unhandled_rejection')
          var sig = 'rejection::' + msg
          if (!self.shouldEmitError(sig)) return

          var of = self.getOF() || {}
          self.track('checkout_error', {
            orderform_id: of.orderFormId || '',
            raw_meta: {
              error_type: 'unhandled_rejection',
              step: self.currentStep(),
              message: msg.slice(0, 300),
            },
          })
        })

        if (window.jQuery) {
          $(document).ajaxError(function (_e, jqxhr, settings, err) {
            var url = String(settings && settings.url || '')
            var status = Number(jqxhr && jqxhr.status || 0)
            var errTxt = String(err || '')
            if (url.indexOf('/api/checkout/') === -1) return

            if (status === 428) {
              var og = (url.match(/\/gatewaycallback\/([^/?#]+)/i) || [])[1] || ''
              var requestMeta = self.getRequestMeta(jqxhr, settings, { step: self.currentStep() })
              self.track('checkout_payment_pending', {
                orderform_id: (self.getOF() || {}).orderFormId || '',
                raw_meta: {
                  payment_type: 'pix_or_boleto',
                  gateway_url: url.slice(0, 300),
                  order_group: og,
                  status: status,
                  request: requestMeta,
                },
              })
              return
            }

            var sig = 'ajax_error::' + url + '::' + status
            if (!self.shouldEmitError(sig)) return

            var errorBody = (jqxhr && typeof jqxhr.responseText === 'string')
              ? jqxhr.responseText.slice(0, 500)
              : ''

            var of = self.getOF() || {}
            self.track('checkout_error', {
              orderform_id: of.orderFormId || '',
              raw_meta: {
                error_type: 'ajax_error',
                step: self.currentStep(),
                error: errTxt.slice(0, 300),
                error_body: errorBody,
                request: self.getRequestMeta(jqxhr, settings, { step: self.currentStep() }),
              },
            })

            if (self.currentStep() === 'payment' && status !== 0 && url.indexOf('/attachments/paymentData') === -1) {
              self.failPaymentAttempt('ajax_error', {
                url: url.slice(0, 300),
                status: status,
              })
            }
          })
        }
      },

      installInterfaceHooks: function () {
        var self = this
        if (!window.MutationObserver) return
        var baselineTimer = null
        var knownMessagesByStep = {}
        var baselineReadyByStep = {}

        function normalizeText(text) {
          return String(text || '').replace(/\s+/g, ' ').trim()
        }

        function currentStepKey() {
          var step = self.currentStep() || 'unknown'
          var of = self.getOF() || {}
          return step + '::' + (of.orderFormId || 'global')
        }

        function shouldConsiderNode(node, text) {
          if (!node || !text) return false
          if (text.length < 3 || text.length > 220) return false
          if (!node.getBoundingClientRect) return false

          var rect = node.getBoundingClientRect()
          if (rect.width === 0 && rect.height === 0) return false

          var style = window.getComputedStyle ? window.getComputedStyle(node) : null
          if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false

          var className = String(node.className || '').toLowerCase()
          var id = String(node.id || '').toLowerCase()
          var ariaLive = String(node.getAttribute && node.getAttribute('aria-live') || '').toLowerCase()

          return (
            className.indexOf('error') !== -1 ||
            className.indexOf('warning') !== -1 ||
            className.indexOf('alert') !== -1 ||
            id.indexOf('error') !== -1 ||
            ariaLive === 'assertive' ||
            ariaLive === 'polite'
          )
        }

        function getKnownMessages(stepKey) {
          if (!knownMessagesByStep[stepKey]) {
            knownMessagesByStep[stepKey] = self.loadInterfaceBaseline(stepKey)
          }
          return knownMessagesByStep[stepKey]
        }

        function collectMessages(root) {
          var selectors = [
            '.error',
            '.error-msg',
            '.help.error',
            '.vtex-front-messages-placeholder .alert',
            '.vtex-front-messages-placeholder .warning',
            '.vtex-front-messages-placeholder .error',
            '.shipment-option-item-text-error',
            '.input-error',
            '[data-testid*="error"]',
            '[class*="error"]'
          ]

          var nodes = []
          selectors.forEach(function (selector) {
            try {
              var found = (root || document).querySelectorAll(selector)
              for (var i = 0; i < found.length; i++) nodes.push(found[i])
            } catch (_) {}
          })
          return nodes
        }

        function markBaselineForStep() {
          var stepKey = currentStepKey()
          var known = {}
          collectMessages(document).forEach(function (node) {
            var text = normalizeText(node.textContent || node.innerText || '')
            if (!shouldConsiderNode(node, text)) return
            known[text] = true
          })
          knownMessagesByStep[stepKey] = known
          baselineReadyByStep[stepKey] = true
          self.saveInterfaceBaseline(stepKey, known)
          _log('info', 'Baseline de interface atualizada.', {
            step: self.currentStep(),
            known_messages: Object.keys(known).length,
          })
        }

        function scheduleBaselineRefresh() {
          if (baselineTimer) clearTimeout(baselineTimer)
          baselineTimer = setTimeout(markBaselineForStep, 800)
        }

        function findFieldContext(node) {
          if (!node || !node.closest) return {}

          var container = node.closest(
            '.ship-postalCode, .ship-number, .ship-street, .ship-neighborhood, .ship-city, .ship-state,' +
            ' .client-first-name, .client-last-name, .client-email, .client-phone, .client-document,' +
            ' .payment-group, .shipping-data, .client-profile-data'
          )

          var input = node.closest('.input, .input-group, .vtex-address-form__postalCode, .vtex-address-form__street') ||
            (container && container.querySelector ? container.querySelector('input, select, textarea') : null) ||
            node.querySelector && node.querySelector('input, select, textarea')

          var fieldName = ''
          var fieldLabel = ''

          if (input) {
            fieldName = input.name || input.id || input.getAttribute('data-testid') || ''
            fieldLabel = input.getAttribute('placeholder') || input.getAttribute('aria-label') || ''
          }

          if (!fieldLabel && container) {
            var labelNode = container.querySelector('label, .input-label, .vtex-input__label, .shp-option-text-label')
            fieldLabel = normalizeText(labelNode && (labelNode.textContent || labelNode.innerText) || '')
          }

          if (!fieldName && container) {
            fieldName = container.id || container.getAttribute('data-testid') || container.className || ''
          }

          return {
            field_name: String(fieldName || '').slice(0, 120),
            field_label: String(fieldLabel || '').slice(0, 120),
          }
        }

        function classifyInterfaceMessage(text, step) {
          var lower = String(text || '').toLowerCase()
          if (lower.indexOf('obrigat') !== -1) return 'required_field'
          if (lower.indexOf('inválid') !== -1 || lower.indexOf('inval') !== -1) return 'invalid_field'
          if (lower.indexOf('cep') !== -1) return 'postal_code'
          if (lower.indexOf('pagamento') !== -1) return 'payment'
          if (lower.indexOf('frete') !== -1 || step === 'shipping') return 'shipping'
          return 'validation'
        }

        function emitInterfaceMessage(node) {
          if (!node) return
          var text = normalizeText(node.textContent || node.innerText || '')
          if (!text || text.length < 3) return
          if (!shouldConsiderNode(node, text)) return

          var stepKey = currentStepKey()
          if (!baselineReadyByStep[stepKey]) return
          var known = getKnownMessages(stepKey)
          if (known[text]) return
          known[text] = true
          self.saveInterfaceBaseline(stepKey, known)

          var sig = 'interface_message::' + text
          if (!self.shouldEmitError(sig)) return

          var of = self.getOF() || {}
          var step = self.currentStep()
          var fieldContext = findFieldContext(node)
          var messageType = classifyInterfaceMessage(text, step)
          self.track('interface_message', {
            orderform_id: of.orderFormId || '',
            raw_meta: {
              type: 'ui_feedback',
              message: text.slice(0, 500),
              message_type: messageType,
              step: step,
              field_name: fieldContext.field_name || undefined,
              field_label: fieldContext.field_label || undefined,
              selector: node.className || node.id || node.nodeName,
              element_text: normalizeText((node.innerText || '').slice(0, 300)),
              path: location.pathname,
              hash: location.hash,
            },
          })
        }

        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
              for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i]
                if (!node || node.nodeType !== 1) continue
                emitInterfaceMessage(node)
                collectMessages(node).forEach(emitInterfaceMessage)
              }
            }

            if (mutation.type === 'attributes' && mutation.target) {
              emitInterfaceMessage(mutation.target)
            }
          })
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style', 'aria-hidden'],
        })

        scheduleBaselineRefresh()

        $(window).on('hashchange.trastyInterface orderFormUpdated.vtex', function () {
          scheduleBaselineRefresh()
        })
      },

      installAjaxTelemetry: function () {
        var self = this
        if (!window.jQuery) return

        $(document).ajaxComplete(function (_e, jqxhr, settings) {
          var url = String(settings && settings.url || '')
          if (url.indexOf('/api/checkout/') === -1 && url.indexOf('/gateway/') === -1 && url.indexOf('/payments/') === -1) {
            return
          }

          var meta = self.getRequestMeta(jqxhr, settings, {
            step: self.currentStep(),
          })

          var sig = 'request_meta::' + meta.method + '::' + meta.url + '::' + meta.status + '::' + (meta.request_id || '')
          if (!self.shouldEmitError(sig)) return

          var of = self.getOF() || {}
          self.track('request_trace', {
            orderform_id: of.orderFormId || '',
            raw_meta: {
              trace_type: 'ajax_complete',
              request: meta,
            },
          })
        })
      },

      installPaymentGuard: function () {
        var self = this
        if (!window.jQuery) return

        $(document).on('click.trastyPayment', '.payment-submit-wrap button, #payment-data-submit', function () {
          var btn = $(this)
          if (btn.is(':disabled') || btn.hasClass('disabled')) return
          self.startPaymentAttempt('ui_click')
        })
      },

      init: function () {
        var self = this
        this.hydrateIdentity()
        _log('info', 'Registrando listeners do checkout...')

        $(window).on('orderFormUpdated.vtex', function (_, orderForm) {
          _log('info', 'orderFormUpdated.vtex recebido.', {
            orderFormId: orderForm && orderForm.orderFormId,
            items: orderForm && orderForm.items ? orderForm.items.length : 0,
          })
          self.emitBeginCheckout()
          self.emitOrderFormReady()
          self.trackStepView()
          self.trackProgress()
        })

        $(window).on('hashchange.trasty', function () {
          _log('info', 'hashchange.trasty recebido.', { hash: location.hash })
          self.trackStepView()
        })

        $(window).on('vtexIdLogInSuccess.vtexid', function () {
          _log('info', 'vtexIdLogInSuccess.vtexid recebido.')
          vtexjs.checkout.getOrderForm().done(function (of) {
            var p = of.clientProfileData
            if (p && p.email) {
              if (trsty.identify) {
                trsty.identify({
                  email: p.email,
                  name: [p.firstName, p.lastName].filter(Boolean).join(' ') || undefined,
                  phone: (p.phone || p.homePhone || undefined),
                })
              }
              self.rememberIdentity(
                p.email,
                [p.firstName, p.lastName].filter(Boolean).join(' '),
                (p.phone || p.homePhone || '')
              )
            }
          })
        })

        $(window).on('orderPlaced.trasty', function (_, orderGroup) {
          _log('info', 'orderPlaced.trasty recebido.', {
            orderGroup: orderGroup && orderGroup.orderGroup,
          })
          var order = ((orderGroup && orderGroup.orders) || [])[0]
          if (!order) return

          var p = order.clientProfileData || {}

          self.succeedPaymentAttempt('order_placed_event', {
            order_group: orderGroup && orderGroup.orderGroup,
            order_id: order.orderId,
          })

          if (p.email && trsty.identify) {
            trsty.identify({
              email: p.email,
              name: [p.firstName, p.lastName].filter(Boolean).join(' ') || undefined,
              phone: p.phone || p.homePhone || undefined,
              document: p.document || undefined,
            })
          }

          self.track('purchase', {
            orderform_id: order.orderFormId,
            raw_meta: {
              order_id: order.orderId,
              order_status: order.status,
            },
            customer: self.buildCustomer(p),
            cart: self.buildCart(order),
            shipping: self.getShipping(order),
            payment: self.getPayment(order),
          }, 'purchase::' + (order.orderId || order.orderFormId || ''))
        })

        vtexjs.checkout.getOrderForm().done(function (of) {
          _log('info', 'Bootstrap inicial do checkout concluído.', {
            orderFormId: of && of.orderFormId,
            items: of && of.items ? of.items.length : 0,
            step: self.currentStep(),
          })
          self.emitBeginCheckout()
          self.emitOrderFormReady()
          self.trackStepView()
          self.trackPurchaseIfOnOrderPlacedPage()
        })

        this.installErrorHooks()
        this.installInterfaceHooks()
        this.installAjaxTelemetry()
        this.installPaymentGuard()
      },
    }

    if (window.jQuery && window.vtexjs) {
      _depsResolved = true
      _log('info', 'Dependências do checkout já disponíveis, iniciando.')
      T.init()
    } else {
      _log('info', 'Aguardando dependências do checkout...', {
        hasJquery: !!window.jQuery,
        hasVtexjs: !!window.vtexjs,
      })
      var _waitDeps = setInterval(function () {
        if (window.jQuery && window.vtexjs) {
          clearInterval(_waitDeps)
          _depsResolved = true
          _log('info', 'Dependências do checkout carregadas, iniciando.')
          T.init()
        }
      }, 100)
      setTimeout(function () {
        clearInterval(_waitDeps)
        if (_depsResolved) return
        _log('warn', 'Timeout aguardando dependências do checkout.', {
          hasJquery: !!window.jQuery,
          hasVtexjs: !!window.vtexjs,
        })
      }, 10000)
    }
  }
})()
// END TRASTY CHECKOUT INTEGRATION
