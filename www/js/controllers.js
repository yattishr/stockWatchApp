angular.module('stockWatchApp.controllers', [])

.controller('AppCtrl', ['$scope', 'modalService', 'userService',
  function($scope, modalService, userService) {
    $scope.modalService = modalService;
    $scope.logout = function() {
      userService.logout();
    };
}])

// code below for displaying the stock ticker info on my-stocks.html page.
// the controller populates all the default stocks when the app launches
.controller('MyStocksCtrl',['$scope', 'myStocksArrayService', 'stockDataService', 'stockPriceCacheService',
function($scope, myStocksArrayService, stockDataService, stockPriceCacheService) {

  // set the listener.
  $scope.$on("$ionicView.afterEnter", function() {
    $scope.getMyStocksData();
  });

  // call getMyStocksData to fetch the data.
  $scope.getMyStocksData = function() {
    // iterate through each stock ticker.
    myStocksArrayService.forEach(function(stock) {
      var promise =  stockDataService.getPriceData(stock.ticker);
      // deine scope variable to store the myStocksData.
      $scope.myStocksData = [];

      //  promise variable for pushing the data into the CacheService.
      promise.then(function(data) {
        $scope.myStocksData.push(stockPriceCacheService.get(data.symbol));
      });
    });

  // scope variable for pull-to-refresh component.
  $scope.$broadcast('scroll.refreshComplete');

  };
  // load the default stock ticker objects from the myStocksArrayService
  // $scope.myStocksArray = myStocksArrayService;
  // console.log(myStocksArrayService);


  // scope variable for unfollowing stock with slide option button.
  $scope.unfollowStock = function(ticker) {
    followStocksService.unfollow(ticker);
    $scope.getMyStocksData();
  };

}])

