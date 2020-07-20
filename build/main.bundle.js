"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

// Local Storage Controller
var StorageCtrl = function () {
  var getBill = function getBill(item, time) {
    var resumptionTime = time.split(':');
    var arrivalTime = item.time.split(':');
    var a = moment().hour(resumptionTime[0]).minute(resumptionTime[1]);
    var b = moment().hour(arrivalTime[0]).minute(arrivalTime[1]);
    var diff = moment.duration(b.diff(a)).as('minutes');
    if (diff > 0) return +(diff * 0.2).toFixed(2);
    return 0;
  };

  var formatNewItem = function formatNewItem(item, bill) {
    var time = item.time,
        newItem = _objectWithoutProperties(item, ["time"]);

    return _objectSpread(_objectSpread({}, newItem), {}, {
      bill: bill
    });
  };

  var formatOldItem = function formatOldItem(item, oldItem, bill) {
    return _objectSpread(_objectSpread({}, oldItem), {}, {
      name: item.name,
      address: item.address,
      bill: +(oldItem.bill + bill).toFixed(2)
    });
  }; // Public Methods


  return {
    storeItems: function storeItems(item) {
      var time = '08:30';
      var resumptionTime = document.getElementById('resumption-time');
      if (resumptionTime.value) time = resumptionTime.value;
      var items; // Check if any item in LS

      if (localStorage.getItem('items') === null) {
        items = []; // Push new item

        var bill = getBill(item, time);
        var newItem = formatNewItem(item, bill);
        items.push(newItem); // Set LS

        localStorage.setItem('items', JSON.stringify(items));
      } else {
        // Get items in LS
        items = JSON.parse(localStorage.getItem('items'));
        var findItem = items.find(function (i) {
          return i.email === item.email;
        }); // Push new item or edit old item

        if (findItem) {
          var _bill = getBill(item, time);

          var _newItem = formatOldItem(item, findItem, _bill);

          items = items.filter(function (i) {
            return i.email != findItem.email;
          });
          items.push(_newItem);
        } else {
          var _bill2 = getBill(item, time);

          var _newItem2 = formatNewItem(item, _bill2);

          items.push(_newItem2);
        } //Set LS


        localStorage.setItem('items', JSON.stringify(items));
      }
    },
    getItemsFromStorage: function getItemsFromStorage() {
      var items;

      if (localStorage.getItem('items') === null) {
        items = [];
      } else {
        items = JSON.parse(localStorage.getItem('items'));
      }

      return items;
    },
    updateItemStorage: function updateItemStorage(updateItem) {
      var items = JSON.parse(localStorage.getItem('items'));
      items.forEach(function (item, index) {
        if (updateItem.id === item.id) {
          items.splice(index, 1, updateItem);
        }
      }); //Re set LS

      localStorage.setItem('items', JSON.stringify(items));
    },
    deleteItemFromStorage: function deleteItemFromStorage(id) {
      var items = JSON.parse(localStorage.getItem('items'));
      items.forEach(function (item, index) {
        if (id === item.id) {
          items.splice(index, 1);
        }
      }); //Re set LS

      localStorage.setItem('items', JSON.stringify(items));
    },
    clearItemsFromStorage: function clearItemsFromStorage() {
      localStorage.removeItem('items');
    }
  };
}(); // App Controller


var App = function (StorageCtrl) {
  var myForm = document.getElementById('request-form'); // Load event listener

  var loadEventListener = function loadEventListener() {
    // Form submit event listener
    myForm.addEventListener('submit', submitForm);
  };

  var submitForm = function submitForm(event) {
    event.preventDefault();
    var form = event.target;

    var body = _toConsumableArray(new FormData(form));

    var newBody = {};
    body.map(function (item) {
      newBody[item[0]] = item[1];
    });
    console.log(newBody);
    StorageCtrl.storeItems(newBody);
    document.getElementById('success').innerText = "Your data was saved successfully";
    myForm.reset();
  }; // Public Method


  return {
    init: function init() {
      // Load event listener
      loadEventListener();
    }
  };
}(StorageCtrl); //Initialize App


App.init();