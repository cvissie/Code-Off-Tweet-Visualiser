(function () {

  var errImg = null;
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
      errImg = new Image();
      errImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNFRUE5QTQwNEIzNjExRTZBRjJBRjY0REU0MzdBRTdCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjNFRUE5QTQxNEIzNjExRTZBRjJBRjY0REU0MzdBRTdCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6M0VFQTlBM0U0QjM2MTFFNkFGMkFGNjRERTQzN0FFN0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6M0VFQTlBM0Y0QjM2MTFFNkFGMkFGNjRERTQzN0FFN0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5vz6iBAAABgFBMVEXk5OTO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";
      errImg.onload = ready;

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
      try {
        parseTweet(ret);
      }
      catch (err) {
        ret.error = true;
      }
      return ret;
    };

    function ready() {
      errImg.onload = null;
    }

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

    self.addImgTag = function (url, error) {
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
        if (error) {
          error();
        }
        onResourceComplete();
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
    var avatarImg = loadContext.addImgTag(avatarImgUrl, onAvatarFail);
    loadContext.ready();

    function onAvatarFail() {
      avatarImg = errImg;
    }

    function onComplete() {
      // console.log("drawing!!");

      // lets draw it to it's own canvas
      var canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.left = "400px";

      var ctx = canvas.getContext("2d");

      ctx.font = "22px " + Constants.FONT;
      var textDrawInstructions = getTextDrawInstructions(ctx, 0, 90, messageData, 390);

      canvas.width = Math.max(400, textDrawInstructions.x);
      canvas.height = mediaData ? textDrawInstructions.y + 210 : textDrawInstructions.y + 10;

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
    var totalWidth = 0;

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
            totalWidth = Math.max(totalWidth, x + testWidth);
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
    ret.x = totalWidth;
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

    var ret = {
      img: loadContext.addImgTag(url, error),
      url: url
    };

    function error() {
      ret.img = errImg;
    }

    return ret;
  }

})();
