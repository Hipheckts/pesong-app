angular.module('SongBook', ['ionic', 'song.service'])

    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('songmenu', {
                url: "/songURL",
                abstract: true,
                templateUrl: "event-menu.html"
            })
            .state('songmenu.home', {
                url: "/home",
                views: {
                    'menuContent' :{
                        templateUrl: "home.html"
                    }
                }
            })

            .state('songmenu.home/:songId', {
                url: "/song-detail/:songId",
                views: {
                    'menuContent' :{
                        templateUrl: "home.html",
                        controller: 'SongDetailCtrl'
                    }
                }
            })

            .state('songmenu.all-song', {
                url: "/all-song",
                views: {
                    'menuContent' :{
                        templateUrl: "all-song.html",
                        controller: "AllSongCtrl"
                    }
                }
            })
            .state('songmenu.add-song', {
                url: "/add-song",
                views: {
                    'menuContent' :{
                        templateUrl: "add-song.html",
                        controller: "AddSongCtrl"
                    }
                }
            })
            .state('songmenu.edit-song/:songId', {
                url: "/edit-song/:songId",
                views: {
                    'menuContent' :{
                        templateUrl: "add-song.html",
                        controller: "AddSongCtrl"
                    }
                }
            })
            .state('songmenu.about', {
                url: "/about",
                views: {
                    'menuContent' :{
                        templateUrl: "about.html"
                    }
                }
            })

        $urlRouterProvider.otherwise("/songURL/home");
    })

    .controller('MainCtrl', function($scope, $state, $ionicPopup, $ionicSideMenuDelegate, DBService) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.headertxt = 'Songs';

        $scope.getRandomSong = function() {
            DBService.getSong().then(function (results) {

                if(results.length === 0){
                    $ionicPopup.alert({
                        title: "Warning",
                        template: "No song to display. Please add a song."
                    }).then(function(res) {
                        $state.go('songmenu.add-song');
                    });
                }else{
                    var random_song = [];
                    random_song.push(results[Math.floor(Math.random()* results.length)]);
                    $scope.song = random_song;
                }
            });
        }

        DBService.setup().then(function(){
            $scope.getRandomSong();
        });

    })

    .controller('SongDetailCtrl', function($scope, $state, $stateParams, $ionicPopup, DBService) {
        $scope.headertxt = 'Song Detail';

        $scope.init = function() {
            DBService.getSongById($stateParams.songId).then(function (results) {
                $scope.song = results;
            });
        }

        $scope.init();
    })

    .controller('AllSongCtrl', function($scope, $state, $ionicPopup, $ionicActionSheet, DBService) {
        $scope.loadSong = function() {
            DBService.getSong().then(function (results) {

                if(results.length === 0){
                    $ionicPopup.alert({
                        title: "Warning",
                        template: "No song to display. Please add a song."
                    }).then(function(res) {
                        $state.go('songmenu.add-song');
                    });
                }else{
                    $scope.song = results;
                }
            });
        }

        $scope.loadSong();

        $scope.delSong = function(songId){
            $ionicActionSheet.show({
                titleText: 'Confirm Delete',
                destructiveText: 'Delete',
                cancelText: 'Cancel',
                cancel: function() {
                    //console.log('CANCELLED');
                },
                destructiveButtonClicked: function() {
                    DBService.delSong(songId).then(function () {
                        $ionicPopup.alert({
                            title: "Success",
                            template: "Song deleted."
                        }).then(function(res) {
                            $scope.loadSong();
                        });
                    });
                    return true;
                }
            });
        }

        $scope.editSong = function(song_Id){
            $state.go('songmenu.edit-song/:songId',{songId:song_Id});
        }
    })

    .controller('AddSongCtrl', function($scope, $ionicPopup, $stateParams, DBService) {

        $scope.song = {};

        if($stateParams.songId === undefined){
            $scope.action = 'Add';
            $scope.btnaction = 'Save';
        }else{
            $scope.action = 'Edit';
            $scope.btnaction = 'Update';

            DBService.getSongById($stateParams.songId).then(function (results) {
                $scope.song.name = results[0].song_name;
                $scope.song.category = results[0].song_category;
                $scope.song.lyrics = results[0].song_lyrics;
                $scope.song.key = results[0].song_key;
            });
        }

        $scope.saveSong = function(song){
            if(song === undefined || song.name === null || song.name === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please enter song name.'
                });
            }else if (song.category === undefined || song.category === null || song.category === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please select a category.'
                });
            }else if (song.lyrics === undefined || song.lyrics === null || song.lyrics === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please enter lyrics.'
                });
            }else if (song.key === undefined || song.key === null || song.key === ""){
                $ionicPopup.alert({
                    title: 'Error - Input Required',
                    template: 'Please enter lyrics.'
                });
            }else{
                if($stateParams.songId === undefined) {
                    DBService.saveSong(song);
                }else{
                    DBService.updateSong(song, $stateParams.songId);
                }

                $scope.song.name = '';
                $scope.song.category = '';
                $scope.song.lyrics = '';
                $scope.song.key = '';
            }
        }
    });


                
