(function () {

  Game.ScreenLoader = function (stage) {
    var self = this;

    var _view;
    var _text;

    var _fontsLoaded = false;
    var _soundsLoaded = false;
    var _imagesProgress = 0;

    self.onReady = null;

    self.create = function () {
      _view = new PIXI.Container();
      stage.addChild(_view);

      _text = new PIXI.Text("", {font: "22px sans-serif", fill: 0xffffff, align: "center"});
      _text.anchor.set(0.5, 0.5);
      _text.position.set(1024 / 2, 768 / 2);
      _view.addChild(_text);

      TweenMax.delayedCall(10, setNonCriticalLoaded);
    };

    self.hide = function () {
      TweenMax.to(_view, 1.0, {
        alpha: 0,
        onComplete: function () {
          stage.removeChild(_view);
        }
      });
    };

    function setNonCriticalLoaded() {
      self.soundsLoaded = true;
      self.fontsLoaded = true;
    }

    function updateText() {
      var text = "";

      var ready = true;

      if (_soundsLoaded) {
        text += "sounds loaded.\n";
      }
      else {
        text += "sounds loading...\n";
        ready = false;
      }

      if (_imagesProgress != 100) {
        text += "images loading... " + _imagesProgress.toPrecision(2) + "%\n";
        ready = false;
      }
      else {
        text += "images loaded.\n";
      }

      if (_fontsLoaded) {
        text += "fonts loaded.\n";
      }
      else {
        text += "fonts loading...\n";
        ready = false;
      }

      text += "\n";
      text += "the visualizer will start after 10 secs if non-critical files failed to load";

      text = text.trim();

      _text.text = text;

      if (ready) {
        if (self.onReady) {
          self.onReady();
          self.onReady = null;
        }
      }
    }

    Object.defineProperties(self, {
      soundsLoaded: {
        set: function (value) {
          _soundsLoaded = value;
          updateText();
        }
      },
      assetsProgress: {
        set: function (value) {
          _imagesProgress = value;
          updateText();
        }
      },
      fontsLoaded: {
        set: function (value) {
          _fontsLoaded = value;
          updateText();
        }
      }
    });
  };

})();