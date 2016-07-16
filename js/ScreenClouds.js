(function () {

  Game.ScreenClouds = function (stage, myTwitterPostFetcher) {
    var self = this;

    var _container;
    var _range = 5000;
    var _speed = -20;
    var _clouds = [];
    var _bg;
    var _mini3d;
    var _count = 0;
    var _hasTweetOnScreen = false;
    var _tweet = null;
    var _text;
    var _name;

    var _randomHelper = {};
    _randomHelper.random = function (a, b) {
      return Math.random() * (b - a) + a;
    };
    _randomHelper.randomInt = function (a, b) {
      return Math.round(_randomHelper.random(a, b));
    };

    self.show = function () {
      PIXI.ticker.shared.add(updateClouds);

      _container.visible = true;
      _container.alpha = 0;
      _container.y = 400;

      showText();

      var tl = new TimelineLite({delay: 1.5});
      tl.to(_container, 5.0, {alpha: 1, ease: Quad.easeIn}, 0);
      tl.to(_container, 10.0, {y: 0}, 0);
      tl.to(_name, 1.0, {alpha: 1}, 4.5);
      tl.call(myTwitterPostFetcher.fetch, null, null, 8.0);
    };

    function showText() {
      var context = {};
      context.t = 0;
      context.j = 0;

      var duration = 2.0;

      var fullText = "do you wonder what the \ntwittersphere looks like @jsinsa?";

      TweenMax.to(context, duration, {
        t: fullText.length,
        ease: Linear.easeOut,
        onUpdate: function () {
          var j = Math.round(context.t);
          if (j != context.j) {
            _text.text = fullText.substring(0, j);
          }
          context.j = j;
        },
        onComplete: function () {
          var tl = new TimelineLite();
          tl.to(_text, 1.0, {
            delay: 3,
            alpha: 0
          });
          tl.call(function () {
            _text.style = {font: "50px " + Constants.FONT, fill: "#000", align: "center"};
            _text.text = "now would be a good time to start tweeting :)";
          });
          tl.to(_text, 1.0, {alpha: 1});
          tl.to(_text, 1.0, {delay: 2, alpha: 0});
        }
      });
    }

    function updateClouds(delta) {
      for (var t = 0; t < _clouds.length; t++) {
        var e = _clouds[t];
        e.position3d.z += _speed;

        if (e.position3d.z < 300) {
          e.alpha = e.position3d.z / 300;
        }
        else {
          e.alpha += 0.01 * (1 - e.alpha);
        }

        if (e.position3d.z < 0) {

          // destroy the texture if it's a tweet
          if (e.isTweet) {
            _hasTweetOnScreen = false;
            var textureToDestroy = e.texture;
            e.texture = loader.resources["skyCloud" + _randomHelper.randomInt(1, 2)].texture;
            e.isTweet = false;
            textureToDestroy.destroy(true);
          }

          e.scaleRatio = 5;
          e.position3d.z += _range;
          e.position3d.x = _randomHelper.random(-4500, 4500);
          e.position3d.y = 1200 - Math.abs(0.2 * e.position3d.x) + _randomHelper.random(0, 200);
          e.rotation = e.position3d.x * -2e-4;
          e.alpha = 0;
          e.scaleOffset.x = _randomHelper.random(0.6, 1.4);
          e.scaleOffset.y = _randomHelper.random(0.9, 1.1);

          if (Math.random() < 0.5) {
            e.scaleOffset.x *= -1;
          }

          var isTweet = false;

          if (!_hasTweetOnScreen) {
            if (!_tweet) {
              _tweet = myTwitterPostFetcher.getNext();
            }
            else if (_tweet.ready) {
              e.texture = _tweet.texture;
              e.scaleOffset.x = 1;
              e.scaleOffset.y = 1;
              e.position3d.x = _randomHelper.random(-500, 500);
              e.position3d.y = -200;
              e.rotation = e.position3d.x * -2e-4;
              e.isTweet = true;

              _tweet = null;
              _hasTweetOnScreen = true;
              isTweet = true;
            }
            else if (_tweet.error) {
              _tweet = null;
            }
          }
        }
      }

      _mini3d.update();
      _count += delta;
      _mini3d.view.rotation = 0.08 * Math.cos(0.02 * _count);
      _mini3d.rotation3d.y = 0.2 * Math.sin(0.02 * _count * 0.5);
      _mini3d.rotation3d.x = 0.2 * Math.cos(0.02 * _count * 0.5);
    }

    self.create = function () {
      _container = new PIXI.Container();
      _container.visible = false;
      stage.addChild(_container);

      _text = new PIXI.Text("", {font: "50px " + Constants.FONT, fill: "#ffffff", align: "center"});
      _text.anchor.set(0.5, 0.5);
      _text.position.set(1024 / 2, 768 / 2);
      stage.addChild(_text);

      _name = new PIXI.Text("Entry by Christiaan Visser", {font: "20px " + Constants.FONT, fill: "#ffffff"});
      _name.anchor.set(0.5, 0);
      _name.position.set(1024 / 2, 5);
      _name.alpha = 0;
      stage.addChild(_name);

      _bg = new PIXI.Sprite(loader.resources["skyBG"].texture);
      _bg.position.set(-188, -768);
      _container.addChild(_bg);

      _mini3d = new Mini3d();
      _mini3d.view.x = 1024 / 2;
      _mini3d.view.y = 768 / 2;
      _container.addChild(_mini3d.view);

      for (var e = 0; 50 > e; e++) {
        var i = new Game.Cloud(loader.resources["skyCloud" + _randomHelper.randomInt(1, 2)].texture);
        _mini3d.addChild(i);
        _clouds.push(i);
        i.position3d.z = -(_range / 50) * e;
      }
    }
  };

})();