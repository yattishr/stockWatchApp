angular.module('stockWatchApp.services', [])

// instantiate our FIREBASE connection.
.constant('FIREBASE_URL', 'https://stock-watch-app.firebaseio.com/')

// factory service for the FIREBASE connection
.factory('firebaseRef', function($firebase, FIREBASE_URL) {
  var firebaseRef = new Firebase(FIREBASE_URL);
  return firebaseRef;
})

// factory service userService for handling user logins.
.factory('userService', function($rootScope, firebaseRef, modalService) {

  // login function code below.
  var login = function(user) {
    firebaseRef.authWithPassword({
      email    : user.email,
      password : user.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        $rootScope.currentUser = user;
        modalService.closeModal();
        console.log("Authenticated successfully with payload:", authData);
      }
    });
  };

  // signup function code below.
  var signup = function(user) {
    firebaseRef.createUser({
      email    : user.email,
      password : user.password
    }, function(error, userData) {
      if (error) {
        console.log("Error creating user:", error);
      } else {
        login(user);
        console.log("Successfully created user account with uid:", userData.uid);
      }
    });
  };

  var getUser = function() {
    return firebaseRef.getAuth();
  };

  if(getUser()) {
    $rootScope.currentUser = getUser();
  }

  var logout = function() {
    firebaseRef.unauth();
    $rootScope.currentUser = '' ;
  };

  return {
    login: login,
    signup: signup,
    logout: logout
  };
})


// factory service code below for encoding URI service. This is to make our API queries cleaner, and for encoding our URI string.
.factory('encodeURIService', function() {
    return {
          encode: function(string) {
                  return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/[!'()]/g, escape);
          }
    };
})

// factory service for our SearchCtrl.
// .factory('searchService', function($q, $http) {
//   return {
//     search: function(query) {
//       var deferred = $q.defer(),
//       url = "https://s.yimg.com/aq/autoc?query=" + query + "&region=CA&lang=en-CA&callback=YAHOO.util.ScriptNodeDataSource.callbacks";
//       // url = "http://d.yimg.com/aq/autoc?query=" + query + "&region=US&lang=en-US"; // try this url instead. y.r 2017-04-20
//       YAHOO = window.YAHOO = {
//         Finance: {
//           SymbolSuggest: {}
//         }
//       };
//       YAHOO.Finance.SymbolSuggest.ssCallBack = function(data) {
//         var jsonData = data.ResultSet.Result;
//         console.log('in here...');
//         deferred.resolve(jsonData);
//       };
//       $http.jsonp(url)
//       .then(YAHOO.Finance.SymbolSuggest.ssCallBack);
//       console.log('now in here...');
//       return deferred.promise;
//     }
//   };
// })

// new factory service for implementing the search functionality.
.factory('searchService', function($q, $http) {
return {
  search: function(query) {
    // create a que 'deferred' to store our data retrieved from the server.
    var deferred = $q.defer(),
    // config = {
    //   headers: {Origin: 'Access-Control-Allow-Origin: *'}
    // },
    urlString = "http://d.yimg.com/aq/autoc?query=" + query + "&region=US&lang=en-US";
    // get stock ticker info from YAHOO web service using http.get method.
    $http.get(urlString)
      .then(function(json) {

        // store our info from url into JSON, on success.
        var jsonData = data.ResultSet.Result;
        console.log('logging our json search data to console...' + jsonData);

        // resolve our data retrieved from the que into JSON.
        deferred.resolve(jsonData);
      })
      .catch(function(error) {
        // log an error to console.
        console.log("Error getting Search data: " + error);

        // reject the que on error.
        deferred.reject();
      });

      // return the data after the promise.
      return deferred.promise;
    }
  };
})
// end new factory service for implementing the search functionality.


// service for creating a modal view.
.service('modalService', function($ionicModal) {
  this.openModal = function(id) {
    // define a variable "_this" for referencing "this".
    var _this = this;


    if(id == 1) {
      // Create the search modal that we will use later
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: null,
        controller: 'SearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        // show the modal window.
        _this.modal.show();
      });
    } else if(id == 2) {
      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: null,
        controller: 'LoginSearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        // show the modal window.
        _this.modal.show();
      });
    } else if(id == 3) {
      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: null,
        controller: 'LoginSearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        // show the modal window.
        _this.modal.show();
      });
    } else if(id == 5) {
      // Create the About modal that we will use later
      $ionicModal.fromTemplateUrl('templates/about.html', {
        scope: null,
        controller: 'AboutCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        // show the modal window. AboutCtrl
        _this.modal.show();
      });
    }
};

  this.closeModal = function() {
    var _this = this;
    // if there is no modal in the current state, then we return out of the function.
    if(!_this.modal) return;
    // otherwise there is a modal open.
    _this.modal.hide(); // hide the modal.
    _this.modal.remove(); // then remove the modal.
  };

})


