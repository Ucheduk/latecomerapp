// Local Storage Controller
const StorageCtrl = (function() {
  const getBill = (item, time) => {
    const resumptionTime = time.split(':')
    const arrivalTime = item.time.split(':')
    const a = moment().hour(resumptionTime[0]).minute(resumptionTime[1])
    const b = moment().hour(arrivalTime[0]).minute(arrivalTime[1])
    const diff = moment.duration(b.diff(a)).as('minutes')
    if (diff > 0) return +(diff * 0.2).toFixed(2)
    return 0
  }

  const formatNewItem = (item, bill) => {
    const { time, ...newItem  } = item
    return {
        ...newItem,
        last_date: new Date().toDateString(),
        bill
    }
  }

  const formatOldItem = (item, oldItem, bill) => {
    return {
        ...oldItem,
        name: item.name,
        address: item.address,
        last_date: new Date().toDateString(),
        bill: +(oldItem.bill + bill).toFixed(2)
    }
  }
  // Public Methods
  return {
      storeItems: function(item) {
          let time = '08:30'
          const resumptionTime = document.getElementById('resumption-time')
          if (resumptionTime.value) time = resumptionTime.value
          let items;
          // Check if any item in LS
          if(localStorage.getItem('items') === null) {
              items = [];
              // Push new item
              const bill = getBill(item, time)
              const newItem = formatNewItem(item, bill)
              items.push(newItem)

              // Set LS
              localStorage.setItem('items', JSON.stringify(items));
          } else {
              // Get items in LS
              items = JSON.parse(localStorage.getItem('items'));

              const findItem = items.find(i => i.email === item.email)

              // Push new item or edit old item
              if (findItem) {
                const bill = getBill(item, time)
                const newItem = formatOldItem(item, findItem, bill)
                items = items.filter(i => i.email != findItem.email)
                items.push(newItem)
              }
              else {
                const bill = getBill(item, time)
                const newItem = formatNewItem(item, bill)
                items.push(newItem)
              }

              //Set LS
              localStorage.setItem('items', JSON.stringify(items));
          }
      },
      getItemsFromStorage: function() {
          let items;
          
          if(localStorage.getItem('items') === null) {
              items = [];
          } else {
              items = JSON.parse(localStorage.getItem('items'));
          }

          return items;
      },
      getItemFromStorage: function(item) {
        let items = StorageCtrl.getItemsFromStorage();
        const result = items.filter(i => i.email === item.email);

        return result;
      },
      updateItemStorage: function(updateItem) {
          let items = JSON.parse(localStorage.getItem('items'));

          items.forEach(function(item, index) {
              if(updateItem.id === item.id) {
                  items.splice(index, 1, updateItem);
              }
          });
          //Re set LS
          localStorage.setItem('items', JSON.stringify(items));
      },
      deleteItemFromStorage: function(id) {
          let items = JSON.parse(localStorage.getItem('items'));

          items.forEach(function(item, index) {
              if(id === item.id) {
                  items.splice(index, 1);
              }
          });
          //Re set LS
          localStorage.setItem('items', JSON.stringify(items)); 
      },
      clearItemsFromStorage: function() {
          localStorage.removeItem('items')
      }
  }
})();


