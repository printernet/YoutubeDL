'use strict';

// Didnt use bluebird, ramda, lodash or async...
// The reason is that I wanted to better understand
// the more vanilla promises approach to this.

import Controller from './controller.js';
import View from './view.js';
import Playlists from './playlists.js';
import Downloader from './download.js';

// var args = process.argv.slice( 2 );

// const TEST_ARGS_BAD = ["https://www.youtube.com/playlist?list=PLQkQfzsIUwRYJt9v3lOZqTH9HNi9Ewnsn", "boop prop", "https://", "playlist", "https://www.youtube.com/playlist?list=2984fy2398fy2398y23f9823yf928y"];
const TEST_ARGS_GOOD_MULTI = [
  "https://www.youtube.com/playlist?list=PL50KW6aT4Ugz6FqtCJftO9ZcXhUpQELqb",
  "https://www.youtube.com/playlist?list=PLyIVzbHD-NzLFfcAjSR_BQgl7qbejVQTp",
  "https://www.youtube.com/playlist?list=PLbgqvuoYGITffYqX41_R8fcb6EGe0f7Ob"
];
// const TEST_ARGS_GOOD_SINGLE = [
//   "https://www.youtube.com/playlist?list=PL50KW6aT4Ugz6FqtCJftO9ZcXhUpQELqb"
// ];

const TEST_ARGS_GOOD_TWOSHORT = [
  "https://www.youtube.com/playlist?list=PLHyj081b8bfOx7J3scgjkgp5P29h2qR13",
  "https://www.youtube.com/playlist?list=PLHyj081b8bfNyZqDsihgjfY8FJ6y_Lv2x"
];

var args = TEST_ARGS_GOOD_MULTI;

// TEMP VARS FOR TESTING, CONVERT THESE TO CMDLINE ARGS
const limit_dls = 4;
const save_path = __dirname + "/../downloads/";

// Register these settings in our download manager
Downloader
  .setSavePath(save_path)
  .setDownloadLimit(limit_dls);

// Were going to need to map over all the args and split the args up into types, we should
// make an object to store the args, then we can pass some of them along to the
// downloader, like the save path, the max D/Ls simultaniously and of then the playlist urls
// We can identify the max d/ls as an integer and the urls if they pass the validity test.
// The path could be first, the d/ls could be second and everything else after that passes url test
// is a playlist

// THIS RETURNS TRUE OR FALSE FOR A PLAYLIST
// Playlists.isValidPlaylistUrl(##STRING##);


View.printLineBreaks(1);
View.printMessage("YouTube® Playlist Downloader", true);
View.printLineBreaks(2);
View.printMessage("Saving files to: " + save_path, false, true);
View.printLineBreaks(1);
// Grab Playlists
Playlists.getPlaylists(args)
  .then((playlists) => {
      Controller.setPlaylists(playlists)
        .reduce(function(p, item) {
             return p.then(function() {
                //View.printMessage("Downloading Item");

                return Downloader.getMP4s(item)
                  .then((res) => {
                    // THINGS HAPPEN HERE FOR EACH ITERATION
                    // EG EACH PLAYLIST DOWNLOAD COMPLETION

                    //console.log(res);

                  });
             });
         }, Promise.resolve())
         .then(function(result) {
           // all done here
           View.printMessage("All downloads finished.", true);
           View.printSimple("YouTube® is a registered trademark of Alphabet inc. This software has no affiliation with Youtube® or Alphabet inc.");
         })
         .catch( (error) => {
           Controller.handleError(error);
         })






  })
  .catch( (error) => {
    Controller.handleError(error);
  });