// factory service for filling My Stocks cache.
.factory('fillMyStocksCacheService', function(CacheFactory) {
  var myStocksCache;

  // check if the CacheFactory is not empty.
  if(!CacheFactory.get('myStocksCache')) {
    myStocksCache = CacheFactory('myStocksCache', {
      storageMode: 'localStorage'
    });
  } else {
    myStocksCache = CacheFactory.get('myStocksCache');
  }

  // Populate myStocksArray with the relevant stock tickers.
  var fillMyStocksCache = function() {
     var myStocksArray = [
      {ticker: "AAPL"},
      {ticker: "GPRO"},
      {ticker: "FB"},
      {ticker: "NFLX"},
      {ticker: "MSFT"},
      {ticker: "TSLA"},
      {ticker: "INTC"},
      {ticker: "GOOGL"},
      {ticker: "BRK-A"},
      {ticker: "TWTR"}
    ];

  // now we put the myStocksArray into the cache, myStocksCache.
  myStocksCache.put('myStocks', myStocksArray);
  };

  return {
    fillMyStocksCache: fillMyStocksCache
  };
})

// factory service for myStocksCacheService.
.factory('myStocksCacheService', function(CacheFactory) {
  var myStocksCache = CacheFactory.get('myStocksCache');
  return myStocksCache;
})

// factory for myStocksArray service used only for managing the myStocksArray.
// populate the myStocks list with the default stocks and only when the app first launches on the device.
// check whether a cache with the key myStocks exists in the myStocks cache
.factory('myStocksArrayService', function(fillMyStocksCacheService, myStocksCacheService) {

  // if the myStocksCacheService cannot get into from the CacheService with key 'myStocks', then call fillMyStocksCache
  if(!myStocksCacheService.info('myStocks')) {
    // call fillMyStocksCacheService to fillMyStocksCache.
    fillMyStocksCacheService.fillMyStocksCache();
  }

  var myStocks = myStocksCacheService.get('myStocks');
  return myStocks;
})


// factory service for following stocks. inject the myStocksArrayService & the myStocksCacheService.
.factory('followStocksService', function(myStocksArrayService, myStocksCacheService) {
  return {
    follow: function(ticker) {
      // define a variable for storing our stock to add into the array.
      var stockToAdd = {"ticker": ticker};

      // push the stockToAdd into the array.
      myStocksArrayService.push(stockToAdd);

      // now we put the new stock into the myStocksCacheService with the key of 'myStocks'.
      myStocksCacheService.put('myStocks', 'myStocksArrayService');
    },

    unfollow: function(ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if(myStocksArrayService[i].ticker == ticker) {
          // remove(splice) the stock with ticker code from the myStocksArrayService array.
          myStocksArrayService.splice(i, 1);
          // remove the stock from the myStocksCache, by calling the myStocksCacheService.
          myStocksCacheService.remove('myStocks');
          // reset the cache using the updated 'myStocks' array.
          myStocksCacheService.put('myStocks', myStocksArrayService);
          // break out of the for loop.
          break;
        }
      }
    },

    // this method is called from the 'toggleFollow' method in our ctonroller.
    checkFollowing: function(ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if(myStocksArrayService[i].ticker == ticker) {
          return true;
        }
      }
      return false;
    }
  };
})

// factory service for our Yahoo News feed web service.
.factory('newsService', function($q, $http) {
  return {
    getNews: function(ticker) {
      var deferred = $q.defer(),
      x2js = new X2JS(),
      url = 'http://finance.yahoo.com/rss/headline?s=' + ticker;

      $http.get(url)
      .success(function(xml) {
        console.log("Inside news feed service..." + xml);
        var xmlDoc = x2js.parseXmlString(xml),
        json = x2js.xml2json(xmlDoc);
        //json = x2js.xml_str2json(xml);
        console.log("json news data received..." + json);
        // json = x2js.xml2json(xmlDoc),
        json = json.res.channel.item;
        // jsonData = json.res.channel.item;
        console.log("News Feed service..." + json);
        deferred.resolve(json);
      })
      .error(function(error) {
        deferred.reject();
        console.log("News feed error returned from News Feed service: " + error);
      });
      return deferred.promise;
    }
  };
})


// factory service for caching our Notes.
.factory('notesCacheService', function(CacheFactory) {
  var notesCache;

  // check if anything exists in our notesCache, if not empty retrieve from localStorage. If it is empty GET the notesCache
  if(!CacheFactory.get('notesCache')) {
    notesCache = CacheFactory('notesCache', {
      storageMode: 'localStorage'
    });
  } else {
    notesCache = CacheFactory.get('notesCache');
  }
  return notesCache;
})

// factory service for our Note functionality. Inject the notesCacheService into notesService.
.factory('notesService', function(notesCacheService) {
  return {
    // fetch notes from the view.
    getNotes: function(ticker) {
      return notesCacheService.get(ticker);
    },

    // add a new note to the view.
    addNotes: function(ticker, note) {
      var stockNotes = [];
      if(notesCacheService.get(ticker)) {
        stockNotes = notesCacheService.get(ticker);
        stockNotes.push(note);
      } else {
        stockNotes.push(note);
      }
      notesCacheService.put(ticker, stockNotes);
    },

    // delete a note from the view
    deleteNotes: function(ticker, index) {
      var stockNotes = []; // declare empty array for storing our notes.
      stockNotes = notesCacheService.get(ticker); // fetch our notes from the notesCacheService.
      stockNotes.splice(index, 1); // remove the note with index of 'index'.
      notesCacheService.put(ticker, stockNotes); // put the remaining notes back into the view.
    }
  };
})