const ItemCtrl = (function() {

  return {

    sortArray: (_incomingArray, _sortField = "bill", _sortOrder = "asc") => {
      let result = [];
      result = _incomingArray.sort((a, b) => {
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

    baseFilter: (_entities, _filter, _filtrationFields = []) => {
      // Filtration
      let entitiesResult = ItemCtrl.searchInArray(
        _entities,
        _filter,
        _filtrationFields
      );

      const result = ItemCtrl.sortArray(entitiesResult)

      return result;
    },

    searchInArray: (_incomingArray, _queryObj, _filtrationFields = []) => {
      const result = [];
      let resultBuffer = [];
      const indexes = [];
      let firstIndexes = [];
      let doSearch = false;
  
      _filtrationFields.forEach(item => {
        if (item in _queryObj) {
          _incomingArray.forEach((element, index) => {
            if (element[item] === _queryObj[item]) {
              firstIndexes.push(index);
            }
          });
          firstIndexes.forEach(element => {
            resultBuffer.push(_incomingArray[element]);
          });
          _incomingArray = resultBuffer.slice(0);
          resultBuffer = [].slice(0);
          firstIndexes = [].slice(0);
        }
      });
  
      Object.keys(_queryObj).forEach(key => {
       const searchText = _queryObj[key]
          .toString()
          .trim()
          .toLowerCase();
        if (key && !_filtrationFields.some(e => e === key) && searchText) {
          doSearch = true;
          try {
            _incomingArray.forEach((element, index) => {
              if (element[key] || (element[key] === false && searchText === "false")) {
                const _val = element[key]
                  .toString()
                  .trim()
                  .toLowerCase();
                if (
                  _val.indexOf(searchText) > -1 &&
                  indexes.indexOf(index) === -1
                ) {
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
  
      indexes.forEach(re => {
        result.push(_incomingArray[re]);
      });
  
      return result;
    },

    
  }
})();


const PageCtrl = (function(StorageCtrl, ItemCtrl) {
  
  const noPerPage = 3
  let objJson = ItemCtrl.sortArray(StorageCtrl.getItemsFromStorage());
  let current_page = 1;
  let records_per_page = objJson.length < noPerPage ? objJson.length : noPerPage;

  const numPages = () => {
    if (objJson.length) return Math.ceil(objJson.length / records_per_page);
    return 1;
  }

  return {
    prevPage: () => {
      if (current_page > 1) {
        current_page -= 1;
        PageCtrl.changePage(current_page);
      }
    },

    nextPage: () => {
      if (current_page < numPages()) {
        current_page += 1;
        PageCtrl.changePage(current_page);
      }
    },

    searchPage: (event) => {
      event.preventDefault()
        
      const { value } = event.target
      const filter = {
        email: value,
        name: value
      }
      objJson = ItemCtrl.baseFilter(StorageCtrl.getItemsFromStorage(), filter);
      current_page = 1;
      records_per_page = objJson.length < noPerPage ? objJson.length : noPerPage;
      PageCtrl.changePage(1);
    },

    changePage: (page=1) => {
      const btnNext = document.getElementById("btn-next");
      const btnPrev = document.getElementById("btn-prev");
      const listingTable = document.getElementById("listing-table");
      const pageSpan = document.getElementById("page");
    
      // Validate page
      if (page < 1) page = 1;
      if (page > numPages()) page = numPages();

      listingTable.innerHTML = "";
  
      if (objJson.length) {
        const step = page * records_per_page 
        pageSpan.innerHTML = `page: ${page} / ${Math.ceil(objJson.length / records_per_page)}`;
        for (let i = (page - 1) * records_per_page; i < (step < objJson.length ? step : objJson.length); i++) {
          listingTable.innerHTML += `
            <tr class="data-table_tr">
              <td>
                <span>
                  ${objJson[i].email}
                </span>
              </td>
              <td>
                <span>
                  ${objJson[i].name}
                </span>
              </td>
              <td>
                <span>
                  ${objJson[i].address}
                </span>
              </td>
              <td>
                <span>
                  ${objJson[i].last_date}
                </span>
              </td>
              <td>
                <span>
                  $${objJson[i].bill}
                </span>
              </td>
              <td>
                <span>
                  <button disabled type="button" class="btn-ctl" id="btn-pay">Pay Bill</button>
                </span>
              </td>
            </tr>
          `;
        }
        
      } else {
        listingTable.innerHTML = "<p>No data found</p>";
        pageSpan.innerHTML = "";
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
    },
  }
})(StorageCtrl, ItemCtrl);


// App Controller
const App = ((StorageCtrl, PageCtrl) => {
  const myForm = document.getElementById('request-form')
  const btnNext = document.getElementById("btn-next");
  const btnPrev = document.getElementById("btn-prev");
  const searchForm = document.getElementById("search-form");
  // Load event listener
  const loadEventListener = () => {
    
    // Form submit event listener
    if (myForm) myForm.addEventListener('submit', submitForm)
    if (btnNext) {
      PageCtrl.changePage();
      btnPrev.addEventListener('click', PageCtrl.prevPage)
      btnNext.addEventListener('click', PageCtrl.nextPage)
      searchForm.addEventListener('input', PageCtrl.searchPage)
    }
  }

  const checkDateSubmitData = (item) => {
    const foundItem = StorageCtrl.getItemFromStorage(item)
    if (foundItem.length && foundItem.last_date === new Date().toDateString()) {
      StorageCtrl.storeItems(item)
      document.getElementById('success').innerText = "Your data was saved successfully"
      setTimeout(() => {
        document.getElementById('success').innerText = ""
      }, 3000);
    } 
    if (!foundItem.length) {
      StorageCtrl.storeItems(item)
      document.getElementById('success').innerText = "Your data was saved successfully"
      setTimeout(() => {
        document.getElementById('success').innerText = ""
      }, 3000);
    } 
    else {
      document.getElementById('error').innerText = "Your data has already been saved today"
      setTimeout(() => {
        document.getElementById('error').innerText = ""
      }, 3000);
    }
  }

  const submitForm = event => {
    event.preventDefault();
    const form = event.target;
    const body = [...(new FormData(form))]
    const newBody = {}
    body.map((item) => {
      newBody[item[0]] = item[1]
    })
    checkDateSubmitData(newBody)
    myForm.reset()
  }

  // Public Method
  return {
      init: () => loadEventListener() // Load event listener
  }

})(StorageCtrl, PageCtrl);

//Initialize App
App.init();