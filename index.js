
function noteFromPitch( frequency ) {
  var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
  return Math.round( noteNum ) + 69;
}

function frequencyFromNoteNumber( note ) {
  return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
  return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}

var theStream, bpm;

function stopStream(){
  theStream.getAudioTracks()[0].stop()
  window.cancelAnimationFrame(rafID)
  midiData = songParser(midiData);
  console.log(midiData, bpm)
  // $.post('https://localhost:8000/midify',{'midiData': midiData, 'bpm':bpm})
  // .done(function (res){
  //   console.log(res)
  //   while(res.notes[0][0] == -1) res.notes.shift()
  //   while(res.notes[res.notes.length - 1][0] == -1) res.notes.pop()
  //   generateStaff(res.notes, bpm ? bpm : 60); //default 120 bpm, keeping 60 for now. if I want more responsiveness, need to figure out how to separate notes with no break between them
  //   midiData = []
  // })
}



var noteStrings = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];


function noteNameFromPitch( frequency ) {
  var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
  noteNum = Math.round( noteNum ) + 69;
  var octave = Math.floor(noteNum / 12) - 1;
  var noteName = noteStrings[noteNum % 12];
  return noteName + octave;
}

function songParser(songData){
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
      while(songData[j] != -1 /*&& +songData[j] < +songData[j+1] + 50 && +songData[j] > +songData[j+1] - 50*/){
        // if (+songData[j + 1] > +songData[j] + 50 || +songData[j + 1] < +songData[j] - 50) break;
        noteDuration += 15;
        pendingNotes.push(songData[j]);
        j++
      }
      if (pendingNotes.length < 10){
        if (noteData[noteData.length - 1][0] == -1) noteData[noteData.length - 1][1] += noteDuration;
        else {
          // keep holding that data
        }
      } else {
        var grouped = _.groupBy(pendingNotes, function (freq){ return noteNameFromPitch(freq); });
        var longest = [];
        for (var k in grouped){
          if (grouped[k].length > longest.length){
            longest = grouped[k];
          }
        }
        noteData.push([longest[0], noteDuration]);
      }
      pendingNotes = [];
      noteDuration = 0;
      i = j;
      longest = [];
    }
  }
  return noteData
}

