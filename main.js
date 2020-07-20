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
        bill
    }
  }

  const formatOldItem = (item, oldItem, bill) => {
    return {
        ...oldItem,
        name: item.name,
        address: item.address,
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



// App Controller
const App = (function(StorageCtrl) {
  const myForm = document.getElementById('request-form')
  // Load event listener
  const loadEventListener = function() {

      // Form submit event listener
      myForm.addEventListener('submit', submitForm)
  }

  const submitForm = event => {
    event.preventDefault();
    const form = event.target;
    const body = [...(new FormData(form))]
    const newBody = {}
    body.map((item) => {
      newBody[item[0]] = item[1]
    })
    console.log(newBody)
    StorageCtrl.storeItems(newBody)
    document.getElementById('success').innerText = "Your data was saved successfully"
    myForm.reset()
  }

  // Public Method
  return {
      init: function() {
          // Load event listener
          loadEventListener();
      }
  }

})(StorageCtrl);

//Initialize App
App.init();