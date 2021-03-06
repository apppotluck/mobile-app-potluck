// define(['app', "http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"], function(app, glocation) {
//     app
//         .controller('CreateEventController', [
//             '$scope',
//             'API',
//             '$location',
//             '$rootScope',
//             '$q',
//             'jwtHelper',
//             '$localStorage',
//             '$filter',
//             function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $filter, glocation) {
//                 $scope.event = {};
//                 $scope.today = function() {
//                     $scope.event.date = new Date();
//                 };
//                 $scope.today();
//                 $scope.time1 = new Date();
//                 $scope.showMeridian = true;

//                 $scope.disabled = false;
//                 $rootScope.displayCreateEventFormDisplay = true;
//                 $rootScope.totalNumberOfFriendsInvited = 0;


//                 // get food type 
//                 $scope.foodTypeArray = {};
//                 $scope.foodTypeArray["veg"] = "Veg";
//                 $scope.foodTypeArray["nonveg"] = "Non Veg";
//                 $scope.foodTypeArray["both"] = "Both";


//                 $scope.themes = ["Italian", "Indian", "Chinees", "USA"];

//                 if (navigator.geolocation) {
//                     navigator.geolocation.getCurrentPosition(showPosition);
//                 }

//                 function showPosition(position) {
//                     $scope.event.currentlocation = "Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude;
//                     $scope.locationObject = {};
//                     $scope.locationObject.lat = position.coords.latitude;
//                     $scope.locationObject.lang = position.coords.longitude;
//                     var deferred = $q.defer();
//                     require(glocation, function(result) {
//                         deferred.resolve(true);
//                     }, function(err) {
//                         deferred.reject(false);
//                     });
//                     deferred.promise.then(function(res) {
//                         appConfig.serviceAPI.getCurrentLocation(API, function(response) {
//                             // console.log(response.results[0].formatted_address);
//                             $scope.event.currentlocation = response.results[0].formatted_address
//                         }, function(err) {
//                             console.log(err);
//                         }, $scope.locationObject)
//                     })
//                 }

//                 $scope.inviteFriends = function() {
//                     $rootScope.displayCreateEventFormDisplay = false;
//                     $rootScope.inviteFriendsFormDisplay = true;
//                 }

//                 $scope.assignDishes = function() {
//                     $rootScope.displayCreateEventFormDisplay = false;
//                     $rootScope.assignDishesFormDisplay = true;
//                 }

//                 $scope.createEvent = function() {

//                     $scope.event.time = $scope.time1.getHours() + ":" + $scope.time1.getMinutes()
//                     $scope.event.friends = $rootScope.inviteUsers;
//                     $scope.event.dishAllocation = $rootScope.dishesAndUsers;
//                     $scope.event.date = $filter('date')($scope.event.date, 'yyyy-MM-dd');
//                     var userToken = $localStorage.token;
//                     var userDetails = jwtHelper.decodeToken(userToken);
//                     $scope.event.created_by = userDetails.userId;

//                     appConfig.serviceAPI.createEvent(API, function(response) {
//                         if (response.responseData.status === "success") {
//                             $location.path('events');
//                         }
//                     }, function(err) {
//                         console.log(err);
//                     }, $scope.event);
//                 }
//             }

//         ])
//     app.controller('InviteFriendsController', [
//         '$scope',
//         'API',
//         '$location',
//         '$rootScope',
//         'jwtHelper',
//         '$localStorage',
//         function($scope, API, $location, $rootScope,jwtHelper, $localStorage) {
//             $scope.inviteFriendsForm = '/views/events/invite-friends.html';
//             $scope.name=[];
//             $scope.invalidEmail=false;
//             $scope.userExist = false;
//             $scope.add = function() {
//                 var userToken = $localStorage.token;
//                 var userDetails = jwtHelper.decodeToken(userToken);
//                 if(/[^@]@([a-zA-z.-]+)\.[a-zA-Z]{2,}$/.test($scope.name.invitee)) {
//                     if($scope.name.invitee === userDetails.email) {
//                         $scope.invalidEmail=false;
//                         $scope.userExist= true;
//                     } else {
//                         if (typeof($scope.items) === "undefined") {
//                             $scope.items=[];
//                             $scope.items.push({
//                                 friendNameName: $scope.name.invitee
//                             });
//                         } else {
//                             $scope.items.push({
//                                 friendNameName: $scope.name.invitee
//                             });
//                         }
//                         $scope.name.invitee = "";
//                         $scope.invalidEmail=false;
//                         $scope.userExist= false;
//                     }
//                 } else {
//                     $scope.invalidEmail=true;
//                     $scope.userExist= false;
//                 }
//             };
//             $scope.addInvitee = function(keyEvent) {
//                 if (keyEvent.which === 13)
//                     $scope.add();
//             }
//             $scope.addFriends = function() {
//                 var userArray = [];
//                 for (var i in $scope.items) {
//                     userArray.push($scope.items[i].friendNameName);
//                 }
//                 $rootScope.inviteFriendsFormDisplay = false;
//                 $rootScope.displayCreateEventFormDisplay = true;
//                 $rootScope.totalNumberOfFriendsInvited = $scope.items.length;
//                 $rootScope.inviteUsers = userArray;

