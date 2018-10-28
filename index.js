const ytlist = require('youtube-playlist');
const fs = require('fs');
const ytdl = require('ytdl-core');
const _cliProgress = require('cli-progress');
var spinner = ["/","-","\\","|"];
var spinnerinc = 0;

fetchPlaylists();

function fetchPlaylists() {

  var args = process.argv.slice(2);
  args.forEach(function (val, index, array) {
    //console.log(index + ': ' + val);
    const url = val;

    if(url.search("https://www.youtube.com/playlist") != -1) {

      ytlist(url, 'url').then(res => {
        console.log(res.data.playlist);
        leech(res.data.playlist);

      });
    }
    else {
      console.log("Playlist Error!");
      process.exit();
    }


  });
}

function leech(playlist) {

  var regex = /\=(.*)/gm;
  playlist.forEach(function(val){
    var videoName = val.substr(val.indexOf("=") + 1);
    //console.log("Writing " + videoName + ".mp4");
    ytdl(val, { filter: (format) => format.container === 'mp4' })
      .on('response', function(res){
        process.stdout.write("\u001b[1D");
        console.log("Downloading: " + videoName + ".mp4");

      })


      .on( 'progress', function(a,b,c){
        process.stdout.write("\u001b[1D");
        process.stdout.write(spinner[spinnerinc]);
        spinnerinc = (spinnerinc < 2) ? spinnerinc + 1 : 0;
      })
      .on('finish', function() {
        process.stdout.write("\u001b[1D");
        console.log("Complete: " + videoName + '.mp4');
      })
      .pipe(fs.createWriteStream("./downloads/" + videoName + ".mp4"));
  });

}




