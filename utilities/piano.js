module.exports = function generateStaff(noteData, bpm){
  var VF = Vex.Flow;
  console.log(noteData, 'started staff generation')
  var msPerBeat = 60000 / bpm
  var beats = 0;
  function mapNoteData(noteItem){
    noteItem[1] = noteItem[1] / msPerBeat // convert to percentage of single beat
    if (noteItem[1] < 1.25 && noteItem[1] >= .68){ // check length of note and create proper length of note values (only quarter notes now)
      beats += 2
      if (noteItem[0] == -1) noteItem[1] = 'qr';
      else noteItem[1] = 'q'
    }
    if (noteItem[1] < .68 && noteItem[1] > .25){ // check length of note and create proper length of note values
      beats++
      if (noteItem[0] == -1) noteItem[1] = '8r';
      else noteItem[1] = '8'
    }

    if (noteItem[1] < 2.5 && noteItem[1] > 1.5){ // check length of note and create proper length of note values
      beats += 4
      if (noteItem[0] == -1) noteItem[1] = 'hr';
      else noteItem[1] = 'h'
    }

    if (noteItem[0] != -1){ // adjust note names
      noteItem[0] = noteItem[0].slice(0, -1) + '/' + noteItem[0].slice(-1)
    } else {noteItem[0] = 'b/4'}

    // catch unassigned values
    if (typeof noteItem[1] === 'number') {
      console.log('deleting unwanted stuff', noteItem)
      noteItem = false;
      return
    }

    var note = new VF.StaveNote({keys: [noteItem[0]], duration: noteItem[1]}) //create new note instances
    if (noteItem[0].match(/\#/)) note.addAccidental(0, new VF.Accidental("#"));
    // if (noteItem[0].match(/b/)) note.addAccidental(0, new VF.Accidental("b"));
    return note
  }
  notes = noteData.map(mapNoteData) // transform note data into form readable by vex
    // notes.push(new VF.StaveNote({keys: ['b/4'], duration: 'qr'})) //pushing extra note for now

  //filter uncaught notes
  notes = notes.filter(function (note){ return Boolean(note) })

  // Create an SVG renderer and attach it to the DIV element named "boo".
  var div = document.getElementById("boo")
  var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

  // Configure the rendering context.
  renderer.resize(500, 500);
  var context = renderer.getContext();
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

  // Create a stave of width 400 at position 10, 40 on the canvas.
  var stave = new VF.Stave(10, 40, 4000);

  // Add a clef and time signature.
  stave.addClef("treble").addTimeSignature("4/4");

  // Connect it to the rendering context and draw!
  stave.setContext(context).draw();


  var voice = new VF.Voice({num_beats: beats, beat_value: 8})
  voice.addTickables(notes)

  var formatter = new VF.Formatter().format([voice], 400);


  // beam notes appropriately
  var beams = VF.Beam.generateBeams(notes);
  voice.draw(context, stave)
  beams.forEach(function(b) {b.setContext(context).draw()})

}

