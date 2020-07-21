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
}();

var ItemCtrl = function () {
  return {
    sortArray: function sortArray(_incomingArray) {
      var _sortField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "bill";

      var _sortOrder = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "asc";

      var result = [];
      result = _incomingArray.sort(function (a, b) {
        if (a[_sortField] < b[_sortField]) {
          return _sortOrder === "asc" ? 1 : -1;
        }

        if (a[_sortField] > b[_sortField]) {
          return _sortOrder === "asc" ? -1 : 1;
        }

        return 0;
      });
      return result;
    },
    baseFilter: function baseFilter(_entities, _filter) {
      var _filtrationFields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      // Filtration
      var entitiesResult = ItemCtrl.searchInArray(_entities, _filter, _filtrationFields);
      var result = ItemCtrl.sortArray(entitiesResult);
      return result;
    },
    searchInArray: function searchInArray(_incomingArray, _queryObj) {
      var _filtrationFields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      var result = [];
      var resultBuffer = [];
      var indexes = [];
      var firstIndexes = [];
      var doSearch = false;

      _filtrationFields.forEach(function (item) {
        if (item in _queryObj) {
          _incomingArray.forEach(function (element, index) {
            if (element[item] === _queryObj[item]) {
              firstIndexes.push(index);
            }
          });

          firstIndexes.forEach(function (element) {
            resultBuffer.push(_incomingArray[element]);
          });
          _incomingArray = resultBuffer.slice(0);
          resultBuffer = [].slice(0);
          firstIndexes = [].slice(0);
        }
      });

      Object.keys(_queryObj).forEach(function (key) {
        var searchText = _queryObj[key].toString().trim().toLowerCase();

        if (key && !_filtrationFields.some(function (e) {
          return e === key;
        }) && searchText) {
          doSearch = true;

          try {
            _incomingArray.forEach(function (element, index) {
              if (element[key] || element[key] === false && searchText === "false") {
                var _val = element[key].toString().trim().toLowerCase();

                if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
                  indexes.push(index);
                }
              }
            });
          } catch (ex) {
            console.log(ex, key, searchText);
          }
        }
      });

      if (!doSearch) {
        return _incomingArray;
      }

      indexes.forEach(function (re) {
        result.push(_incomingArray[re]);
      });
      return result;
    }
  };
}();

var PageCtrl = function (StorageCtrl, ItemCtrl) {
  var noPerPage = 3;
  var objJson = ItemCtrl.sortArray(StorageCtrl.getItemsFromStorage());
  var current_page = 1;
  var records_per_page = objJson.length < noPerPage ? objJson.length : noPerPage;

  var numPages = function numPages() {
    if (objJson.length) return Math.ceil(objJson.length / records_per_page);
    return 0;
  };

  return {
    prevPage: function prevPage() {
      if (current_page > 1) {
        current_page -= 1;
        PageCtrl.changePage(current_page);
      }
    },
    nextPage: function nextPage() {
      if (current_page < numPages()) {
        current_page += 1;
        PageCtrl.changePage(current_page);
      }
    },
    searchPage: function searchPage(event) {
      event.preventDefault();
      var value = event.target.value;
      var filter = {
        email: value,
        name: value
      };
      objJson = ItemCtrl.baseFilter(StorageCtrl.getItemsFromStorage(), filter);
      current_page = 1;
      records_per_page = objJson.length < noPerPage ? objJson.length : noPerPage;
      PageCtrl.changePage(1);
    },
    changePage: function changePage() {
      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var btnNext = document.getElementById("btn-next");
      var btnPrev = document.getElementById("btn-prev");
      var listingTable = document.getElementById("listing-table");
      var pageSpan = document.getElementById("page"); // Validate page

      if (page < 1) page = 1;
      if (page > numPages()) page = numPages();
      listingTable.innerHTML = "";

      if (objJson.length) {
        var step = page * records_per_page;
        pageSpan.innerHTML = "page: ".concat(page, " / ").concat(Math.ceil(objJson.length / records_per_page));

        for (var i = (page - 1) * records_per_page; i < (step < objJson.length ? step : objJson.length); i++) {
          listingTable.innerHTML += "\n            <tr class=\"data-table_tr\">\n              <td>\n                <span>\n                  ".concat(objJson[i].email, "\n                </span>\n              </td>\n              <td>\n                <span>\n                  ").concat(objJson[i].name, "\n                </span>\n              </td>\n              <td>\n                <span>\n                  ").concat(objJson[i].address, "\n                </span>\n              </td>\n              <td>\n                <span>\n                  $").concat(objJson[i].bill, "\n                </span>\n              </td>\n              <td>\n                <span>\n                  <button disabled type=\"button\" class=\"btn-ctl\" id=\"btn-pay\">Pay Bill</button>\n                </span>\n              </td>\n            </tr>\n          ");
        }
      } else {
        listingTable.innerHTML = "<p>No data found</p>";
        pageSpan.innerHTML = ""; // btnPrev.setAttribute("disable", true);
        // btnNext.removeAttribute("disable");
      }

      if (page == 1) {
        btnPrev.setAttribute("disabled", true);
      } else {
        btnPrev.removeAttribute("disabled");
      }

      if (page == numPages()) {
        btnNext.setAttribute("disabled", true);
      } else {
        btnNext.removeAttribute("disabled");
      }
    }
  };
}(StorageCtrl, ItemCtrl); // App Controller


var App = function (StorageCtrl, PageCtrl) {
  var myForm = document.getElementById('request-form');
  var btnNext = document.getElementById("btn-next");
  var btnPrev = document.getElementById("btn-prev");
  var searchForm = document.getElementById("search-form"); // Load event listener

  var loadEventListener = function loadEventListener() {
    // Form submit event listener
    if (myForm) myForm.addEventListener('submit', submitForm);

    if (btnNext) {
      PageCtrl.changePage();
      btnPrev.addEventListener('click', PageCtrl.prevPage);
      btnNext.addEventListener('click', PageCtrl.nextPage);
      searchForm.addEventListener('input', PageCtrl.searchPage);
    }
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
    setTimeout(function () {
      document.getElementById('success').innerText = "";
    }, 3000);
    myForm.reset();
  }; // Public Method


  return {
    init: function init() {
      return loadEventListener();
    } // Load event listener

  };
}(StorageCtrl, PageCtrl); //Initialize App


App.init();
