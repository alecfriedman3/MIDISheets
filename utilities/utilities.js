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
  var frequencyData = new Uint8Array(analyser.fftSize)
  var frequencyBlockSize = sampleRate / frequencyData.length
  // console.log(mediaStreamSource, frequencyData)

  analyser.getByteFrequencyData(frequencyData)
  var loudest = getPeaks(frequencyData)
  // var loudest = analyzePeaks(possibleNotes, frequencyData)
  var loudestInd = frequencyData.indexOf(loudest) + 1
  // console.log(loudestInd, (frequencyBlockSize * (loudestInd + (loudestInd + 1))) / 2, loudest)
  function that(){
      analyser.getByteFrequencyData(frequencyData)
      var loudest = getPeaks(frequencyData)
      // var loudest = analyzePeaks(possibleNotes, frequencyData)
      var loudestInd = frequencyData.indexOf(loudest)
      var freq = loudestInd === -1 ? -1 : (frequencyBlockSize * (loudestInd + (loudestInd + 1))) / 2
      // console.log(loudestInd, (frequencyBlockSize * (loudestInd + (loudestInd + 1))) / 2, loudest)
      currentRecording.push(freq)
      interval = window.requestAnimationFrame(that)
  }
  that()
}


function getPeaks(pitchInstance){
  var peaks = [], startPeak = null, endPeak = null;
  for (var i = 0; i < pitchInstance.length; i++){
    if (pitchInstance[i+1] > pitchInstance[i]){
      startPeak = true;
    } else if (pitchInstance [i + 1] < pitchInstance[i]){
      endPeak = true
    }
    if (startPeak && endPeak){
      peaks.push([i, pitchInstance[i]])
      startPeak = endPeak = null
    }
  }
  return analyzePeaks(peaks, pitchInstance)
}

function analyzePeaks(possibleNotes, frequencyData){
  let mean = 0;
  for (var i = 0; i < frequencyData.length; i++) {
    var val = frequencyData[i];
    mean += val*val;
  }
  mean = Math.sqrt(mean/frequencyData.length);
  console.log('mean!', mean,frequencyData)
  if (mean < 5) return -1; // probably not enough signal
  return Math.max.apply(null, possibleNotes.map(function (noteArr) { return noteArr[1]}));
}

module.exports = {
  stopStream: stopStream,
  getUserMedia: getUserMedia,
  getPeaks: getPeaks,
  getAndClearData: function (){
    var hold = currentRecording;
    currentRecording = []
    return hold
  }
}
