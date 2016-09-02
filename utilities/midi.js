const fs = require('fs');
const Midi = require('jsmidgen');

function midify(recordingData, tempo){

  var file = new Midi.File();
  var track = new Midi.Track();
  file.addTrack(track)
  track.setTempo(tempo).setInstrument(0, 0x13)
  var ticksPerMs = 60000 / (128 * tempo);
  var rest = 0, time = 0;
  recordingData.forEach(function (note, i){
    if (i === 0) return
    if (note[0] == -1){
      rest = Math.floor(note[1] / ticksPerMs);
      if (rest < 10) rest = 0 // remove untrue rests which occur as breaks between notes
    } else {
      track.note(0, note[0], Math.floor( note[1] / ticksPerMs), rest);
      rest = 0;
    }
  })

  fs.writeFileSync('test2.mid', file.toBytes(), 'binary');
  return file

}

module.exports = midify