// below is the controller for handling the stock-ticker info on stock.html page.
.controller('StockCtrl', ['$scope', '$stateParams', '$ionicPopup', 'stockDataService', 'notesService', 'dateService', 'newsService', 'followStocksService',
  function($scope, $stateParams, $ionicPopup, stockDataService, notesService, dateService, newsService, followStocksService) {

  // // get stock ticker info from YAHOO web service using http.get method.
  // $http.get("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=")
  //   .then(function(jsonData) {
  //     console.log('we are logging this...' + jsonData.data.query.results.quote);
  //   });

  // define a variable for our stock ticker.
  $scope.ticker = $stateParams.stockTicker;
  // define our chaarview variable.
  $scope.chartView = 1;
  // defina a $scope variable for our oneYearAgoDate.
  $scope.oneYearAgoDate = dateService.oneYearAgoDate();
  // define a $scope variable for our todayDate.
  $scope.todayDate = dateService.currentDate();
  // define a $scope array variable for storing our notes.
  $scope.stockNotes = [];
  // define a new $scope variable for our followStocksService. this is a boolean variable.
  $scope.following = followStocksService.checkFollowing($scope.ticker);

  console.log('Logging our currentDate: ' + dateService.currentDate());
  console.log('Logging our oneYearAgoDate: ' + dateService.oneYearAgoDate());

  // http://ionicframework.com/docs/v1/api/directive/ionView
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.$on("$ionicView.afterEnter", function() {
    getPriceData();
    getDetailsData();
    getNews();
    $scope.stockNotes = notesService.getNotes($scope.ticker);
    // $scope.toggleFollow();
  });

  // define our toggleFollow method, called from the stock.html page.
  $scope.toggleFollow = function() {
    // check whether we are already following then call followStocksService unfollow method.
    if($scope.following) {
      followStocksService.unfollow($scope.ticker);
      // set the $scope.following variable to boolean false.
      $scope.following = false;
      // log to console.
      console.log('un-following ticker:' + $scope.ticker);
    } else {
      // call the followStocksService follow method.
      followStocksService.follow($scope.ticker);
      // set the $scope.following variable to boolean true.
      $scope.following = true;
      // log to console.
      console.log('following ticker:' + $scope.ticker);
    }
  };

  // this function gets called from the stocks.html page.
  // here we handle the toggle of the day/week/mth/year chart buttons.
  $scope.chartViewFunc = function(n) {
    $scope.chartView = n;
  };


  // openWindow functionfor opening News Stories in a new Window. Call from stock.html
  $scope.openWindow = function(link) {
    // TO-DO install and setup inAppBrowser
    console.log("openWindow ==> " + link);
  };

  // addNote ionicPopup here.

  $scope.addNote = function() {
    $scope.note = {title: 'Note', body: '', date: $scope.todayDate, ticker: $scope.ticker};

    // An elaborate, custom popup
    var note = $ionicPopup.show({
      template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
      title: 'New Note for ' + $scope.ticker,
      // subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel',
          onTap: function(e) {
            return;
          }
        },
        {
          text: '<b>Save</b>',
          type: 'button-balanced',
          onTap: function(e) {
            // call our notesService for adding our Notes.
            notesService.addNotes($scope.ticker, $scope.note);
            console.log("save: ", $scope.note);
          }
        }
      ]
    });
    note.then(function(res) {
      // refresh our Notes card with the latest updated Note entries.
      $scope.stockNotes = notesService.getNotes($scope.ticker);
      console.log('Tapped!', res);
    });
    // $timeout(function() {
    //    note.close(); //close the popup after 3 seconds for some reason
    // }, 3000);
  };

  // show ionicPopup code end.


// Open an existing notes from the stock View.
$scope.openNote = function(index, title, body) {
  $scope.note = {title: title, body: body, date: $scope.todayDate, ticker: $scope.ticker};

  // An elaborate, custom popup
  var note = $ionicPopup.show({
    template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
    title: $scope.note.title,
    // subTitle: 'Please use normal things',
    scope: $scope,
    buttons: [
      {
        text: 'Delete',
        type: 'button-assertive button-small',
        onTap: function(e) {
          notesService.deleteNotes($scope.ticker, index);
        }
      },

      { text: 'Cancel',
        type: 'button-small',
        onTap: function(e) {
          return;
        }
      },
      {
        text: '<b>Save</b>',
        type: 'button-balanced button-small',
        onTap: function(e) {
          // delete an existing note, without creating a new Note.
          notesService.deleteNotes($scope.ticker, index);
          // then call our addNotes notesService for updating our Note.
          notesService.addNotes($scope.ticker, $scope.note);
          console.log("save: ", $scope.note);
        }
      }
    ]
  });
  note.then(function(res) {
    // refresh our Notes card with the latest updated Note entries.
    $scope.stockNotes = notesService.getNotes($scope.ticker);
    console.log('Tapped!', res);
  });
  // $timeout(function() {
  //    note.close(); //close the popup after 3 seconds for some reason
  // }, 3000);
};
// Open an existing notes from the stock View. Code end.


  // function below for retrieving our news feed from our News Feed factory service.
  function getNews() {
    $scope.newsStories = [];
    var promise = newsService.getNews($scope.ticker);
    promise.then(function(data) {
      // console.log('getNews: inside controllers.js...');
      $scope.newsStories = data;
      console.log('getNews: inside controllers.js...' + $scope.newsStories);
    });
  }

  // function below for fetching price data froom YAHOO web-service.
  function getPriceData() {
    // call our getPriceData service factory.
    var promise = stockDataService.getPriceData($scope.ticker);

    promise.then(function(data) {
      console.log('getPriceData: inside controllers.js...');
      console.log('logging our price data variable now...' + data);
      $scope.stockPriceData = data;
    });
  }

  // function below for fetching detail price data froom YAHOO web-service.
  function getDetailsData() {
    // call our getDetailsData service factory.
    var promise = stockDataService.getDetailsData($scope.ticker);

    promise.then(function(data) {
      console.log('getDetailsData: inside controllers.js...');
      console.log('logging our detail data variable now...' + data);
      $scope.stockDetailsData = data;

      if(data.Change >= 0 && data !==null) {
        $scope.reactiveColor = {'background-color': '#33cd5f', 'border-color': 'rgba(255,255,255,.3)'};
        console.log('We are in one...' + 'ChangeinPercent: ' + data.Change);
      }
        else if(data.Change < 0 && data !== null) {
          $scope.reactiveColor = {'background-color': '#ef473a', 'border-color': 'rgba(0,0,0,.2)'};
          console.log('We are in two...' + 'ChangeinPercent: ' + data.Change);
        }
    });
  }

}])

// our AboutCtrl controller code goes here.
.controller('AboutCtrl', ['$scope', '$state','modalService', function($scope, $state, modalService) {
  $scope.closeModal = function() {
    modalService.closeModal();
  };
}])


// our SearchCtrl controller code goes here.
.controller('SearchCtrl', ['$scope', '$state','modalService', 'searchService', function($scope, $state, modalService, searchService) {
  $scope.closeModal = function() {
    modalService.closeModal();
  };

  // initialize the Search function.
  $scope.search = function() {
    $scope.searchResults = "";
    startSearch($scope.searchQuery);
  };

  // define a variable searchService passing in our search Query.
  // use ionic.debounce to delay the search service by 750 seconds.
  var startSearch = ionic.debounce(function(query) {
    searchService.search(query)
    .then(function(data) {
      $scope.searchResults = data;
    });
  }, 400);

  // call the goToStock function passing in the stock ticker selected from the searchResults.
  $scope.goToStock = function(ticker) {
    modalService.closeModal();
    $state.go('app.stock', {stockTicker: ticker});
  };

}])

// our LoginSignupCtrl controller code goes here.
.controller('LoginSignupCtrl', ['$scope', 'modalService', 'userService', function($scope, modalService, userService) {

  // define a scope variable for the user object.
  $scope.user = {email: '', password: ''};

  // close the login modal window.
  $scope.closeModal = function() {
    modalService.closeModal();
  };

  // call the signup function.
  $scope.signup = function(user) {
    userService.signup(user);
  };

  // call the login function.
  $scope.login = function(user) {
    userService.login(user);
  };

}]);
