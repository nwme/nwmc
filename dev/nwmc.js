var nwmc = nwmc || {};
nwmc.xml = '';
nwmc.loadingTemplate = '<div class="nwmc"><div class="nwmc__logo"><img src="http://northwestmoneyexchange.com/libraries/widget/nwmc-logo.png" alt="Northwest Money Exchange - Logo" class="nwmc__logo__img"><h2 class="nwmc__loading">Loading currency converter</h2></div></div>';
nwmc.template = function(fromOptions, toOptions, lastUpdated) { return '<div class="nwmc"><div class="nwmc__logo"><img src="http://northwestmoneyexchange.com/libraries/widget/nwmc-logo.png" alt="Northwest Money Exchange - Logo" class="nwmc__logo__img"></div><div class="nwmc__form"><h2 class="nwmc__title">Quick currency converter</h2><div class="nwmc__convert nwmc__clearfix"><div class="nwmc__form-group"><div class="nwmc__form-group-inner first"><label class="nwmc__label" for="nwmc-amount">Convert</label><input class="nwmc__input" id="nwmc-amount" value="10.00" placeholder="10.00"></div></div><div class="nwmc__form-group"><div class="nwmc__form-group-inner second"><label class="nwmc__label" for="nwmc-from-currency">Of this currency</label><select class="nwmc__select" id="nwmc-from-currency">' + fromOptions + '</select></div></div><div class="nwmc__form-group last"><div class="nwmc__form-group-inner third"><label class="nwmc__label" for="nwmc-to-currency">To this currency</label><select class="nwmc__select" id="nwmc-to-currency">' + toOptions + '</select></div></div></div><div class="nwmc__result"><span class="nwmc__result__label">Result:</span><span class="nwmc__result__calculated" id="nwmc-result">Loading...</span><span class="nwmc__result__single"><strong>Rate:</strong> <span id="nwmc-single-rate"></span></span></div><div class="nwmc__legal"><p>Rates correct as of ' + lastUpdated + '</p></div></div><div class="nwmc__contact"><p>Phone <a href="tel:02871367710">028 7136 7710</a> to book your deal.</p></div></div>';}
nwmc.singleRateString = function(from, to, amt) { return '1 ' + from + ' = ' + amt + ' ' + to; };
nwmc.resultString = function(amt, from) { return ['',amt,' ',from].join(''); };
nwmc.optionString = function(val, label) { return '<option value="' + val + '">' + label + '</option>'; }

nwmc.findCurrency = function (rates, iso) {
    var cur, i;
    for (i = 0; i < rates.length; i++) {
        if (rates[i].iso.toUpperCase() === iso.toUpperCase()) {
            cur = rates[i];
            break;
        }
    }

    return cur;
}

nwmc.filterRates = function(rates) {
    var i, filtered = [];

    for (i = 0; i < rates.length; i++) {
        if (rates[i].iso && rates[i].buy && rates[i].sell && rates[i].label) {
            filtered.push(rates[i]);
        }
    }

    return filtered;
}

nwmc.extractLastUpdated = function(xml) {
    var lastUpdated;
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml,"text/xml");
    } else {
        // Internet Explorer
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xml);
    }
    nodes = xmlDoc.getElementsByTagName("rates")[0].childNodes;
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        if (node.childNodes.length !== 0 && node.tagName.match('DATE')) {
            lastUpdated = node.textContent;
            break;
        }
    }

    return (lastUpdated) ? lastUpdated : new Date().toDateString();
};

nwmc.extractRates = function(xml) {
    var rates = [], nodes, node, rate, iso, rateType, current;
    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml,"text/xml");
    } else {
        // Internet Explorer
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xml);
    }

    nodes = xmlDoc.getElementsByTagName("rates")[0].childNodes;
    for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        if (node.childNodes.length === 0 || !node.tagName.match(/(^Buy|Sell)_[A-Z]{3}/)) {
            continue;
        }

        rateType = node.tagName.substring(0, node.tagName.indexOf('_')).toLowerCase();
        iso = node.tagName.substring(node.tagName.indexOf('_') + 1, node.tagName.indexOf('_') + 4).toUpperCase();

        current = nwmc.findCurrency(rates, iso);

        if (current) {
            current[rateType] = parseFloat(node.textContent);
        } else {
            rate = {iso: iso, label: iso};
            rate[rateType] = parseFloat(node.textContent);
            rates.push(rate);
        }
    }

    rates.unshift({
        iso: 'GBP',
        label: 'GBP',
        buy: 1,
        sell: 1
    });

    return nwmc.filterRates(rates);
}

nwmc.mergeObjects = function(preferred, fallback) {
    var key, obj = {};

    for (key in fallback) {
        if (!fallback.hasOwnProperty(key)) { continue; }
        obj[key] = (!!preferred[key]) ? preferred[key] : fallback[key];
    }

    return obj;
};