// factory service for handling caching of details data.
.factory('stockPriceCacheService', function(CacheFactory) {
  var stockPriceCache;

  if (!CacheFactory.get('stockPriceCache')) {
    stockPriceCache = CacheFactory('stockPriceCache', {
      maxAge: 5 * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });
  } else {
    stockPriceCache = CacheFactory.get('stockPriceCache');
  }
  return stockPriceCache;
})


// factory service for handling caching of details data.
.factory('stockDetailsCacheService', function(CacheFactory) {
  var stockDetailsCache;

  if (!CacheFactory.get('stockDetailsCache')) {
    stockDetailsCache = CacheFactory('stockDetailsCache', {
      maxAge: 5 * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });
  } else {
    stockDetailsCache = CacheFactory.get('stockDetailsCache');
  }
  return stockDetailsCache;
})

// our Date filter Service for current Date and one Year ago date.
.factory('dateService', function($filter) {
  var currentDate = function() {
    var d = new Date();
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };

  var oneYearAgoDate = function() {
    var d = new Date(new Date().setDate(new Date().getDate() - 365));
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };

  return {
    currentDate: currentDate,
    oneYearAgoDate: oneYearAgoDate
  };
})


// factory service code below for fetching Price data from YAHOO Web Service.
.factory('stockDataService', function($q, $http, encodeURIService, stockDetailsCacheService, stockPriceCacheService) {
  // get our Details data for our stock ticker.
  var getDetailsData = function(ticker) {
    // create a que 'deferred' to store our data retrieved from the server. defferred is an action that must be completed.
    var deferred = $q.defer(),
    cacheKey = ticker,
    // inject our Angular caching service.
    stockDetailsCache = stockDetailsCacheService.get(cacheKey),

    // assign our YAHOO url to a string variable.
    query = 'select * from yahoo.finance.quotes where symbol in ("' + ticker + '")',
    urlString = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=store://datatables.org/alltableswithkeys&callback=';

    console.log('Our query is: ' + query + ' Our urlString is: ' + urlString);

    // check if there is anything in our cache, then resolve the stockDetailsCache, ELSE we retrieve from the API once again.
    if(stockDetailsCache) {
      deferred.resolve(stockDetailsCache);
    }

    else {
      $http.get(urlString)
        .then(function(json) {

          // store our info from url into JSON, on success.
          var jsonData = json.data.query.results.quote;
          console.log('logging our json detail data to console...' + jsonData);

          // resolve (on success) our data retrieved from the que into JSON. successful completion of the deferred task
          deferred.resolve(jsonData);

          // put our stockData into our stockDetailsCache for Angular caching.
          stockDetailsCacheService.put(cacheKey, jsonData);
        })
        .catch(function(error) {
          // log an error to console.
          console.log("Error getting Details data: " + error);

          // reject the que on error(failure). unsuccessful completion of the deferred task.
          deferred.reject();
        });
    }
      // return the data after the promise. a promise is the result of our defferred action.
      return deferred.promise;
  };


  var getPriceData = function(ticker) {
    // create a que 'deferred' to store our data retrieved from the server. defferred is an action that must be completed.
    var deferred = $q.defer(),
    cacheKey = ticker,
    // inject our Angular caching service.
    stockPriceCache = stockPriceCacheService.get(cacheKey),

    // assign our YAHOO url to a string variable.
    query = 'select * from yahoo.finance.quotes where symbol in ("' + ticker + '")',
    urlString = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=store://datatables.org/alltableswithkeys&callback=';

    console.log('Our query is: ' + query + ' Our urlString is: ' + urlString);

    // check if there is anything in our cache, then resolve the stockPriceCache, ELSE we retrieve from the API once again.
    if(stockPriceCache) {
      deferred.resolve(stockPriceCache);
    }

    else {
      $http.get(urlString)
        .then(function(json) {

          // store our info from url into JSON, on success.
          var jsonData = json.data.query.results.quote;
          console.log('logging our json detail data to console...' + jsonData);

          // resolve (on success) our data retrieved from the que into JSON. successful completion of the deferred task
          deferred.resolve(jsonData);

          // put our stockData into our stockDetailsCache for Angular caching.
          stockPriceCacheService.put(cacheKey, jsonData);
        })
        .catch(function(error) {
          // log an error to console.
          console.log("Error getting Details data: " + error);

          // reject the que on error(failure). unsuccessful completion of the deferred task.
          deferred.reject();
        });
    }
      // return the data after the promise. a promise is the result of our defferred action.
      return deferred.promise;
  };

// return our Price data back to the controller.
return {
  getPriceData: getPriceData,
  getDetailsData: getDetailsData
};

});
