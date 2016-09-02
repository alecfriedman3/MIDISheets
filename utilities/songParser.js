var _ = require('underscore')
var noteStrings = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
function noteNameFromPitch( frequency ) {
  var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
  noteNum = Math.round( noteNum ) + 69;
  var octave = Math.floor(noteNum / 12) - 1;
  var noteName = noteStrings[noteNum % 12];
  return noteName + octave;
}
module.exports = {
  oldParser: function (songData){
    // console.log(songData)
    var j;
    var noteData = [], pendingNotes = [];
    var noteDuration = 0;
    for (var i = 0; i < songData.length; i++){
      j = i;
      if (songData[i] == -1){ //if no notes were picked up
        while (songData[j] == -1){ //while there is rest, add 15 miliseconds rest time, 15 ms avg interval on data
          noteDuration += 15;
          j++;
        }
        if (i > 0 && noteData[noteData.length - 1][0] == -1) noteData[noteData.length - 1][1] += noteDuration;
        else noteData.push([-1, noteDuration]); //push the rest time into the array, along with note value -1 (rest)
        noteDuration = 0; //reset rest time
        i = j; // move counter up to current spot
      }
      // store array of the next so many note values
      // if there are too few data points (unwanted noise) throw away
      // otherwise average the frequencies to get intended note frequency
      // and grab the duration of the note
      else {
        // var noteFreq
        while(songData[j] !== undefined && songData[j] != -1 /*&& +songData[j] < +songData[j+1] + 50 && +songData[j] > +songData[j+1] - 50*/){
          if (songData[j + 1] > songData[j] + 50 || songData[j + 1] < songData[j] - 50) break;
          noteDuration += 15;
          pendingNotes.push(songData[j]);
          j++
        }
        if (pendingNotes.length < 10){
          if (noteData[noteData.length - 1][0] == -1) noteData[noteData.length - 1][1] += noteDuration;
          else {
            // keep holding that data
            // console.log(noteData, 'noteDatahere')
          }
        } else {
          var length = pendingNotes.length
          // maybe just choose the note which appears the maximum number of times in the array
          var avgFreq = pendingNotes.reduce(function (freq1, freq2){ //possibly not the best way to find the correct note
            return freq1 + freq2;
          }) / length;

          var grouped = _.groupBy(pendingNotes, function (freq){ return noteNameFromPitch(freq); });

          // console.log(grouped, avgFreq, noteDuration)

          noteData.push([noteNameFromPitch(avgFreq), noteDuration]);
        }
        pendingNotes = [];
        noteDuration = 0;
        i = j;
      }
    }
    // console.log(noteData, 'noteData')
    // require('./piano.js')(noteData, 120)
    return noteData
  },
  songParser: function (noteData){

  }
}
