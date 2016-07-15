(function () {

  var tweetList = {};
  var isFirstFetch = true;

  var configProfile = {
    "profile": {"screenName": 'jsinsa'},
    "domId": 'jsinsa_profile',
    "maxTweets": 20,
    "enableLinks": true,
    "showUser": true,
    "showTime": true,
    "showImages": true,
    "lang": 'en',
    "customCallback": handleTweets
  };

  function TwitterPostFetcher() {
    var self = this;

    var _newPosts = [];
    var _oldPosts = [];
    var _oldPostIndex = 0;

    self.fetch = function () {
      reallyFetch();
      setInterval(reallyFetch, 5000);
    };

    self.getNext = function () {
      var post = null;
      if (_newPosts.length) {
        post = _newPosts.pop();
        _oldPosts.push(post);
      }
      else if (_oldPosts.length) {
        post = _oldPosts[_oldPostIndex];
      }
      if (_oldPosts.length) {
        _oldPostIndex = (_oldPostIndex + 1) % _oldPosts.length;
      }
      return self.parseTweet(post);
    };

    self.push = function (post, isFirstFetch) {
      if (isFirstFetch) {
        _oldPosts.unshift(post);
      }
      else {
        _newPosts.push(post);
      }
    };

    self.parseTweet = function (tweet) {
      if (!tweet) {
        return null;
      }
      var ret = {};
      ret.error = false;
      ret.texture = null;
      ret.ready = false;
      ret.tweet = tweet;
      parseTweet(ret);
      return ret;
    };

    function reallyFetch() {
      twitterFetcher.fetch(configProfile);
    }
  }

  var onlyInstance = new TwitterPostFetcher();

  Game.TwitterPostFetcher = {
    getInstance: function () {
      return onlyInstance;
    }
  };

  /**
   * Just a quick and dirty load context
   * @param complete
   * @constructor
   */
  var LoadContext = function (complete) {
    var self = this;

    var _count = 0;
    var _ready = false;
    var _completeCalled = false;

    self.addImgTag = function (url) {
      _count++;

      var source = new Image();
      source.crossOrigin = determineCrossOrigin(url);

      if ((source.complete || source.getContext) && source.width && source.height) {
        return;
      }

      source.onload = function () {
        cleanup();
        onResourceComplete();
      };
      source.onerror = function () {
        cleanup();
      };

      function cleanup() {
        source.onload = null;
        source.onerror = null;
      }

      source.src = url;
      return source;
    };

    self.ready = function () {
      _ready = true;
      checkComplete();
    };

    function onResourceComplete() {
      _count--;
      checkComplete();
    }

    function determineCrossOrigin(url, loc) {
      // data: and javascript: urls are considered same-origin
      if (url.indexOf('data:') === 0) {
        return '';
      }

      return 'anonymous';
    }

    function checkComplete() {
      if (!_ready) {
        return;
      }
      if (_count <= 0 && !_completeCalled) {
        _completeCalled = true;
        complete();
      }
    }
  };

  function handleTweets(tweetStrings) {
    for (var i = tweetStrings.length - 1; i >= 0; --i) {
      var tweetString = tweetStrings[i];

      var key = getTweetKey(tweetString);

      // check if we already have this tweet - update it to latest
      var data = tweetList[key];
      if (data) {
        data.string = tweetString;
        continue;
      }

      data = {
        string: tweetString,
        key: key
      };
      tweetList[key] = data;

      onlyInstance.push(data, isFirstFetch);
    }

    isFirstFetch = false;
  }

  function getTweetKey(tweetString) {
    var i = tweetString.indexOf("?in_reply_to");
    if (i == -1) {
      return null;
    }
    i += 13;
    var j = tweetString.indexOf("\"", i);
    return tweetString.substring(i, j);
  }

  function parseTweet(ret) {
    var tweet = ret.tweet;
    var tweetString = tweet.string;

    // console.log(tweetString);

    var tweetDiv = document.createElement("div");
    tweetDiv.innerHTML = tweetString;

    // avatar name
    var elAvatarNameSpan = tweetDiv.querySelector("span[data-scribe='element:name']");
    if (!elAvatarNameSpan) {
      console.log("bad avatar name el");
      ret.error = true;
      return;
    }
    var avatarName = elAvatarNameSpan.getAttribute("title");
    if (!avatarName) {
      console.log("bad avatar name");
      ret.error = true;
      return;
    }

    // avatar handle
    var elAvatarHandleSpan = tweetDiv.querySelector("span[data-scribe='element:screen_name']");
    if (!elAvatarHandleSpan) {
      console.log("bad avatar handle el");
      ret.error = true;
      return;
    }
    var avatarHandle = elAvatarHandleSpan.getAttribute("title");
    if (!avatarName) {
      console.log("bad avatar handle");
      ret.error = true;
      return;
    }

    // avatar URL
    var elAvatarImg = tweetDiv.querySelector("img[data-scribe='element:avatar']");
    if (!elAvatarImg) {
      ret.error = true;
      return;
    }
    var avatarImgUrl = elAvatarImg.getAttribute("data-src-2x");
    if (!avatarImgUrl) {
      avatarImgUrl = elAvatarImg.getAttribute("data-src-1x");
    }
    if (!avatarImgUrl) {
      console.log("bad avatar URL");
      ret.error = true;
      return;
    }

    // time posted
    var elTimePosted = tweetDiv.querySelector(".timePosted > a");
    if (!elTimePosted) {
      console.log("bad time posted el");
      ret.error = true;
      return;
    }
    var timePosted = elTimePosted.textContent;

    // tweet
    var elTweet = tweetDiv.querySelector("p.tweet");
    if (!elTweet) {
      console.log("bad tweet el");
      ret.error = true;
      return;
    }

    // create the load context so long
    var loadContext = new LoadContext(onComplete, onError);

    // now parse the tweet (any inline images will be added to the load list)
    var messageData = parseTweetMessage(elTweet, loadContext);

    // media
    var mediaData = parseTweetMedia(tweetDiv.querySelector("div.media > img"), loadContext);

    // add any other images to load to the context
    var avatarImg = loadContext.addImgTag(avatarImgUrl);
    loadContext.ready();

    function onComplete() {
      // console.log("drawing!!");

      // lets draw it to it's own canvas
      var canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.left = "400px";

      var ctx = canvas.getContext("2d");

      ctx.font = "22px " + Constants.FONT;
      var textDrawInstructions = getTextDrawInstructions(ctx, 0, 90, messageData, 390);

      canvas.width = 400;
      canvas.height = mediaData ? textDrawInstructions.y + 210 : textDrawInstructions.y;

      ctx.drawImage(avatarImg, 5, 5, 80, 80);

      ctx.font = "bold 22px " + Constants.FONT;
      ctx.fillStyle = "#000";
      ctx.textBaseline = "top";
      drawText(ctx, 90, 5, avatarName, "left");

      ctx.font = "18px " + Constants.FONT;
      drawText(ctx, 90, 30, avatarHandle, "left");

      ctx.font = "18px " + Constants.FONT;
      drawText(ctx, 90, 65, timePosted, "left");

      ctx.font = "22px " + Constants.FONT;
      drawTweet(ctx, textDrawInstructions);

      if (mediaData) {
        var mediaWidth = mediaData.img.width;
        var mediaHeight = mediaData.img.height;
        if (mediaWidth > 390 || mediaHeight > 200) {
          var scale = 200 / mediaHeight;
          if (scale > 0) {
            mediaWidth *= scale;
            mediaHeight *= scale;
          }
          if (mediaWidth > 390) {
            scale = 390 / mediaWidth;
            mediaWidth *= scale;
            mediaHeight *= scale;
          }
        }

        ctx.drawImage(mediaData.img, 0, textDrawInstructions.y + 10, mediaWidth, mediaHeight);
      }

      // we are ready!!!
      ret.texture = PIXI.Texture.fromCanvas(canvas);
      ret.ready = true;
    }

    function onError() {
      ret.error = true;
    }
  }

  /**
   * Fucking hell what a hack!!! But it works!!!
   * @param ctx
   * @param x
   * @param y
   * @param data
   * @param maxWidth
   * @returns {{}}
   */
  function getTextDrawInstructions(ctx, x, y, data, maxWidth) {
    var ox = x;

    var ret = {};
    ret.list = [];

    var space = ctx.measureText(" ").width;

    var lineHeight = 25;
    for (var i = 0; i < data.length; ++i) {
      var segment = data[i];

      if (segment.type == "img") {
        if (x + 24 > maxWidth) {
          x = ox;
          y += lineHeight;
        }
        ret.list.push({
          img: segment.img,
          x: x,
          y: y,
          type: "img"
        });
        x += 24;
        continue;
      }

      var fillStyle;
      if (segment.type == "link") {
        fillStyle = "#0033b4";
      }
      else if (segment.type == "text") {
        fillStyle = "#000";
      }

      if (segment.type == "link" || segment.type == "text") {
        var text = segment.text;
        if (!text || text.length <= 0) {
          continue;
        }
        var lines = text.split("\n");

        for (var j = 0; j < lines.length; ++j) {
          var line = lines[j];
          if (!line || line.length <= 0) {
            y += lineHeight;
            x = ox;
            continue;
          }
          var words = line.split(' ');
          for (var k = 0; k != words.length; ++k) {
            var word = words[k];
            if (word.length <= 0) {
              continue;
            }
            var testWidth = ctx.measureText(word).width;
            if (testWidth + x > maxWidth && x != ox) {
              x = ox;
              y += lineHeight;
            }
            ret.list.push({
              word: word,
              x: x,
              y: y,
              fillStyle: fillStyle,
              type: "text"
            });
            x = x + space + testWidth;
          }
          if (j != lines.length - 1) {
            y += lineHeight;
            x = ox;
          }
        }
      }
    }

    ret.y = y + lineHeight;
    return ret;
  }

  function drawTweet(ctx, instructions) {
    for (var i = 0; i != instructions.list.length; ++i) {
      var instruction = instructions.list[i];
      if (instruction.type == "text") {
        ctx.fillStyle = instruction.fillStyle;
        ctx.fillText(instruction.word, instruction.x, instruction.y);
      }
      else if (instruction.type == "img") {
        ctx.drawImage(instruction.img, instruction.x - 12, instruction.y, -12, 24, 24);
      }
    }
  }

  function drawText(ctx, x, y, text, align) {
    var metrics = ctx.measureText(text);
    if (align == "right") {
      x -= metrics.width;
    }
    ctx.fillText(text, x, y);
    return metrics.width + x;
  }

  function parseTweetMessage(el, loadContext) {
    var data = [];
    var nodes = el.childNodes;
    for (var i = 0, len = nodes.length; i != len; ++i) {
      var node = nodes[i];
      if (node.nodeType == 3) {
        parseTweetNodeText(data, node);
      }
      else if (node.nodeType == 1) {
        var tag = node.tagName;
        if (tag) {
          tag = tag.toLowerCase();
          if (tag == "a") {
            parseTweetNodeLink(data, node);
          }
          else if (tag == "img") {
            parseTweetNodeImage(data, node, loadContext);
          }
        }
      }
    }
    return data;
  }

  function parseTweetNodeText(data, node) {
    var text = node.textContent;
    if (!text || text.length <= 0) {
      return;
    }
    data.push({
      text: text,
      type: "text"
    });
  }

  function parseTweetNodeLink(data, el) {
    var text = "";
    var nodes = el.childNodes;
    for (var i = 0, len = nodes.length; i != len; ++i) {
      var node = nodes[i];
      if (node.nodeType == 3) {
        text += node.textContent;
        continue;
      }
      var tag = node.tagName;
      if (tag) {
        tag = tag.toLowerCase();
        if (tag == "span") {
          text += node.textContent;
        }
      }
    }
    if (text.length <= 0) {
      return;
    }
    data.push({
      text: text,
      type: "link"
    });
  }

  function parseTweetNodeImage(data, el, loadContext) {
    if (!el) {
      return null;
    }

    var url = el.getAttribute("src");
    if (!url || url.length <= 0 || url == "undefined") {
      return null;
    }

    return null;
    /*
     data.push({
     img: loadContext.addImgTag(url),
     type: "image"
     });
     */
  }

  function parseTweetMedia(el, loadContext) {
    if (!el) {
      return null;
    }

    var url = el.getAttribute("src");
    if (!url || url.length <= 0 || url == "undefined") {
      return null;
    }

    return {
      img: loadContext.addImgTag(url),
      url: url
    };
  }

})();
