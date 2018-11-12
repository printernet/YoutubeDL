

const colors = require('colors');
import Multibar from './multibar.js';

const View = (function () {
  // keep status bars here
  let status_bars  = [];
  // new instance of multibar (wrapper around progress package)
  const mbars = new Multibar();

  // add a status bar
  // returns position on array
  const addBar = (total) => {
    status_bars.push(mbars.newBar('  :title [:bar] | :percent | :etas left', {
        complete: '░'.magenta
      , incomplete: '-'.grey.dim
      , width: 40
      , total: total
    }));
    //return status_bars[status_bars.length - 1];
    return status_bars.length - 1;
  }

  // advance a progress bar
  // required int i : position in status_bars array of status bar object
  // required string title_label : title string
  // optional int step : amount to step by, defaults to 1
  const tickBar = (i, title_label, step) => status_bars[i].tick((step || 1), { title: title_label + ': '.magenta.bold });

  // shut down all bars
  const haltBars = () => mbars.terminate();

  // AT&FE1Q0V1X4&C1&D2 ATDT8675309 Lol.
  const printMessage = (message, use_emoji, yellow=false) => {
    const emojis = ["🐶", "🐱", "🐭","🐹","🐰","🦊","🐻", "🐼", "🐸"]; // dont ask
    let emoji_string = (use_emoji === true) ? "  " + emojis[Math.floor(Math.random() * 8)] : "";


    const padding = 6;
    let bg_1 = "\u001b[44m";
    let bg_2 = "\u001b[43m";
    let fg_1 = "\u001b[37;1m";
    const reset_color = "\u001b[0m";
    const y_padding = (bg_color, length=message.length) => bg_color + " ".repeat(length + padding) + reset_color;

    if (yellow === true) {
      bg_1 = "\u001b[43;1m";
      bg_2 = "\u001b[43m";
      fg_1 = "\u001b[30m";
    }


      process.stdout.write(y_padding(bg_1));
      printLineBreaks(1);
      process.stdout.write(bg_1 + fg_1 + " ".repeat(padding / 2) + message + " ".repeat(padding / 2) + reset_color + emoji_string);
      printLineBreaks(1);
      process.stdout.write(y_padding(bg_1));
      printLineBreaks(1);


  }

  const printLineBreaks = (n = 1) => process.stdout.write("\n".repeat(n));

  const printSimple = (m) => process.stdout.write("\n" + m + "\n");
  // return public methods

  return {
    addBar,
    tickBar,
    haltBars,
    printMessage,
    printLineBreaks,
    printSimple
  }
})();

export default View;