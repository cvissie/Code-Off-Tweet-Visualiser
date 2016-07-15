var myTwitterPostFetcher = Game.TwitterPostFetcher.getInstance();

var ticker = PIXI.ticker.shared;
ticker.autoStart = false;
ticker.stop();

var renderer = new PIXI.WebGLRenderer(1400, 768, {view: document.getElementById("myCanvas")});

var stage = new PIXI.Container();
stage.position.set(188, 0);

var loaderOptions = {crossOrigin:true};

var loader = new PIXI.loaders.Loader();
loader.add("skyCloud1", "assets/skyCloud1.png", loaderOptions);
loader.add("skyCloud2", "assets/skyCloud2.png", loaderOptions);
loader.add("skyBG", "assets/skyBG.jpg", loaderOptions);
loader.on("progress", onLoaderProgress);
loader.load();

var sound = new Howl({
  src: ["sounds/music2.mp3"],
  autoplay: false,
  loop: true,
  preload: false
});

sound.once("load", onSoundLoaded);
sound.load();

var screenLoader = new Game.ScreenLoader(stage);
screenLoader.onReady = onLoaderComplete;
screenLoader.create();

var screenClouds = new Game.ScreenClouds(stage, myTwitterPostFetcher);

function animate(time) {
  ticker.update(time);
  renderer.render(stage);
  requestAnimationFrame(animate);
}
animate(performance.now());

function onSoundLoaded() {
  screenLoader.soundsLoaded = true;
  sound.play();
  sound.fade(0, 0.5, 2.0);
}

function onLoaderProgress(loader) {
  screenLoader.assetsProgress = loader.progress;
}

function onLoaderComplete() {
  screenLoader.hide();

  TweenMax.delayedCall(2, function () {
    screenClouds.create();
    screenClouds.show();
  });
}

function setupWindowResize() {
  var documentElement = document.documentElement;
  var body = document.body;

  var div = document.getElementById("myCanvas");

  var maxScale = 0;
  var offsetX = 0;
  var offsetY = 0;

  var actualWidth = 1400;
  var actualHeight = 768;
  var designWidth = 1024;
  var designHeight = 768;

  var actualRatio = 1 / (actualWidth / actualHeight);
  var designRatio = 1 / (designWidth / designHeight);

  // determine the scaling prefix
  var scalingPrefix;
  var transformPrefix;
  if ("webkitTransform" in document.body.style) {
    scalingPrefix = "webkitTransform";
    transformPrefix = "webkitTransformOrigin";
  }
  else if ("mozTransform" in document.body.style) {
    scalingPrefix = "mozTransform";
    transformPrefix = "mozTransformOrigin";
  }
  else if ("transform" in document.body.style) {
    scalingPrefix = "transform";
    transformPrefix = "transformOrigin";
  }
  else if ("msTransform" in document.body.style) {
    scalingPrefix = "msTransform";
    scalingPrefix = "msTransformOrigin";
  }

  documentElement.style.width = "100%";
  documentElement.style.height = "100%";
  documentElement.style.overflow = "hidden";
  body.style.width = "100%";
  body.style.height = "100%";
  body.style.background = "black";

  function onResize() {
    var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var windowHeight = window.innerHeight;

    var w, h;
    h = windowHeight;
    w = windowHeight / actualRatio;

    var windowRatio = 1 / (windowWidth / windowHeight);
    if (windowRatio > designRatio) {
      w = windowWidth;
      h = w * designRatio;	// screen width * designratio = height
      w = h / actualRatio;	// width = ratio * height
    }

    var scale = h / designHeight;
    if (maxScale != 0 && scale > maxScale) {
      scale = maxScale;
      h = actualHeight * scale;
      w = actualWidth * scale;
    }

    var x, y;
    x = (windowWidth - w) / 2;
    y = (windowHeight - h) / 2;

    x = x + offsetX * scale;
    y = y + offsetY * scale;

    scale = scale.toFixed(3);

    var style = div.style;
    style.left = x + "px";
    style.top = y + "px";
    style.width = actualWidth + "px";
    style.height = actualHeight + "px";
    style.position = "absolute";
    style[transformPrefix] = "0px 0px 0px";
    style[scalingPrefix] = "scale(" + scale + ")";
  }

  onResize();

  window.addEventListener("resize", onResize);
}

setupWindowResize();


