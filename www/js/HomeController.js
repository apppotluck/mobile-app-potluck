 angular.module('potluck.controllers', [])
     .controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $location, API, $facebook, jwtHelper, $localStorage,$state) {
         // With the new view caching in Ionic, Controllers are only called
         // when they are recreated or on app start, instead of every page change.
         // To listen for when this page is active (for example, to refresh data),
         // listen for the $ionicView.enter event:
         //$scope.$on('$ionicView.enter', function(e) {
         //});

         // Form data for the login modal
         $scope.loginData = {};

         // Create the login modal that we will use later
         $ionicModal.fromTemplateUrl('templates/login.html', {
             scope: $scope
         }).then(function(modal) {
             $scope.modal = modal;
         });

         // Open the login modal
         $scope.login = function() {
             $scope.modal.show();
         };

         $scope.constants = constants;
         $scope.invalidUser = false;
         // if(typeof $localStorage.token !== "undefined") {
         //     $location.path('events');
         // }
         // When the user clicks to fb connect
         $scope.fbLogin = function() {
             $facebook.login().then(function() {
                 refresh();
             });
         };

         function refresh() {
             $facebook.api("/me?fields=id,name,email,picture").then(
                 function(response) {
                     response.register_by = 'facebook';
                     API.authAndRegister(response);
                 },
                 function(err) {
                     $scope.welcomeMsg = "Please log in";
                 });
         };
         // Perform the login action when the user submits the login form
         $scope.doLogin = function() {
             loginModelObject.email = $scope.loginData.email;
             loginModelObject.password = $scope.loginData.password;
             appConfig.serviceAPI.authAPI(API, function(result) {
                 if (result.responseData.message === "success") {
                     $localStorage.token = result.responseData.token;
                     // $state.go('app.eventslist')
                     // $state.go('tabs.home');
                     $state.go('events.home')
                 } else {
                     $scope.invalidUser = true;
                 }
             }, function(err) {
                 console.log(err);
             }, loginModelObject);

         };
     })



 .controller('LoginCtrl', function($scope) {

 })

 .controller('RegisterCtrl', function($scope, API,
         $location,
         $rootScope,
         $q,
         jwtHelper,
         $localStorage,$state) {
         $scope.constants = constants;
         $scope.isError = false;
         $scope.errorMessage = "";
         $scope.user={};
         $scope.submitForm = function() {
             $scope.user.register_by = 'local';
             appConfig.serviceAPI.registerUser(API, function(response) {
                 if (response.responseData.message === "success") {
                     $localStorage.token = response.responseData.token;
                     $state.go('app.eventslist')
                 } else if (response.responseData.message === "fail") {
                     $scope.isError = true;
                     $scope.errorMessage = response.responseData.error;
                 }
             }, function(err) {
                 console.log(err);
             }, $scope.user);
         }
     })
     .controller('IntroCtrl', ['$scope', '$location', '$state', function($scope, $location, $state) {
         $scope.slides = [{
             "titleText": "Create Event & Invite Friends in ease1.",
             "subTitle": "Register for FREE and Create an event and Invite in less then few seconds.",
             "image": constants.imagePath+"01-Splash-Screens.png",
             "cssName": ""
         }, {
             "titleText": "Create Event & Invite Friends in ease2.",
             "subTitle": "Register for FREE and Create an event and Invite in less then few seconds.",
             "image": constants.imagePath+"02-Intro-Screen-1.png",
             "cssName": "violet"
         }, {
             "titleText": "Create Event & Invite Friends in ease3.",
             "subTitle": "Register for FREE and Create an event and Invite in less then few seconds.",
             "image": constants.imagePath+"03-Intro-Screen-2.png",
             "cssName": "green"
         }, {
             "titleText": "Create Event & Invite Friends in ease4.",
             "subTitle": "Register for FREE and Create an event and Invite in less then few seconds.",
             "image": constants.imagePath+"04-Intro-Screen-3.png",
             "cssName": "blue"
         }, {
             "titleText": "Create Event & Invite Friends in ease4.",
             "subTitle": "Register for FREE and Create an event and Invite in less then few seconds.",
             "image": constants.imagePath+"05-Intro-Screen-4.png",
             "cssName": "blue"
         }, {
             "titleText": "Create Event & Invite Friends in ease4.",
             "subTitle": "Register for FREE and Create an event and Invite in less then few seconds.",
             "image": constants.imagePath+"06-Intro-Screen-5.png",
             "cssName": "blue"
         }]
         $scope.startApp = function() {
             $state.go('app.login');
         };
         $scope.next = function() {
             $ionicSlideBoxDelegate.next();
         };
         $scope.previous = function() {
             $ionicSlideBoxDelegate.previous();
         };

         // Called each time the slide changes
         $scope.slideChanged = function(index) {
             $scope.slideIndex = index;
             if(index === 5) {
                $state.go('app.login')
             }
         };
     }])