//             };
//             $scope.removeInvite = function($index) {
//                  $scope.items.splice($index,1)
//             }
//         }
//     ])
//     app.controller('AssignDishesController', [
//         '$scope',
//         'API',
//         '$location',
//         '$rootScope',
//         function($scope, API, $location, $rootScope) {
//             $rootScope.assignDisheesForm = '/views/events/assign-dishes.html';
//             $scope.dishesItems = [{
//                 "friendName": "",
//                 "dishes": ""
//             }];
//             $scope.add = function() {
//                 $scope.dishesItems.push({
//                     friendName: "",
//                     dishes: ""
//                 });
//             };
//             $scope.assignDishes = function() {
//                 $rootScope.assignDishesFormDisplay = false;
//                 $rootScope.displayCreateEventFormDisplay = true;
//                 $rootScope.totalNumberOfFriendsInvited = $scope.dishesItems.length;
//                 var dishes = [];
//                 for (var i in $scope.dishesItems) {
//                     var obj = {};
//                     obj[$scope.dishesItems[i].friendName] = $scope.dishesItems[i].dishes;
//                     dishes.push(obj);
//                 }
//                 $rootScope.dishesAndUsers = dishes;
//             }
//         }
//     ])
// })

app.controller('CreateEventController', [
    '$scope',
    'API',
    '$location',
    '$rootScope',
    '$q',
    'jwtHelper',
    '$localStorage',
    '$filter',
    '$cordovaGeolocation',
    '$state',
    function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $filter, $cordovaGeolocation,$state) {
        $scope.event = {};
        $scope.today = function() {
            $scope.event.date = new Date();
        };
        $scope.today();
        $scope.time1 = new Date();
        $scope.showMeridian = true;

        $scope.disabled = false;
        $rootScope.displayCreateEventFormDisplay = true;
        $rootScope.totalNumberOfFriendsInvited = 0;


        // get food type 
        $scope.foodTypeArray = {};
        $scope.foodTypeArray["veg"] = "Veg";
        $scope.foodTypeArray["nonveg"] = "Non Veg";
        $scope.foodTypeArray["both"] = "Both";

        $scope.event.foodtype = 'both';
        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function(position) {
                var lat = position.coords.latitude
                var long = position.coords.longitude
                showPosition(position)
            }, function(err) {
                // error
            });

        var watchOptions = {
            timeout: 3000,
            enableHighAccuracy: false // may cause errors if true
        };

        var watch = $cordovaGeolocation.watchPosition(watchOptions);
        watch.then(
            null,
            function(err) {
                // error
            },
            function(position) {
                var lat = position.coords.latitude
                var long = position.coords.longitude
            });
        watch.clearWatch();

        function showPosition(position) {
            $scope.event.currentlocation = "Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude;
            $scope.locationObject = {};
            $scope.locationObject.lat = position.coords.latitude;
            $scope.locationObject.lang = position.coords.longitude;
            var deferred = $q.defer();
                appConfig.serviceAPI.getCurrentLocation(API, function(response) {
                    $scope.event.currentlocation = response.results[0].formatted_address
                }, function(err) {
                    console.log(err);
                }, $scope.locationObject)
        }

        $scope.inviteFriends = function() {
            $state.go('app.invitees');
        }

        $scope.assignDishes = function() {
            $rootScope.displayCreateEventFormDisplay = false;
            $rootScope.assignDishesFormDisplay = true;
        }

        $scope.createEvent = function() {

            try {
                $scope.event.time = $scope.time1.getHours() + ":" + $scope.time1.getMinutes()
                $scope.event.date = $filter('date')($scope.event.date, 'yyyy-MM-dd');
            } catch(e) {}
            $scope.event.friends = $rootScope.inviteUsers;
            // $scope.event.dishAllocation = $rootScope.dishesAndUsers;
            var userToken = $localStorage.token;
            var userDetails = jwtHelper.decodeToken(userToken);
            $scope.event.created_by = userDetails.userId;
            console.log($scope.event)
            appConfig.serviceAPI.createEvent(API, function(response) {
                if (response.responseData.status === "success") {
                    $state.go('app.eventslist');
                }
            }, function(err) {
                console.log(err);
            }, $scope.event);
        }
    }
]);
app.controller('InviteFriendsController', [
    '$scope',
    'API',
    '$location',
    '$rootScope',
    'jwtHelper',
    '$localStorage',
    '$state',
    function($scope, API, $location, $rootScope, jwtHelper, $localStorage,$state) {
        $scope.name = [];
        $scope.invalidEmail = false;
        $scope.userExist = false;
        $scope.add = function() {
            var userToken = $localStorage.token;
            var userDetails = jwtHelper.decodeToken(userToken);
            if (/[^@]@([a-zA-z.-]+)\.[a-zA-Z]{2,}$/.test($scope.name.invitee)) {
                if ($scope.name.invitee === userDetails.email) {
                    $scope.invalidEmail = false;
                    $scope.userExist = true;
                } else {
                    if (typeof($scope.items) === "undefined") {
                        $scope.items = [];
                        $scope.items.push({
                            friendNameName: $scope.name.invitee
                        });
                    } else {
                        $scope.items.push({
                            friendNameName: $scope.name.invitee
                        });
                    }
                    $scope.name.invitee = "";
                    $scope.invalidEmail = false;
                    $scope.userExist = false;
                }
            } else {
                $scope.invalidEmail = true;
                $scope.userExist = false;
            }
        };
        $scope.addInvitee = function(keyEvent) {
            $scope.add();
        }
        $scope.addFriends = function() {
            var userArray = [];
            for (var i in $scope.items) {
                userArray.push($scope.items[i].friendNameName);
            }
            $rootScope.inviteFriendsFormDisplay = false;
            $rootScope.displayCreateEventFormDisplay = true;
            $rootScope.totalNumberOfFriendsInvited = $scope.items.length;
            $rootScope.inviteUsers = userArray;
            $state.go('app.createevent');
        };
        $scope.removeInvite = function($index) {
            $scope.items.splice($index, 1)
        }


    }
])