
import Controller from './controller.js';



// the goal of this module is to get playlist data into the model so the downloader can work on it
const Playlists = (function() {
  const ytlist = require( 'youtube-playlist' );
  var fetchVideoInfo = require('youtube-info');
  var scrape = require('html-metadata');





  // test validity of playlist string
  const isValidPlaylistUrl = e => ( e.search( "https://www.youtube.com/playlist") != -1 );

  // returns video info in a promise
  const getVideoInfo = video_id => fetchVideoInfo(video_id).then((videoInfo) => videoInfo);

  // takes an array of url strings
  const getPlaylists = arr => {

    // Store our playlist objects
    let playlists = [];

    // add metadata to the array of playlists
    // returns Promise > function > list
    const addMetaData = (arr,i) => {

      // an array to collect promises in
      let promises_getVideoInfo = [];

      // we are going to return an obj so make one from the input array
      const list = Object.assign({},arr);


      // loop through list, fetch metadata, collect promises
      // each promise writes the metadata to the list when it resolves
      for (let url in list) {
        const promise = getVideoInfo(list[url].substr(list[url].length - 11))
        .then((res) => {
          list[url] = {
            url: list[url],
            title: res.title
          };
        })
        .catch( (error) => {
          Controller.handleError(error);
        })

          promises_getVideoInfo.push(promise);
      } //for

      return Promise.all(promises_getVideoInfo)
        .then(() => {
          //console.log(list,i);
          playlists[i].list = list;
        })

    } // addMetaData

    // returns false for strings of null, undefined, and ""
    // returns true for non empty strings
    // returns false for empty objects or arrays
    // returns true for populated objects or arrays
    const isNotEmpty = (item) => {
      if (typeof item == "string")
        return (item != null && item != undefined && item != "")
      if (typeof item == "object"){
        for(let key in item) {
        if(item.hasOwnProperty(key))
          return true;
        }
        return false;
      }

    };

    // check to see if the url looks like a youtube playlist url
    const mapValidUrl = (item) => { if (isValidPlaylistUrl(item)) return { url: item } };

    // fetch the youtube playlist data
    const getYTList = (obj,i) => {
      return new Promise(
        (resolve, reject) => {
          ytlist( obj.url, 'url' )
            .then( res => {
              playlists[i].list = res.data.playlist;
              resolve( res );
            })
            .catch( error => reject(error));
        }
      );
    }


    return new Promise(
      (resolve, reject) => {

        // map over input array filter out bad urls
        playlists = arr
          .map(item => mapValidUrl(item))
          .filter(item => isNotEmpty(item));

        // map over playlists urls fetch youtube playlist
        let getYTList_promises = playlists
          .map((item,i) => getYTList(item,i));


        // When all playlists fetching is done
        Promise.all(getYTList_promises)
          .then(() => {
            playlists = playlists
              .filter(item => isNotEmpty(item.list));  // remove empty items returned by YTlist

            // get the titles for the playlists themselves
            let get_title_promises = playlists
              .map((item) => {
                return scrape(item.url).then(metadata => item.name = metadata.general.title.replace(" - YouTube",""));
              });

            // all the titles have been fetched
            Promise.all(get_title_promises)
              .then(() => {
                // map over playlists and add metadata, collect promises for later
                let addMetaData_promises = playlists
                  .map((item,i) => addMetaData(item.list,i));


                // After all meta data is collected we pass the playlists object back
                Promise.all(addMetaData_promises)
                  .then((res) => resolve( playlists )) // here we resolve the main returned promise and expose playlists
                  .catch( (error) => {
                    Controller.handleError(error);
                  });


                })
                .catch( (error) => {
                  Controller.handleError(error);
                });






          }) // YTList .then()
          .catch( (error) => {
            Controller.handleError(error);
          });
        });
  }; // getPlaylists

  // expose public methods
  return {
    getPlaylists,
    isValidPlaylistUrl
  }
})();

export default Playlists;