(function () {

  var Cloud = function (t) {
    PIXI.Sprite.call(this, t);

    this.position3d = {
      x: 0, y: 0, z: 0
    };
    this.scaleRatio = 2;
    this.scaleOffset = new PIXI.Point(1, 1)
    this.isTweet = false;
  };

  Cloud.prototype = Object.create(PIXI.Sprite.prototype);

  Game.Cloud = Cloud;

})();