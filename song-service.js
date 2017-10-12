angular.module('song.service', [])

    .factory("DBService", function ($q, $ionicPopup, $state) {
        var db = null;

        function createDB() {   
            var deferred = $q.defer();
            var version = 1;
            var request = window.indexedDB.open("songDB", version);

            request.onupgradeneeded = function(e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;

                if(db.objectStoreNames.contains("songData")) {
                    db.deleteObjectStore("songData");
                }

                var store = db.createObjectStore("songData", { keyPath: "id", autoIncrement:true });
            };

            request.onsuccess = function(e) {
                db = e.target.result;
                deferred.resolve();
            };

            request.onerror = function(e){
                deferred.reject("Error creating database.");
                console.dir(e);
            };

            return deferred.promise;
        }

        function getSong(){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["songData"], "readwrite");
                var store = trans.objectStore("songData");
                var songs = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function(e) {
                    var result = e.target.result;
                    if(result === null || result === undefined){
                        deferred.resolve(songs);
                    }else{
                        songs.push(result.value);
                        result.continue();
                    }
                };

                cursorRequest.onerror = function(e){
                    deferred.reject("Error retrieving records " + e.value);
                };
            }
            return deferred.promise;
        }

        function getSongById(songId){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var transaction = db.transaction(["songData"], "readwrite");
                var objectStore = transaction.objectStore("songData");
                var request = objectStore.get(Number(songId));

                var songs = [];

                request.onsuccess = function(event) {
                    var song = request.result;
                    songs.push(song);
                    deferred.resolve(songs);
                };

                request.onerror = function(e){
                    deferred.reject("Error retrieving records " + e.value);
                };
            }
            return deferred.promise;
        }

        function saveSong(song){
            var song_name = song.name;
            var song_category = song.category;
            var song_lyrics = song.lyrics;
            var song_key = song.key;

            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["songData"], "readwrite");
                var store = trans.objectStore("songData");

                var request = store.add({
                    "song_name": song_name,
                    "song_category": song_category,
                    "song_lyrics": song_lyrics,
                    "song_key": song_key
                });

                request.onsuccess = function(e) {
                    deferred.resolve();
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Song added successfully.'
                    });
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Error saving song.");
                };
            }
            return deferred.promise;
        }

        function delSong(songId){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["songData"], "readwrite");
                var store = trans.objectStore("songData");

                var request = store.delete(songId);

                request.onsuccess = function(e) {
                    deferred.resolve();
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Error deleting song.");
                };
            }
            return deferred.promise;
        }

        function updateSong(song, songId){
            var song_name = song.name;
            var song_category = song.category;
            var song_lyrics = song.lyrics;
            var song_key = song.key;

            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["songData"], "readwrite");
                var store = trans.objectStore("songData");

                var request = store.put({
                    "song_name": song_name,
                    "song_category": song_category,
                    "song_lyrics": song_lyrics,
                    "song_key": song_key,
                    "id":Number(songId)
                });

                request.onsuccess = function(e) {
                    deferred.resolve();
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Song updated successfully.'
                    }).then(function(res) {
                        $state.go('songmenu.all-song');
                    });
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Error updated song.");
                };
            }
            return deferred.promise;
        }

        return {
            setup: function() {
                return createDB();
            },
            getSong: function(){
                return getSong();
            },
            getSongById: function(songId){
                return getSongById(songId);
            },
            saveSong: function(song){
                return saveSong(song);
            },
            delSong: function(songId){
                return delSong(songId);
            },
            updateSong: function(song, songId){
                return updateSong(song, songId);
            }
        }

    });

                
