import Model from './model.js';

const Controller = (function () {



  // Print errors and die
  const handleError = (error) => {
    console.error(error);
    //process.exit();
  }


  const setPlaylists = (playlists) => {
    Model.playlists = playlists;
    return getPlaylists(); 
  }
  const getPlaylists = () => Model.playlists

  // return public methods
  return {
    handleError,
    getPlaylists,
    setPlaylists
  }
})();

export default Controller;