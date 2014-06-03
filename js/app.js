//me/albums?fields=id,name,photos.fields(source,name).since(3 months ago).limit(300)&limit=500&since=3 months ago
var app = angular.module('PersonsApp',['ngRoute','facebook'])

app.controller("HomeController" , function($scope, AuthServ){

  $scope.message = "Welcome to my Angular app";

  $scope.logout = function(){
    AuthServ.logout();
  }
  
});


app.config(function ($routeProvider) {
  $routeProvider
  .when('/home', {
    controller: 'HomeController',
    templateUrl: 'home.html'

  }).when('/login', {
    controller: 'AuthenticationCtrl',
    templateUrl: 'partials/login.html'
  }).when('/album', {
    controller: 'AlbumsCtrl',
    templateUrl: 'partials/album.html'
  }).otherwise({
    redirectTo: '/login'
  });
});

app.config(['FacebookProvider', function(FacebookProvider) {
     // Here you could set your appId through the setAppId method and then initialize
     // or use the shortcut in the initialize method directly.
     FacebookProvider.init('447417768647550');
   }]);


app.directive('ipakitaAngMessagePagHover', function(){

  return {
    restrict: 'A',
    link: function(scope, element, attributes){
      var origMsg = scope.message;
      element.bind('mouseover',function(){
        scope.message = attributes.message;
        scope.$apply();
      });
      element.bind('mouseout',function(){
        scope.message = origMsg;
        scope.$apply();
      });
    }
  }

});

app.directive('debug', function() {
  return {
    restrict: 'E',
    scope: {
      expression: '=val'
    },
    template: '<pre>{{debug(expression)}}</pre>',
    link: function(scope) {
        // pretty-prints
        scope.debug = function(exp) {
          return angular.toJson(exp, true);
        };
      }
    }
  });





app.controller('AlbumsCtrl', ['$scope','$location','$http','Facebook',function($scope,$location,$http,Facebook) {
    $scope.selectedAlbum = {};
    $scope.albums = {};
    $scope.profilepic = {};
   $scope.IntentLogin = function() {
    Facebook.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        
         Facebook.api('/me', function(response) {
          $scope.$apply(function() {
            // Here you could re-check for user status (just in case)
            $scope.user = response;
            console.log(response)
          });
        });

         Facebook.api('/me/picture', function(response) {
          $scope.$apply(function() {
            // Here you could re-check for user status (just in case)
            $scope.profilepic = response.data;
            console.log(response)
          });
        });

        

        $http.get('resources/photos.json').success(function(res){
              
              $scope.albums = res.data;
        });
      }
      else {
        $scope.$apply(function(){
            $location.url('/login');

        })
        
      }
    });
  };
  $scope.IntentLogin();

  $scope.selectAlbum = function(album){
      $scope.selectedAlbum = album.photos.data;
  }
  

}]);

app.controller('AuthenticationCtrl', ['$scope','$http', '$location', 'Facebook',function($scope,$http,$location, Facebook) {

  $scope.loggedIn = false;
  $scope.user = {};
  $scope.photos = {};

  
  

  // Here, usually you should watch for when Facebook is ready and loaded
  $scope.$watch(function() {
    return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
  }, function() {
    $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
  });

  // From now on you can use the Facebook service just as Facebook api says
  // Take into account that you will need $scope.$apply when inside a Facebook function's scope and not angular
  $scope.login = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status == 'connected') {
        $scope.me(); 
        $scope.$apply(function() {
          $scope.loggedIn = true;
          $location.url('/album');
         
        });
      }else{
        Facebook.login(function(response) {
            $scope.getLoginStatus();

        });
      }
    });
  };


  $scope.login();
  /**
   * IntentLogin
   */
   $scope.IntentLogin = function() {
    Facebook.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        $scope.logged = true;
        $scope.me(); 
      }
      else
        $scope.login();
    });
  };

  $scope.logout = function(){
    Facebook.logout(function(response){  
        $window.location.reload();
    });
  }
  
  $scope.getLoginStatus = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status == 'connected') {
        $scope.me(); 
        $scope.$apply(function() {
         $scope.loggedIn = true;

       });
      } else {

        $scope.$apply(function() {
          $scope.loggedIn = false;
        });

      }
    })
  };

  $scope.me = function() {
    Facebook.api('/me', function(response) {
      $scope.$apply(function() {
        // Here you could re-check for user status (just in case)
        $scope.user = response;
      });
    });
  };
}]);