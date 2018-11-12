
import View from './view.js';
import Controller from './controller.js';

const Downloader = (function () {
  const fs = require('fs');
  const ytdl = require('ytdl-core');
  const sanitizeFilename = require("sanitize-filename");

  let dl_limit = 4;
  let save_path = __dirname + "/../downloads/";


  // setDLLimit
  const setDownloadLimit = (int) => {
    dl_limit = int;
    return Downloader;
  }

  // set Save Path
  const setSavePath = (string) => {
    save_path = string;
    return Downloader;
  }


  // get MP4s
  const getMP4s = (obj) => {




    return new Promise(
      (resolve, reject) => {




        const playlist_name = obj.name;
        View.printMessage("Downloading Playlist: " + playlist_name);


        View.printLineBreaks(2);

        // setTimeout(() => resolve(obj), 5000);

        // mapping over individual downloads here
        let download_promises = Object.keys(obj.list)
          .map(function(key) {

            // We need to build in some kind of throttling / limiting
            // to accomplish this we need a serilized promise structure like we're using
            // on index.js and we need to split up the incoming object here (obj) into
            // parts of length dl_limit. We will then send each chunk into the downloader
            // seriliazed

            const video_file_name = sanitizeFilename(obj.list[key].title).substring(0, 100);


            const video_title = obj.list[key].title;

            // each video title truncated
            const video_label = (video_title.length > 30) ? video_title.substring(0,30)+'..' : video_title;

            // each video url
            const url = obj.list[key].url;



            let status_bar;
            let prev_total = 0;

            return new Promise(
              (resolve, reject) => {
                ytdl(url, { filter: (format) => format.container === 'mp4' })
                  .on('response', function(res){

                    const total_bytes = parseInt(res.headers['content-length'], 10);
                    //console.log(total_bytes)
                    status_bar = View.addBar(total_bytes);




                  })

                  .on( 'error', function(error){
                    reject(error);
                  })

                  .on( 'progress', function(a,b,c){
                    // b gives us a running total
                    let diff = b - prev_total; // so we subtract the previous total
                    View.tickBar(status_bar, video_label, diff); // write the delta
                    prev_total = b; // and store the previous total for the next round
                  })
                  .on('finish', function() {
                    resolve()
                  })
                  .pipe(
                    fs.createWriteStream(save_path + video_file_name + ".mp4")
                      .on('error', (error) => reject(error))
                  );

              }); //single download promise

          }); // download_promises .map

          Promise.all(download_promises)
            .then(() => {

              View.haltBars(); // Shut down the status bars
              View.printLineBreaks(2);
              resolve(playlist_name);
            })
            .catch( (error) => {
              Controller.handleError(error);
            });








    }); // outer promise





  } // getMP4s()



  // return public methods
  return {
    setDownloadLimit,
    setSavePath,
    getMP4s

  }
})();

export default Downloader;

// function leech(playlist) {
//
//
//   const fs = require('fs');
//   const ytdl = require('ytdl-core');
//
//     var regex = /\=(.*)/gm;
//     playlist.forEach(function(val){
//       var videoName = val.substr(val.indexOf("=") + 1);
//       //console.log("Writing " + videoName + ".mp4");
//       ytdl(val, { filter: (format) => format.container === 'mp4' })
//         .on('response', function(res){
//           process.stdout.write("\u001b[1D");
//           console.log("Downloading: " + videoName + ".mp4");
//
//         })
//
//
//         .on( 'progress', function(a,b,c){
//           process.stdout.write("\u001b[1D");
//           process.stdout.write(spinner[spinnerinc]);
//           spinnerinc = (spinnerinc < 2) ? spinnerinc + 1 : 0;
//         })
//         .on('finish', function() {
//           process.stdout.write("\u001b[1D");
//           console.log("Complete: " + videoName + '.mp4');
//         })
//         .pipe(fs.createWriteStream("./downloads/" + videoName + ".mp4"));
//     });
//
//   }