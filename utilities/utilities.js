var theStream, interval, currentRecording = [];

function stopStream(){
  window.cancelAnimationFrame(interval)
  theStream.getAudioTracks()[0].stop()
}

function getUserMedia(mediaStream){
  theStream = mediaStream
  var audioContext = new AudioContext();
  var sampleRate = audioContext.sampleRate
  // console.log(sampleRate)
  var mediaStreamSource = audioContext.createMediaStreamSource(mediaStream)
  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;
  mediaStreamSource.connect( analyser );
  var frequencyData = new Float32Array(analyser.fftSize)
  var frequencyBlockSize = sampleRate / frequencyData.length

  function that(){
      analyser.getFloatTimeDomainData(frequencyData)

      var loudest = require('detect-pitch')(frequencyData, .25)
      var freq = !loudest ? -1 : 44100 / loudest

      console.log(freq)
      currentRecording.push(freq)
      interval = window.requestAnimationFrame(that)
  }
  that()
}


module.exports = {
  stopStream: stopStream,
  getUserMedia: getUserMedia,
  getAndClearData: function (){
    var hold = currentRecording;
    currentRecording = []
    return hold
  }
}
