// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// var app = angular.module(appConfig.appName, ["ngRoute", "ui.bootstrap","ui.tinymce"]).config(["$routeProvider", "$httpProvider", "$compileProvider", "$provide",
var app = angular.module('potluck', ['ionic', 'ngStorage', 'angular-jwt', 'ngFacebook', 'ngCordova', 'potluck.controllers'])

.run(function($ionicPlatform) {

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);


        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        // var push = new Ionic.Push({
        //   "debug": true
        // });
        // push.register(function(token) {
        //     console.log("Device token:",token.token);
        // });

    });
    (function() {

        // If we've already installed the SDK, we're done
        if (document.getElementById('facebook-jssdk')) {
            return;
        }

        // Get the first script element, which we'll use to find the parent node
        var firstScriptElement = document.getElementsByTagName('script')[0];

        // Create a new script element and set its id
        var facebookJS = document.createElement('script');
        facebookJS.id = 'facebook-jssdk';

        // Set the new script's source to the source of the Facebook JS SDK
        facebookJS.src = '//connect.facebook.net/en_US/all.js';

        // Insert the Facebook JS SDK into the DOM
        firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $facebookProvider, $locationProvider,$ionicConfigProvider,$provide) {
    $facebookProvider.setAppId(constants.fbAppId);
    $ionicConfigProvider.tabs.position('bottom');
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
    $provide.decorator('$state', function($delegate, $stateParams) {
        $delegate.forceReload = function() {
            return $delegate.go($delegate.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
        };
        return $delegate;
    });
    
    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
        })
        .state('app.register', {
            url: '/register',
            views: {
                'menuContent': {
                    templateUrl: 'templates/register.html',
                    controller: 'RegisterCtrl'
                }
            }
        })
        .state('app.intro', {
            url: '/intro',
            views: {
                'menuContent': {
                    templateUrl: 'templates/intro.html',
                    controller: 'IntroCtrl'
                }
            }
        })
        .state('app.createevent', {
            url: '/create-event',
            views: {
                'menuContent': {
                    templateUrl: 'templates/events/create-event.html',
                    controller: 'CreateEventController'
                }
            }
        })
        .state('app.invitees', {
            url: '/invite-friends',
            views: {
                'menuContent': {
                    templateUrl: 'templates/events/invite-friends.html',
                    controller: 'InviteFriendsController'
                }
            }
        })
        .state('app.eventslist', {
            url: '/events-list',
            views: {
                'menuContent': {
                    templateUrl: 'templates/events/events.html',
                    controller: 'EventsController'
                }
            }
        })
        .state('app.login', {
            url: '/login',
            views: {
                'menuContent': {
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('events', {
            url: "/event",
            abstract: true,
            templateUrl: "templates/events/events.html"
        })
        .state('events.home', {
            url: "/upcoming",
            views: {
                'upcoming-events-tab': {
                    templateUrl: "templates/events/upcoming-events.html",
                    controller: 'EventsController'
                }
            }
        })
        .state('events.past', {
            url: "/past",
            views: {
                'past-events-tab': {
                    templateUrl: "templates/events/past-events.html",
                    controller: 'EventsController'
                }
            }
        })
        .state('details', {
            url: "/event-details",
            abstract: true,
            templateUrl: "templates/events/event-details.html",
            controller: 'EventDetailsController'
        })
        .state('details.home', {
            url: "/details/:eId",
            views: {
                'details-events-tab': {
                    templateUrl: "templates/events/details.html",
                    controller: 'EventDetailsController'
                }
            }
        })
        .state('details.menu', {
            url: "/menu/:eId",
            views: {
                'menu-events-tab': {
                    templateUrl: "templates/events/menu.html",
                    controller: 'EventMenuController'
                }
            }
        })
        .state('details.invitees', {
            url: "/invitees/:eId",
            views: {
                'invitees-events-tab': {
                    templateUrl: "templates/events/invitees.html",
                    controller: 'EventDetailsController'
                }
            }
        });
    $urlRouterProvider.otherwise('/app/login');
    // $urlRouterProvider.otherwise('/app/intro');
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
        return {
            'request': function(config) {
                // delete $httpProvider.defaults.headers.common['X-Requested-With'];

                if (config.url === constants.SERVER+':'+constants.PORT+"/"+constants.prefix+"/auth/user" || config.url === constants.SERVER+':'+constants.PORT+"/"+constants.prefix+"/create-user" || config.url.split(".").pop() == '.html') {
                    config.headers.skipAuthorization = true;
                } else if (config.url === "http://localhost:8002/potluck/auth/user" || config.url === "http://localhost:8002/potluck/create-user" || config.url.split(".").pop() == '.html') {
                    config.headers.skipAuthorization = true;
                } else {
                    if (!config.url.indexOf("https://maps.googleapis.com/maps/api/geocode/json?")) {
                        console.log("no authentication required for google map");
                    } else {
                        if ($localStorage.token) {
                            config.headers["x-access-token"] = $localStorage.token;
                        }
                    }
                }
                return config;
            },
            'responseError': function(response) {
                if (response.status === 401 || response.status === 403) {
                    $location.path('/');
                }
                return $q.reject(response);
            }
        };
    }]);
});