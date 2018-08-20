"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var cryptoCurrs = ['ETH', 'LTC', 'BTC'];
var currencies = ['USD', 'EUR', 'GBP', 'UAH'];
var signs = ['$', '€', '£', '₴'];
var urlBase = 'https://apiv2.bitcoinaverage.com/indices/global/ticker/';
var currencyElems = [];
var currentCurrElem = document.querySelector('.js-curr-selected');
var cards = Array.from(document.querySelectorAll('.currency'));
var lastResults = null;

var initEventHandling = function initEventHandling() {
  var currencySelection = document.querySelector(".selector__current");
  var currencyOptions = document.querySelector(".selector__options");
  var currencyItems = document.querySelectorAll(".js-curr-option");

  if (currencySelection && currencyOptions && currencyItems.length > 0) {
    currencySelection.addEventListener("click", function (e) {
      e.stopPropagation();
      currencyOptions.classList.toggle("hidden");
    });

    var addHighlight = function addHighlight(e) {
      e.stopPropagation();
      e.target.classList.add('selector__current--highlighted');
    };

    var removeHighlight = function removeHighlight(e) {
      e.stopPropagation();
      e.target.classList.remove('selector__current--highlighted');
    };

    currentCurrElem.addEventListener('mouseenter', addHighlight);
    currentCurrElem.addEventListener('mouseleave', removeHighlight);

    currencyItems.forEach(function (item) {
      item.addEventListener('mouseenter', addHighlight);
      item.addEventListener('mouseleave', removeHighlight);
    });
  }

  document.addEventListener("click", function () {
    if (!currencyOptions.classList.contains("hidden")) {
      currencyOptions.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!currencyOptions.classList.contains("hidden")) {
        currencyOptions.classList.add("hidden");
      }
    }
  });

  var switchContainers = document.querySelectorAll('.js-switch-container');
  switchContainers.forEach(function (elem) {
    elem.addEventListener('click', function (e) {
      if (e.target.classList.contains('js-switch-slider') || e.target.classList.contains('js-switch-thumb')) {
        var check = elem.querySelector('.js-switch');
        if (check) {
          check.checked = !check.checked;
          if (lastResults) {
            var card = e.target.closest('.currency');
            var cryptoCurrency = card.dataset.currency;
            var currency = currentCurrElem.textContent;
            var symbol = signs[currencies.indexOf(currency)];
            setChanges(card, check.checked, lastResults[cryptoCurrency].changes, symbol);
          }
        }
      }
    });
  });
};

var getRates = function getRates(currency) {
  var results = [];
  cryptoCurrs.forEach(function (crypto) {
    var url = urlBase + crypto + currency;
    var result = fetch(url).then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    });
    results.push(result);
  });
  return Promise.all(results);
};

var changeSelectedCurrency = function changeSelectedCurrency(elem, curr) {
  var current = currencyElems.filter(function (elem) {
    return elem.classList.contains('hidden');
  })[0];
  var replacement = elem;
  currentCurrElem.textContent = curr;
  replacement.classList.add('hidden');
  current.classList.remove('hidden');
  updateUI(curr);
};

function updateUI(currentCurrency) {
  var rates = getRates(currentCurrency);
  rates.then(function (results) {
    return results.reduce(function (data, result, i) {
      data[cryptoCurrs[i]] = result;
      return data;
    }, {});
  }).then(function (data) {
    return updateRates(currentCurrency, data);
  }).catch(function (err) {
    return console.log(err.message);
  });
}

function setChangeColor(elem, value) {
  if (value < 0) {
    elem.classList.remove('currency__change-value--ok');
    elem.classList.add('currency__change-value--danger');
  } else {
    elem.classList.remove('currency__change-value--danger');
    elem.classList.add('currency__change-value--ok');
  }
}

function setChanges(card, percentage, changes, symbol) {
  if (percentage) {
    var percent = changes.percent;
    var hourChange = card.querySelector('.js-hour-change');
    hourChange.textContent = formatNumber((percent.hour < 0 ? '' : '+') + percent.hour.toFixed(2)) + '%';
    setChangeColor(hourChange, percent.hour);
    var dayChange = card.querySelector('.js-day-change');
    dayChange.textContent = formatNumber((percent.day < 0 ? '' : '+') + percent.day.toFixed(2)) + '%';
    setChangeColor(dayChange, percent.day);
    var weekChange = card.querySelector('.js-week-change');
    weekChange.textContent = formatNumber((percent.week < 0 ? '' : '+') + percent.week.toFixed(2)) + '%';
    setChangeColor(weekChange, percent.week);
    var monthChange = card.querySelector('.js-month-change');
    monthChange.textContent = formatNumber((percent.month < 0 ? '' : '+') + percent.month.toFixed(2)) + '%';
    setChangeColor(monthChange, percent.month);
  } else {
    var price = changes.price;
    var _hourChange = card.querySelector('.js-hour-change');
    _hourChange.textContent = formatNumber((price.hour < 0 ? '' : '+') + price.hour.toFixed(2)) + symbol;
    setChangeColor(_hourChange, price.hour);
    var _dayChange = card.querySelector('.js-day-change');
    _dayChange.textContent = formatNumber((price.day < 0 ? '' : '+') + price.day.toFixed(2)) + symbol;
    setChangeColor(_dayChange, price.day);
    var _weekChange = card.querySelector('.js-week-change');
    _weekChange.textContent = formatNumber((price.week < 0 ? '' : '+') + price.week.toFixed(2)) + symbol;
    setChangeColor(_weekChange, price.week);
    var _monthChange = card.querySelector('.js-month-change');
    _monthChange.textContent = formatNumber((price.month < 0 ? '' : '+') + price.month.toFixed(2)) + symbol;
    setChangeColor(_monthChange, price.month);
  }
}

function updateRates(currency, results) {
  lastResults = results;
  Object.entries(results).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    var card = cards.filter(function (elem) {
      return elem.dataset.currency === key;
    })[0];
    var price = card.querySelector('.js-price');
    var symbol = signs[currencies.indexOf(currency)];
    price.textContent = symbol + formatNumber(value.last.toFixed(2), false);
    var percentage = card.querySelector('.js-switch').checked;
    setChanges(card, percentage, value.changes, symbol);
  });
};

var initUI = function initUI() {
  var currentCurrency = currencies[0];
  currentCurrElem.textContent = currentCurrency;

  var currencyList = document.querySelector(".js-currency-list");

  currencies.forEach(function (curr, i) {
    var li = document.createElement('li');
    li.className = 'selector__currency-item js-curr-option' + (i === 0 ? ' hidden' : '');
    li.textContent = curr;
    li.addEventListener('click', function (e) {
      changeSelectedCurrency(li, curr);
    });
    currencyList.appendChild(li);
    currencyElems.push(li);
  });

  updateUI(currentCurrency);
};

function formatNumber(number) {
  var signed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var sign = '';
  if (signed) {
    sign = number[0];
    number = number.slice(1);
  }
  var parts = number.split('.');
  var groups = [];
  var integer = Array.from(parts[0]);
  var rest = void 0,
      digits = void 0;
  do {
    rest = integer.length % 3;
    if (rest > 0) {
      digits = integer.splice(0, rest);
      groups.push(digits.join(''));
    } else {
      digits = integer.splice(0, Math.min(3, integer.length));
      groups.push(digits.join(''));
    }
  } while (integer.length > 0);
  return sign + (parts.length > 1 ? groups.join(' ') + '.' + parts[1] : groups.join(' '));
}

document.addEventListener("DOMContentLoaded", function () {
  initUI();
  initEventHandling();
});