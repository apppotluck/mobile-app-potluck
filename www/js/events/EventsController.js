app.controller('EventsController', [
    '$scope',
    'API',
    '$location',
    '$rootScope',
    '$q',
    'jwtHelper',
    '$localStorage',
    '$state',
    '$ionicSideMenuDelegate',
    
    function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $state, $ionicSideMenuDelegate) {

        // $ionicConfigProvider.tabs.position('bottom');
        $scope.sorting = [{ score: 9, name: 'Invite More Friends' },
            { score: 8, name: 'Broadcast Message' },
            { score: 7, name: 'Share Event' },
            { score: 6, name: 'Settings' },
            { score: 5, name: 'Sign Out' },
            { score: 4, name: 'Cancel event' }
        ];

        $rootScope.openMenu = function() {
            $ionicSideMenuDelegate.toggleRight();
        };

        $scope.events = {};
        $scope.nonHostUser = false;
        var userToken = $localStorage.token;
        var userDetails = jwtHelper.decodeToken(userToken);
        var eventsList = function() {
            $scope.upcomingEvents = [];
            $scope.pastEvents = [];
            var userToken = $localStorage.token,
                userDetails = jwtHelper.decodeToken(userToken),
                currentUser = userDetails.userId;
            appConfig.serviceAPI.getEvents(API, function(eventResponse) {

                var eventDate, eventDateWithHourAndMinute, unixTimeStamp;
                for (var eventIndex in eventResponse.results[0].content) {
                    // console.log(eventResponse.results[0].content[eventIndex].value);
                    var event = eventResponse.results[0].content[eventIndex].value
                    var eventId = '#' + eventResponse.results[0].content[eventIndex].cluster + ":" + eventResponse.results[0].content[eventIndex].position;
                    eventDate = event.event_date.replace(/-/g, '\/');
                    eventDateWithHourAndMinute = new Date(eventDate).setHours(event.event_time.split(":")[0]);
                    eventDateWithHourAndMinute = new Date(eventDateWithHourAndMinute).setMinutes(event.event_time.split(":")[1]);
                    event.event_id = eventId;
                    if (typeof event.accepted_users !== "undefined") {
                        if (event.accepted_users.length > 0) {
                            for (var i = 0; i < event.accepted_users.length; i++) {
                                if (event.accepted_users[i] === currentUser) {
                                    event.accepted_event = true;
                                    // console.log(event);
                                }
                                // else {
                                //     event.accepted_event = false;
                                // }
                            }
                        }
                    }
                    if (typeof event.declined_users !== "undefined") {
                        if (event.declined_users.length > 0) {
                            for (var i = 0; i < event.declined_users.length; i++) {
                                if (event.declined_users[i] === currentUser) {
                                    event.declined_event = true;
                                }
                                // else {
                                //     event.declined_event = false;
                                // }
                            }
                        }
                    }
                    if (typeof event.may_be_accepted_user !== "undefined") {
                        if (event.may_be_accepted_user.length > 0) {
                            for (var i = 0; i < event.may_be_accepted_user.length; i++) {
                                if (event.may_be_accepted_user[i] === currentUser) {
                                    event.may_be_accepted_event = true;
                                }
                                // else {
                                //     event.may_be_accepted_event = false;
                                // }
                            }
                        }
                    }

                    if (eventDateWithHourAndMinute > Date.now()) {
                        $scope.upcomingEvents.push(event);
                    } else {
                        $scope.pastEvents.push(event);
                    }
                }
                var userToken = $localStorage.token;
                var userDetails = jwtHelper.decodeToken(userToken);
                if (typeof userDetails.userId === "undefined") {
                    $state.go('app.login');
                } else {
                    $scope.currentUser = userDetails;
                }

            }, function(err) {
                console.log(err);
            }, userDetails.userId);
        }
        console.log("userDetails.userId===>", userDetails.userId)
        if (typeof userDetails.userId === "undefined") {
            $state.go('app.login');
        } else {
            $scope.currentUser = userDetails;
        }
        eventsList();
        $scope.$on('getEventList', function() {
            eventsList();
        });
        $scope.createEvent = function() {
            $location.path('/create-event');
        }

        $scope.onEventClick = function() {
            $state.go('details.home', { eId: this.value.event_id });
        }
        $scope.eventAcceptence = function(type) {
            var userToken = $localStorage.token;
            var userDetails = jwtHelper.decodeToken(userToken);
            var object = {
                "user_id": userDetails.userId,
                "event_id": this.value.event_id,
                "type": type
            }
            appConfig.serviceAPI.updateEventAcceptence(API, function(eventDetails) {
                $scope.$broadcast('getEventList');
            }, function(err) {
                console.log(err);
            }, object);
        }

        $scope.$watch('upcomingEvents', function(value) {
            console.log(value);
        })
    }
]);
app.controller('EventDetailsController', [
    '$scope',
    'API',
    '$location',
    '$rootScope',
    '$q',
    'jwtHelper',
    '$localStorage',
    '$stateParams',
    '$state',
    function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $stateParams, $state) {


        $scope.menu = {}
        $scope.menuList = [];
        $scope.update_menu_error = false;
        var eventId = $stateParams.eId;
        $scope.selectedIndex = 0;
        sessionStorage.setItem('eId', eventId);
        $scope.goBack = function() {
            $state.go("events.home");
        }
        appConfig.serviceAPI.getEventDetails(API, function(eventDetails) {
            if (eventDetails.length) {
                $scope.event = eventDetails;
                $scope.eventInvitees = eventDetails[0].invitees;
            }
        }, function(err) {
            console.log(err);
        }, $stateParams.eId);

        $scope.addToList = function() {
            var userToken = $localStorage.token;
            var userDetails = jwtHelper.decodeToken(userToken);
            $scope.menuList.push({
                "name": $scope.menu.name,
                "desc": $scope.menu.desc,
                "event_id": $stateParams.eId,
                "added_by": userDetails.userId
            })
            $scope.menu.name = "";
            $scope.menu.desc = "";
        }

        $scope.diplayMenu = function() {
            $state.go('details.menu', { eId: sessionStorage.getItem('eId') })
        }
        $scope.displayInvitee = function() {
            $state.go('details.invitees', { eId: sessionStorage.getItem('eId') });
        }
        $scope.removeMenu = function() {
            delete $scope.menuList[this.key];
        };
        $scope.addMenuToEvent = function() {
            appConfig.serviceAPI.insertEventMenu(API, function(menuResponse) {
                if (menuResponse.responseData.message === "success") {
                    $state.go('details.menu', { eId: $stateParams.eId });
                } else {
                    $scope.update_menu_error = true;
                }
            }, function(err) {
                console.log(err);
            }, $scope.menuList);
        };
    }
])
app.controller('EventMenuController', [
    '$scope',
    'API',
    '$location',
    '$rootScope',
    '$q',
    'jwtHelper',
    '$localStorage',
    '$stateParams',
    '$timeout',
    '$cordovaCamera',
    '$cordovaFileTransfer',
    '$ionicLoading',
    '$state',
    '$ionicPopup',
    function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $stateParams, $timeout, $cordovaCamera,$cordovaFileTransfer,$ionicLoading,$state,$ionicPopup) {
        $scope.eventMenu = {}
        $scope.showModal = false;
        var getEventMenuList = function() {
            var menuArray = [];
            $scope.eventMenuImage = {};
            $scope.images = [];
            appConfig.serviceAPI.getEventMenuDetails(API, function(eventMenuDetails) {
                    $scope.eventMenuArray = Object.keys(eventMenuDetails.menu)
                        .map(function(key) {
                            return eventMenuDetails.menu[key].value;
                        });                    
                        for (var ii = 0; ii < $scope.eventMenuArray.length; ii++) {
                            $scope.eventMenuArray[ii].menuImageDetails = [];
                            for (var jj = 0; jj < eventMenuDetails.menu_image.length; jj++) {
                                if (eventMenuDetails.menu_image[jj].value.menu_id[0] === $scope.eventMenuArray[ii].rid) {
                                    $scope.eventMenuArray[ii].menuImageDetails.push({
                                        "image": "img/"+eventMenuDetails.menu_image[jj].value.image,
                                        "menuImageRid": eventMenuDetails.menu_image[jj].value.rid
                                    });
                                }
                            }
                        }
                },
                function(err) {
                    console.log(err);
                }, $stateParams.eId);
        };
        getEventMenuList();
        $scope.$on('updateMenuList', function() {
            getEventMenuList();
        });

        // Photo upload plugin
        $scope.takePhoto = function() {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.imgURI = "data:image/jpeg;base64," + imageData;
                $scope.images.push($scope.imgURI);
            }, function(err) {
                // An error occured. Show a message to the user
            });
        }

        $scope.ready = false;
        // $rootScope.$watch('appReady.status', function() {
        //     console.log('watch fired ' + $rootScope.appReady.status);
        //     if ($rootScope.appReady.status) $scope.ready = true;
        // });
        // };
        $scope.doRefresh = function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('updateMenuList');
           $scope.$broadcast('scroll.refreshComplete');
        };        
        $scope.choosePhoto = function() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
            var menuId = this.menu.rid;
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $ionicLoading.show({
                        template: 'Uploading image on server',
                        duration: 2000
                });
                $imageURI = "data:image/jpeg;base64," + imageData;
                var image = document.getElementById('tempImage');
                image.src = imageData; 
                var server = constants.SERVER+':'+constants.PORT+'/'+constants.prefix+'/dish/image/'+encodeURIComponent(menuId);
                var filePath = imageData;
                var date = new Date();
                var options = {
                    fileKey: "file",
                    fileName: imageData.substr(imageData.lastIndexOf('/') + 1),
                    chunkedMode: false,
                    mimeType: "image/jpeg",
                    headers: {'x-access-token': $localStorage.token}
                };
                $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
                     // $state.forceReload();
                     $scope.$broadcast('updateMenuList');
                },function(err){
                    console.log(err)
                })
            }, function(err) {
                // An error occured. Show a message to the user
            });
        }



        var userToken = $localStorage.token;
        var userDetails = jwtHelper.decodeToken(userToken);
        $scope.currentUser = userDetails;
        $scope.isVisible = false;
        $scope.updateMenu = function() {
            appConfig.serviceAPI.updateEventMenu(API, function(menuResponse) {
                if (menuResponse.responseData.message === "success") {
                    $scope.$broadcast('updateMenuList');
                    $scope.selectedIndex = 1;

                } else {
                    $scope.update_menu_error = true;
                }
            }, function(err) {
                console.log(err);
            }, this.menu);

        }
        $scope.onFileUpload = function(element) {
            $scope.$apply(function(scope) {
                var file = element.files[0];
                FileInputService.readFileAsync(file).then(function(fileInputContent) {
                    $scope.fileInputContent = fileInputContent;
                });
            })
        }
        $scope.showImagePreview = showDialog;

        function showDialog($event) {
            
            var myPopup = $ionicPopup.show({
                template: '<img src="' + this.value.image + '">'  ,
                title: 'Menu Image'  
            });  
            $timeout(function() {
                 myPopup.close(); //close the popup after 3 seconds for some reason
            }, 3000);  
        }

        $scope.deleteImage = function(ev, menuId) {
            var imageId = this.value.menuImageRid;
            var confirmPopup = $ionicPopup.confirm({
             title: 'Delete Image',
             template: 'Are you sure you want to delete this menu image?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    appConfig.serviceAPI.deleteMenuMenuImage(API, function(eventMenuDetails) {
                        $scope.$broadcast('updateMenuList');
                    }, function(err) {
                        console.log("try again!");
                    }, imageId, menuId)
                } 
            });
        };



        function DialogController($scope, $mdDialog, items) {
            $scope.items = items;
            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
        $scope.uploadFiles = function(file) {
            $scope.f = file;
            $scope.files = {}
            console.log(file)
            if (file) {
                var fileUploadUrl = '/potluck/dish/image/' + encodeURIComponent(this.menu.rid);
                file.upload = Upload.upload({
                    url: fileUploadUrl,
                    data: { file: file }
                });

                file.upload.then(function(response) {
                    $timeout(function() {
                        file.result = response.data;
                        $scope.files = response.data.filename;
                        $scope.$broadcast('updateMenuList');
                    });
                }, function(response) {
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                }, function(evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            }
        }
    }
])
app.controller('CancelEventsController', ['$scope',
    'API',
    '$location',
    '$rootScope',
    '$q',
    'jwtHelper',
    '$localStorage',
    '$stateParams',
    'Upload',
    '$timeout',
    '$mdDialog',
    '$mdMedia',
    function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $stateParams, Upload, $timeout, $mdDialog, $mdMedia) {
        var userToken = $localStorage.token,
            userDetails = jwtHelper.decodeToken(userToken),
            currentUser = userDetails.userId;
        var eventsList = function() {
            $scope.events = [];
            appConfig.serviceAPI.getEvents(API, function(eventResponse) {
                for (var eventIndex in eventResponse.results[0].content) {
                    if (eventResponse.results[0].content[eventIndex].value.created_by === userDetails.userId) {
                        var events = {
                            "event_id": '#' + eventResponse.results[0].content[eventIndex].cluster + ":" + eventResponse.results[0].content[eventIndex].position,
                            "event_name": eventResponse.results[0].content[eventIndex].value.name
                        }
                        $scope.events.push(events);
                    }
                }
            }, function(err) {
                console.log(err);
            }, userDetails.userId)
        }
        eventsList();
        $scope.$on('cancelEventList', function() {
            eventsList();
        });
        $scope.event_details = function() {
            $location.path("event-details/" + this.value.event_id);
        }
        $scope.cancelEvent = function(ev) {
            var event_id = this.value.event_id;
            //  $mdDialog.show({
            //    clickOutsideToClose: true,
            //    scope: $scope,        
            //    preserveScope: true,           
            //    template: '<md-dialog aria-label="Cancel Event" ng-cloak>' +
            //                '<md-toolbar>'+
            //                '<div class="md-toolbar-tools">'+
            //                '<h2>Cancel event</h2>'+
            //                '<span flex></span>'+
            //                '<md-button class="md-icon-button" ng-click="cancel()">'+
            //                '<md-icon md-svg-src="img/icons/ic_close_24px.svg" aria-label="Close dialog"></md-icon>'+
            //                '</md-button>'+
            //                '</div>'+
            //                '</md-toolbar>'+
            //                '  <md-dialog-content>' +
            //                '     <input type="text">' +
            //                '  </md-dialog-content>' +
            //                '</md-dialog>',
            //    controller: function DialogController($scope, $mdDialog) {
            //       $scope.closeDialog = function() {
            //          $mdDialog.hide();
            //       }
            //    }
            // });
            var confirm = $mdDialog.confirm()
                .title('Cancel Event')
                .textContent('Would you like to cancel this event?')
                .ariaLabel('Cance Event')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                appConfig.serviceAPI.cancelEvents(API, function(eventResponse) {
                    $scope.$broadcast('cancelEventList');
                }, function(err) {
                    console.log(err);
                }, event_id, userDetails.userId)
            }, function() {});
        }
    }
]);
app.controller('InviteFriendsControllerByMenu', ['$scope',
    'API',
    '$location',
    '$rootScope',
    '$q',
    'jwtHelper',
    '$localStorage',
    '$stateParams',
    'Upload',
    '$timeout',
    '$mdDialog',
    '$mdMedia',
    function($scope, API, $location, $rootScope, $q, jwtHelper, $localStorage, $stateParams, Upload, $timeout, $mdDialog, $mdMedia) {
        var userToken = $localStorage.token,
            userDetails = jwtHelper.decodeToken(userToken),
            currentUser = userDetails.userId;
        $scope.showOnInviteeMoreFriendClick = false;
        var eventsList = function() {
            $scope.events = [];
            appConfig.serviceAPI.getEvents(API, function(eventResponse) {
                console.log(eventResponse)
                for (var eventIndex in eventResponse.results[0].content) {
                    var events = {
                        "event_id": '#' + eventResponse.results[0].content[eventIndex].cluster + ":" + eventResponse.results[0].content[eventIndex].position,
                        "event_name": eventResponse.results[0].content[eventIndex].value.name
                    }

                    $scope.events.push(events);
                }
                // console.log($scope.events);
            }, function(err) {
                console.log(err);
            }, userDetails.userId)
        }

        eventsList();
        // $scope.$on('cancelEventList', function() {
        //     eventsList();
        // });
        $scope.event_details = function() {
            $location.path("event-details/" + this.value.event_id)
        }

        $scope.inviteFriend = function(ev) {
            $scope.showOnInviteeMoreFriendClick = true;
            $scope.event_id = this.value.event_id;
            $scope.contacts = [];
            $scope.inviteesEmail = [];
            appConfig.serviceAPI.getInvitees(API, function(inviteesResponse) {
                for (var eventIndex in inviteesResponse.results[0].content) {
                    var invitees = {
                        "invitees_id": '#' + inviteesResponse.results[0].content[eventIndex].cluster + ":" + inviteesResponse.results[0].content[eventIndex].position,
                        "email": inviteesResponse.results[0].content[eventIndex].value.email_id,
                        "name": inviteesResponse.results[0].content[eventIndex].value.username,
                        "user_id": inviteesResponse.results[0].content[eventIndex].value.user_id
                    }
                    $scope.contacts.push(invitees);
                }
            }, function(err) {
                console.log(err);
            }, this.value.event_id)


        }
        $scope.addInvitess = function() {
            $scope.contacts.push({
                email: this.inviteesEmail[this.inviteesEmail.length - 1]
            });
        }
        $scope.removeInvitees = function() {
            console.log(this.inviteesEmail)
                // $scope.contacts.push({
                //     email: this.inviteesEmail[this.inviteesEmail.length - 1]
                // });
        }
        $scope.saveInvittes = function() {
            appConfig.serviceAPI.addMoreInviteesInEvent(API, function(inviteesResponse) {
                console.log(inviteesResponse)
                $scope.showOnInviteeMoreFriendClick = false;
            }, function(err) {
                console.log(err);
            }, this.contacts, this.event_id)
        }
    }
]);

