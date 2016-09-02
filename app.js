var app = require('angular').module('transcribe', [])
var utilities = require('./utilities/utilities.js')

app.controller('btnController', function ($scope){
  $scope.listening = null;

  $scope.onRecord = function (){
    navigator.webkitGetUserMedia({audio: true}, utilities.getUserMedia, console.error.bind(console))
    $scope.listening = true
  }

  $scope.onStop = function(){
    utilities.stopStream()
    var notes = require('./utilities/songParser.js').oldParser(utilities.getAndClearData());
    require('./utilities/midi.js')(notes, 120)
    require('./utilities/piano.js')(notes.slice(0), 120)
    $scope.listening = false
  }

  $scope.time = function (){
    bpm = +$scope.bpm;
  }

})

