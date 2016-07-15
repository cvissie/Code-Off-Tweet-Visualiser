(function () {

  Game.ScreenLoader = function (stage) {
    var self = this;

    var _view;
    var _text;

    var _soundsLoaded = false;
    var _imagesProgress = 0;

    self.onReady = null;

    self.create = function () {
      _view = new PIXI.Container();
      stage.addChild(_view);

      _text = new PIXI.Text("", {font: "22px Calibri", fill: 0xffffff});
      _text.anchor.set(0.5, 0.5);
      _text.position.set(1024 / 2, 768 / 2);
      _view.addChild(_text);

      TweenMax.delayedCall(5, setSoundsLoaded);
    };

    self.hide = function () {
      TweenMax.to(_view, 1.0, {
        alpha: 0,
        onComplete: function () {
          stage.removeChild(_view);
        }
      });
    };

    function setSoundsLoaded() {
      self.soundsLoaded = true;
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
        text += "images loading... " + _imagesProgress.toFixed(2) + "%\n";
        ready = false;
      }
      else {
        text += "images loaded.\n";
      }

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
      }
    });
  };

})();