nwmc.classy = function() {
    var addClassList = function(el, myClass) {
            if (hasClassList(el, myClass)) {
                return;
            }
          el.classList.add(myClass);
        },
        removeClassList = function(el, myClass) {
            while (hasClassList(el, myClass)) {
                el.classList.remove(myClass);
            }
        },
        hasClassList = function(el, myClass) {
            return el.classList.contains(myClass);
        },

        addOld = function(el, myClass) {
            if (hasOld(el, myClass)) {
                return;
            }
          el.className += ' ' + myClass;
        },
        removeOld = function(el, myClass) {
            while (hasOld(el, myClass)) {
                el.className = el.className.replace(myClass, "");
            }
        },
        hasOld = function(el, myClass) {
            return (el.className.indexOf(myClass) !== -1);
        };

    if (typeof(document.body.classList) !== 'undefined') {
        return {
            add: addClassList,
            remove: removeClassList,
            has: hasClassList
        };
    } else {
        return {
            add: addOld,
            remove: removeOld,
            has: hasOld
        };
    }
};

nwmc.widget = function(options) {
    'use strict';

    var el, input, from, to, result, singleRate, config,
        rates = [
            {iso: 'EUR', label: 'Euro', buy: 1.4613, sell: 1.3837},
            {iso: 'GBP', label: 'Great British pound', buy: 1, sell: 1},
            {iso: 'USD', label: 'US Dollars', buy: 1.6267, sell: 1.5419}
        ],
        classy = new nwmc.classy(),
        defaults = {
            elementId: 'nwmc',
            stylesheet: 'http://northwestmoneyexchange.com/libraries/widget/nwmc.css',
            widthSmall: 500,
            widthTiny: 300
        },
        lastUpdated;

    function adjustWidth() {
        if (el.offsetWidth > config.widthSmall) {
            classy.remove(el, 'nwmc--tiny');
            classy.remove(el, 'nwmc--small');
        } else if (el.offsetWidth > config.widthTiny) {
            classy.add(el, 'nwmc--small');
            classy.remove(el, 'nwmc--tiny');
        } else {
            classy.add(el, 'nwmc--tiny');
            classy.add(el, 'nwmc--small');
        }
    }

    function injectCSS() {
        var link;
        if (!config.stylesheet) {
            return;
        }
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = config.stylesheet;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    function attachHandlers() {
        input.onkeyup = calculate;
        input.oninput = calculate;
        input.onchange = calculate;
        from.onchange = calculate;
        to.onchange = calculate;
    }

    function calculate() {
        var fromISO = from.value,
            toISO = to.value,
            amount = parseFloat(input.value.replace(/[^\d\.]/g, '')),
            rate, fromRate, toRate, converted;

        if (isNaN(amount)) {
            renderError();
            return;
        }

        if (fromISO === toISO) {
            rate = 1;
            converted = amount;
        } else {
            fromRate = nwmc.findCurrency(rates, fromISO);
            toRate = nwmc.findCurrency(rates, toISO);
            rate = ((1 / fromRate.buy) * (1/toRate.sell));
            converted = rate * amount;
        }

        renderSuccess(amount, fromISO, toISO, rate, converted);
    }

    function renderSuccess(amount, fromISO, toISO, single, calculated) {
        singleRate.innerHTML = nwmc.singleRateString(fromISO, toISO, single.toFixed(4));
        result.innerHTML = nwmc.resultString(calculated.toFixed(2), toISO);
    }

    function renderError() {
        singleRate.innerHTML = '';
        result.innerHTML = 'Error. Please enter a valid amount.';
    }

    function captureElements() {
        input = document.getElementById('nwmc-amount');
        from  = document.getElementById('nwmc-from-currency');
        to    = document.getElementById('nwmc-to-currency');

        singleRate = document.getElementById('nwmc-single-rate');
        result     = document.getElementById('nwmc-result');
    }

    function renderContent() {
        var i, options = '';
        for (i = 0; i < rates.length; i++) {
            options += nwmc.optionString(rates[i].iso, rates[i].label);
        }
        adjustWidth();
        el.innerHTML = nwmc.template(options, options, lastUpdated);
    }

    function loadXML() {
        rates = nwmc.extractRates(nwmc.xml);
        lastUpdated = nwmc.extractLastUpdated(nwmc.xml);
        renderContent();
        captureElements();
        attachHandlers();
        calculate();
    }

    function init() {

        options = typeof(options) === 'object' ? options : {};
        config = nwmc.mergeObjects(options, defaults);
        el = document.getElementById(config.elementId);

        injectCSS();
        el.innerHTML = nwmc.loadingTemplate;
        loadXML();
    }

    return {
        init: init,
        adjust: adjustWidth
    }
};

(function initNwmc() {
    'use strict';
    var widget;

    if (!nwmc.preventAutoInit) {
        widget = nwmc.widget();
        widget.init();
        window.onresize = widget.adjust;
    }
})();
