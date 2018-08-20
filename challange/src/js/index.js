"use strict";

const cryptoCurrs = ['ETH', 'LTC', 'BTC'];
const currencies = ['USD', 'EUR', 'GBP', 'UAH'];
const signs = ['$', '€', '£', '₴'];
const urlBase = 'https://apiv2.bitcoinaverage.com/indices/global/ticker/';
const currencyElems = [];
const currentCurrElem = document.querySelector('.js-curr-selected');
const cards = Array.from(document.querySelectorAll('.currency'));
let lastResults = null;

const initEventHandling = () => {
  const currencySelection = document.querySelector(".selector__current");
  const currencyOptions = document.querySelector(".selector__options");
  const currencyItems = document.querySelectorAll(".js-curr-option");

  if (currencySelection && currencyOptions && currencyItems.length > 0) {
    currencySelection.addEventListener("click", e => {
      e.stopPropagation();
      currencyOptions.classList.toggle("hidden");
    });

    const addHighlight = e => {
      e.stopPropagation();
      e.target.classList.add('selector__current--highlighted');
    };

    const removeHighlight = e => {
      e.stopPropagation();
      e.target.classList.remove('selector__current--highlighted');
    };

    currentCurrElem.addEventListener('mouseenter', addHighlight);
    currentCurrElem.addEventListener('mouseleave', removeHighlight);

    currencyItems.forEach(item => {
      item.addEventListener('mouseenter', addHighlight);
      item.addEventListener('mouseleave', removeHighlight);
    });
  }

  document.addEventListener("click", () => {
    if (!currencyOptions.classList.contains("hidden")) {
      currencyOptions.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (!currencyOptions.classList.contains("hidden")) {
        currencyOptions.classList.add("hidden");
      }
    }
  });

  let switchContainers = document.querySelectorAll('.js-switch-container');
  switchContainers.forEach(elem => {
    elem.addEventListener('click', e => {
      if (e.target.classList.contains('js-switch-slider') ||
        e.target.classList.contains('js-switch-thumb')) {
        const check = elem.querySelector('.js-switch');
        if (check) {
          check.checked = !check.checked;
          if (lastResults) {
            const card = e.target.closest('.currency');
            const cryptoCurrency = card.dataset.currency;
            const currency = currentCurrElem.textContent;
            const symbol = signs[currencies.indexOf(currency)];
            setChanges(card, check.checked, lastResults[cryptoCurrency].changes, symbol);
          }
        }
      }
    });
  });
};

const getRates = (currency) => {
  const results = [];
  cryptoCurrs.forEach(crypto => {
    const url = urlBase + crypto + currency;
    const result = fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      });
    results.push(result);
  });
  return Promise.all(results);
};

const changeSelectedCurrency = (elem, curr) => {
  const current = currencyElems.filter(elem => elem.classList.contains('hidden'))[0];
  const replacement = elem;
  currentCurrElem.textContent = curr;
  replacement.classList.add('hidden');
  current.classList.remove('hidden');
  updateUI(curr);
};

function updateUI(currentCurrency) {
  const rates = getRates(currentCurrency);
  rates.then(results => results.reduce((data, result, i) => {
    data[cryptoCurrs[i]] = result;
    return data;
  }, {}))
    .then(data => updateRates(currentCurrency, data))
    .catch(err => console.log(err.message));
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
    const percent = changes.percent;
    const hourChange = card.querySelector('.js-hour-change');
    hourChange.textContent = formatNumber((percent.hour < 0 ? '' : '+') + percent.hour.toFixed(2)) + '%';
    setChangeColor(hourChange, percent.hour);
    const dayChange = card.querySelector('.js-day-change');
    dayChange.textContent = formatNumber((percent.day < 0 ? '' : '+') + percent.day.toFixed(2)) + '%';
    setChangeColor(dayChange, percent.day);
    const weekChange = card.querySelector('.js-week-change');
    weekChange.textContent = formatNumber((percent.week < 0 ? '' : '+') + percent.week.toFixed(2)) + '%';
    setChangeColor(weekChange, percent.week);
    const monthChange = card.querySelector('.js-month-change');
    monthChange.textContent = formatNumber((percent.month < 0 ? '' : '+') + percent.month.toFixed(2)) + '%';
    setChangeColor(monthChange, percent.month);
  } else {
    const price = changes.price;
    const hourChange = card.querySelector('.js-hour-change');
    hourChange.textContent = formatNumber((price.hour < 0 ? '' : '+') + price.hour.toFixed(2)) + symbol;
    setChangeColor(hourChange, price.hour);
    const dayChange = card.querySelector('.js-day-change');
    dayChange.textContent = formatNumber((price.day < 0 ? '' : '+') + price.day.toFixed(2)) + symbol;
    setChangeColor(dayChange, price.day);
    const weekChange = card.querySelector('.js-week-change');
    weekChange.textContent = formatNumber((price.week < 0 ? '' : '+') + price.week.toFixed(2)) + symbol;
    setChangeColor(weekChange, price.week);
    const monthChange = card.querySelector('.js-month-change');
    monthChange.textContent = formatNumber((price.month < 0 ? '' : '+') + price.month.toFixed(2)) + symbol;
    setChangeColor(monthChange, price.month);
  }
}

function updateRates(currency, results) {
  lastResults = results;
  Object.entries(results).forEach(([key, value]) => {
    const card = cards.filter(elem => elem.dataset.currency === key)[0];
    const price = card.querySelector('.js-price');
    const symbol = signs[currencies.indexOf(currency)];
    price.textContent = symbol + formatNumber(value.last.toFixed(2), false);
    const percentage = card.querySelector('.js-switch').checked;
    setChanges(card, percentage, value.changes, symbol);
  });
};

const initUI = () => {
  const currentCurrency = currencies[0];
  currentCurrElem.textContent = currentCurrency;

  const currencyList = document.querySelector(".js-currency-list");

  currencies.forEach((curr, i) => {
    const li = document.createElement('li');
    li.className = 'selector__currency-item js-curr-option' + (i === 0 ? ' hidden' : '');
    li.textContent = curr;
    li.addEventListener('click', e => {
      changeSelectedCurrency(li, curr);
    });
    currencyList.appendChild(li);
    currencyElems.push(li);
  });

  updateUI(currentCurrency);
};

function formatNumber(number, signed = true) {
  let sign = '';
  if (signed) {
    sign = number[0];
    number = number.slice(1);
  }
  const parts = number.split('.');
  const groups = [];
  const integer = Array.from(parts[0]);
  let rest, digits;
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

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initEventHandling();
});