app.filter('contains', function() {
    return function(array, needle) {
        // if (array)
        return array.indexOf(needle) >= 0;
    };
});

app.directive('sidemenu', function($compile) {
    var dir = {
        restrict: 'E',
        compile: function(element, attrs, linker) {
          var original = element.html();
          var sideMenuHtml = '<ion-side-menus><ion-pane ion-side-menu-content><ion-nav-bar class="bar-positive nav-title-slide-ios7"><ion-nav-buttons side="right"><button class="button button-icon button-clear ion-navicon" ng-click="openMenu()"></button></ion-nav-buttons></ion-nav-bar>'+original
          sideMenuHtml += '</ion-pane><ion-side-menu side="right"><ion-header-bar class="bar bar-header bar-positive"><h1 class="title">Settings</h1></ion-header-bar><ion-content has-header="true"><div class="list"><ion-radio ng-model="selected.score" ng-value="1">Invite More Friends</ion-radio><ion-radio ng-model="selected.score" ng-value="1">Broadcast Message</ion-radio><ion-radio ng-model="selected.score" ng-value="1">Share Event</ion-radio><ion-radio ng-model="selected.score" ng-value="1">Settings</ion-radio><ion-radio ng-model="selected.score" ng-value="1">Sign Out</ion-radio><ion-radio ng-model="selected.score" ng-value="1">Cancel event</ion-radio></div></ion-content></ion-side-menu></ion-side-menus>'
          element.html(sideMenuHtml);
        }
      };
    return dir;
});