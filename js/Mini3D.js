(function () {

  function depthSorter(a, b) {
    return a.depth - b.depth
  }

  var Mini3d = function () {
    this.view = new PIXI.Container();
    this.children = [];
    this.focalLength = 400;
    this.position3d = {
      x: 0, y: 0, z: 0
    };
    this.rotation3d = {
      x: 0, y: 0, z: 0
    };
  };

  Mini3d.prototype.addChild = function (t) {
    t.position3d || (t.position3d = {
      x: 0, y: 0, z: 0
    });
    t.anchor.set(0.5, 0.5);
    this.view.addChild(t);
    this.children.push(t);
  };

  Mini3d.prototype.update = function () {
    var position3d = this.position3d;
    var rotation3d = this.rotation3d;
    var children = this.children;
    for (var t, e, i, n, o, s, a, h, l, u, c = Math.sin(rotation3d.x), d = Math.cos(rotation3d.x), p = Math.sin(rotation3d.y), f = Math.cos(rotation3d.y), m = Math.sin(rotation3d.z), v = Math.cos(rotation3d.z), g = 0; g < children.length; g++) {
      var y = children[g];
      t = y.position3d.x - position3d.x;
      e = y.position3d.y - position3d.y;
      i = y.position3d.z - position3d.z;
      n = d * e - c * i;
      o = c * e + d * i;
      a = f * o - p * t;
      s = p * o + f * t;
      h = v * s - m * n;
      l = m * s + v * n;
      u = this.focalLength / (this.focalLength + a);
      t = h * u;
      e = l * u;
      i = a;
      y.scale.x = y.scale.y = u * y.scaleRatio;
      y.scale.x *= y.scaleOffset.x;
      y.scale.y *= y.scaleOffset.y;
      y.depth = -y.position3d.z;
      y.position.x = t;
      y.position.y = e;
    }
    this.view.children.sort(depthSorter)
  };

  window.Mini3d = Mini3d;

})();
