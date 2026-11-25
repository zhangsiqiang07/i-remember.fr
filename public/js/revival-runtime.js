(function () {
  var params = {};
  var query = window.location.search.replace(/^\?/, "").split("&");
  for (var i = 0; i < query.length; i += 1) {
    if (!query[i]) continue;
    var pair = query[i].split("=");
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "1");
  }

  var deterministic = params.qaDeterministic === "1";
  try {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      get: function () {
        return 1;
      }
    });
  } catch (error) {
    window.devicePixelRatio = 1;
  }

  window.I_REMEMBER_REVIVAL = {
    deterministic: deterministic,
    seed: parseInt(params.qaSeed || "20140430", 10),
    devicePixelRatio: 1,
    introFastForward: false,
    introFastForwardComplete: false,
    introAppInitialized: false
  };

  var uiCopy = {
    en: {
      htmlLang: "en-US",
      footerLanguage: "language",
      header: 'How lucky we are to be able to say <span class="font-italic">&laquo;I remember&raquo;</span>.<br/>Let\'s keep the moments we never want to lose.',
      navSearch: "Search for a memory",
      navAdd: "Add a memory",
      searchPlaceholder: "Search...",
      searchNotFound: 'No memory match your search &lt;&lt;<span class="font-bold-italic">{{interpolation}}</span>&gt;&gt;.<br/>Please make an other search.',
      shareMemory: 'Tell a<br/><span class="font-light-italic">memory</span>',
      lookMemory: 'See all <span class="font-italic">memories</span>',
      acceptTerms: "I have read and agree with the",
      termsLink: "Terms of Service",
      tutorialMoveMouse: '<span class="font-italic">Use your mouse</span><br/><span>to move</span>',
      tutorialMoveTouch: '<span class="font-italic">Touch and drag</span><br/><span>to move</span>',
      tutorialZoomTouch: '<span class="font-italic">Pinch or double tap</span><br/><span>to zoom in</span>',
      tutorialWatchTouch: '<span class="font-italic">Tap to watch</span><br/><span>a memory</span>',
      mobileMapHint: "Drag to explore · Pinch to zoom · Tap a memory",
      readMore: "Read more", close: "Close", openMemory: "Open memory",
      exploreMemory: "Explore this memory"
    },
    fr: {
      htmlLang: "fr-FR",
      footerLanguage: "langue",
      header: 'Quelle chance nous avons de pouvoir dire <span class="font-italic">&laquo;je me souviens&raquo;</span>.<br/>Gardons les moments que nous ne voulons jamais perdre.',
      navSearch: "Rechercher un souvenir",
      navAdd: "Ajouter un souvenir",
      searchPlaceholder: "Rechercher...",
      searchNotFound: 'Aucun souvenir ne correspond a &lt;&lt;<span class="font-bold-italic">{{interpolation}}</span>&gt;&gt;.<br/>Veuillez essayer une autre recherche.',
      shareMemory: 'raconter un<br/><span class="font-light-italic">souvenir</span>',
      lookMemory: 'voir tous les <span class="font-italic">souvenirs</span>',
      acceptTerms: "J'ai lu et j'accepte les",
      termsLink: "conditions d'utilisation",
      tutorialMoveMouse: '<span class="font-italic">Utilisez votre souris</span><br/>pour vous <span class="font-italic">deplacer</span>',
      tutorialMoveTouch: '<span class="font-italic">Touchez et glissez</span><br/>pour vous <span class="font-italic">deplacer</span>',
      tutorialZoomTouch: '<span class="font-italic">Pincez ou touchez deux fois</span><br/><span class="font-italic">pour zoomer</span>',
      tutorialWatchTouch: '<span class="font-italic">Touchez</span> un souvenir<br/>pour <span class="font-italic">le voir</span>',
      mobileMapHint: "Glissez pour explorer · Pincez pour zoomer · Touchez un souvenir",
      readMore: "Lire la suite", close: "Fermer", openMemory: "Ouvrir le souvenir",
      exploreMemory: "Explorer ce souvenir"
    },
    zh: {
      htmlLang: "zh-CN",
      footerLanguage: "语言",
      header: '能说出 <span class="font-italic">“我记得”</span> 是多么幸运。<br/>把不想遗忘的珍贵时刻留在这里。',
      navSearch: "搜索回忆",
      navAdd: "添加回忆",
      searchPlaceholder: "搜索...",
      searchNotFound: '没有回忆匹配 &lt;&lt;<span class="font-bold-italic">{{interpolation}}</span>&gt;&gt;。<br/>请换一个词搜索。',
      shareMemory: '说出<br/><span class="font-light-italic">一段回忆</span>',
      lookMemory: '查看所有<span class="font-italic">回忆</span>',
      acceptTerms: "我已阅读并同意",
      termsLink: "服务条款",
      tutorialMoveMouse: '<span class="font-italic">移动鼠标</span><br/><span>探索回忆</span>',
      tutorialMoveTouch: '<span class="font-italic">触摸并拖动</span><br/><span>探索回忆</span>',
      tutorialZoomTouch: '<span class="font-italic">双指缩放或双击</span><br/><span>放大</span>',
      tutorialWatchTouch: '<span class="font-italic">轻点查看</span><br/><span>一段回忆</span>',
      mobileMapHint: "拖动探索 · 双指缩放 · 轻点查看回忆",
      readMore: "阅读全文", close: "关闭", openMemory: "打开回忆",
      exploreMemory: "继续探索这段回忆"
    }
  };

  function localOrigin() {
    if (window.location.origin) return window.location.origin;
    return window.location.protocol + "//" + window.location.host;
  }

  Array.prototype.forEach.call(document.querySelectorAll("base"), function (base) {
    base.setAttribute("href", localOrigin() + "/");
  });

  document.documentElement.setAttribute(
    "data-revival-deterministic",
    deterministic ? "true" : "false"
  );

  if (deterministic) {
    var seed = window.I_REMEMBER_REVIVAL.seed >>> 0;
    Math.random = function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  if (window.HTMLMediaElement && HTMLMediaElement.prototype.play) {
    var originalMediaPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      var result = originalMediaPlay.apply(this, arguments);
      if (result && typeof result.catch === "function") {
        // Observe legacy fire-and-forget calls without hiding autoplay errors
        // from managed media players that await the original promise.
        result.catch(function () {});
      }
      return result;
    };
  }

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason || {};
    var message = String(reason.message || reason);
    if (
      reason.name === "NotAllowedError" &&
      message.indexOf("play() failed") !== -1
    ) {
      event.preventDefault();
    }
  });

  function closest(element, selector) {
    while (element && element.nodeType === 1) {
      if (element.matches && element.matches(selector)) return element;
      element = element.parentNode;
    }
    return null;
  }

  function transformProperty() {
    if (window.Modernizr && Modernizr.prefixed) {
      return Modernizr.prefixed("transform");
    }
    return "transform";
  }

  function panelWidth(wrapper) {
    var width;
    if (wrapper && wrapper.getBoundingClientRect) {
      width = wrapper.getBoundingClientRect().width;
    }
    if (!width && window.getComputedStyle) {
      width = parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue("--revival-panel-width")
      );
    }
    return Math.ceil(width || 332);
  }

  function hiddenPanelTransform(wrapper) {
    return "translate3d(" + panelWidth(wrapper) + "px,0,0)";
  }

  function setPanelWidth(value) {
    var max = Math.min(Math.max(window.innerWidth - 24, 300), 720);
    var width = Math.max(300, Math.min(max, Math.round(value)));
    document.documentElement.style.setProperty("--revival-panel-width", width + "px");
    try {
      window.sessionStorage.setItem("iRememberPanelWidth", String(width));
    } catch (error) {}
  }

  window.__REVIVAL_PUBLIC_MEMORY_PATH__ = function (post) {
    var id = post && (post.public_id || post.publicId);
    if (!id && post && post.id) {
      id = parseInt(post.id, 10) + 1248;
    }
    return "/memory/" + encodeURIComponent(String(id || ""));
  };

  window.__REVIVAL_REPLACE_MEMORY__ = function(post) {
    var panel = legacyModule("ui/post2d");
    if (!panel || !panel.replace) throw new Error("Memory viewer is not ready");
    panel.replace(post);
  };
  window.__REVIVAL_PUBLIC_SHARE_URL__ = publicShareUrl;
  window.__REVIVAL_CREATE_MEMORY_MAP_INDEX__ = createMemoryMapIndex;
  window.__REVIVAL_UNIQUE_MAP_POSTS__ = uniqueMapPosts;
  window.__REVIVAL_MEMORY_SEARCH_VISIBLE__ = function () {
    var search = legacyModule("scene3d/searchPostParticles");
    return !!(search && search.visible);
  };

  function publicShareUrl(path) {
    var canonical = window.SONGQI_SITE_SETTINGS && window.SONGQI_SITE_SETTINGS.canonicalUrl;
    return new URL(path || "/", canonical || window.location.origin).href;
  }

  function restorePanelWidth() {
    var saved;
    try {
      saved = parseInt(window.sessionStorage.getItem("iRememberPanelWidth") || "", 10);
    } catch (error) {}
    if (saved) setPanelWidth(saved);
  }

  function ensurePanelResize(wrapper) {
    if (!wrapper || wrapper.__revivalResizeReady) return;
    wrapper.__revivalResizeReady = true;
    var handle = document.createElement("div");
    var tracking = false;
    handle.className = "revival-panel-resize";
    handle.setAttribute("aria-hidden", "true");
    wrapper.appendChild(handle);

    function clientX(event) {
      return event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX;
    }

    function move(event) {
      if (!tracking) return;
      setPanelWidth(window.innerWidth - clientX(event));
      event.preventDefault();
    }

    function up() {
      tracking = false;
      document.removeEventListener("mousemove", move, true);
      document.removeEventListener("mouseup", up, true);
      document.removeEventListener("touchmove", move, true);
      document.removeEventListener("touchend", up, true);
    }

    function down(event) {
      tracking = true;
      document.addEventListener("mousemove", move, true);
      document.addEventListener("mouseup", up, true);
      document.addEventListener("touchmove", move, { capture: true, passive: false });
      document.addEventListener("touchend", up, true);
      event.preventDefault();
    }

    handle.addEventListener("mousedown", down, true);
    handle.addEventListener("touchstart", down, { capture: true, passive: false });
  }

  function ensurePanelWheelScroll(wrapper) {
    if (!wrapper || wrapper.__revivalWheelScrollReady) return;
    wrapper.__revivalWheelScrollReady = true;
    wrapper.addEventListener("wheel", function (event) {
      var mover = wrapper.querySelector(".scroll-move-container");
      var max;
      var next;
      if (!mover) return;
      max = Math.max(0, mover.scrollHeight - wrapper.clientHeight);
      if (!max) return;
      next = Math.max(0, Math.min(max, (wrapper.__revivalScrollTop || 0) + event.deltaY));
      wrapper.__revivalScrollTop = next;
      mover.style.top = -next + "px";
      event.preventDefault();
    }, { passive: false });
  }

  function installPanelResizers() {
    var creditWrapper = document.querySelector(".credit-wrapper");
    var creditClose = document.querySelector(".credit-close-btn");
    if (creditWrapper && creditClose && creditClose.parentNode !== creditWrapper) {
      creditWrapper.appendChild(creditClose);
    }
    restorePanelWidth();
    ensurePanelResize(document.querySelector(".terms-wrapper"));
    ensurePanelWheelScroll(document.querySelector(".terms-wrapper"));
    ensurePanelResize(creditWrapper);
    ensurePanelWheelScroll(creditWrapper);
  }

  function setCreditVisible(visible) {
    var credit = document.querySelector(".credit");
    var wrapper = document.querySelector(".credit-wrapper");
    var items;
    if (!credit || !wrapper) return;

    var transform = transformProperty();
    installPanelResizers();
    if (visible) {
      credit.style.display = "block";
      wrapper.style[transform] = "translate3d(0,0,0)";
      setLegacyModalOpen(true, ".credit-close-btn");
      items = credit.querySelectorAll(".bss-inner > *");
      Array.prototype.forEach.call(items, function (element, index) {
        element.style.opacity = "0";
        element.style[transform] = "translate3d(0,30px,0)";
        window.setTimeout(function () {
          element.style.opacity = "1";
          element.style[transform] = "translate3d(0,0,0)";
        }, 100 * index);
      });
      return;
    }

    wrapper.style[transform] = hiddenPanelTransform(wrapper);
    window.setTimeout(function () {
      credit.style.display = "none";
      setLegacyModalOpen(false);
    }, 350);
  }

  function localSocialImage() {
    return localOrigin() + "/uploads/posts/revival-upload/resized.jpg";
  }

  function localSocialThumb() {
    return localOrigin() + "/uploads/posts/revival-upload/thumb.jpg";
  }

  function facebookPhotoPayload() {
    var image = localSocialImage();
    var thumb = localSocialThumb();
    return {
      id: "revival-photo",
      name: "I Remember",
      source: image,
      picture: thumb,
      images: [
        { width: 540, height: 540, source: image },
        { width: 320, height: 320, source: thumb }
      ]
    };
  }

  function ensureFacebookMock() {
    if (window.FB && window.FB.__iRememberRevivalMock) return window.FB;

    window.FB = {
      __iRememberRevivalMock: true,
      init: function () {},
      getLoginStatus: function (callback) {
        window.setTimeout(function () {
          callback({
            authResponse: {
              userID: "revival-user",
              accessToken: "revival-token"
            }
          });
        }, 0);
      },
      login: function (callback) {
        window.setTimeout(function () {
          callback({
            authResponse: {
              userID: "revival-user",
              accessToken: "revival-token"
            }
          });
        }, 0);
      },
      api: function (path, callback) {
        window.setTimeout(function () {
          callback(facebookPhotoPayload());
        }, 0);
      }
    };

    return window.FB;
  }

  function facebookAlbumsPayload() {
    return {
      data: [
        {
          id: "revival-album",
          name: "I Remember",
          cover_photo: "revival-photo"
        }
      ],
      paging: { cursors: {} }
    };
  }

  function facebookPhotosPayload() {
    return {
      data: [facebookPhotoPayload()],
      paging: { cursors: {} }
    };
  }

  function instagramUserPayload() {
    return { data: { id: "revival-user" } };
  }

  function instagramPhotosPayload() {
    return {
      data: [
        {
          type: "image",
          caption: { text: "I Remember" },
          images: {
            low_resolution: { url: localSocialThumb() },
            standard_resolution: { url: localSocialImage() }
          }
        }
      ],
      pagination: {}
    };
  }

  function localSocialPayload(url) {
    if (url.indexOf("graph.facebook.com") !== -1) {
      if (url.indexOf("/albums") !== -1) return facebookAlbumsPayload();
      if (url.indexOf("/photos") !== -1) return facebookPhotosPayload();
      return facebookPhotoPayload();
    }

    if (url.indexOf("api.instagram.com") !== -1) {
      if (url.indexOf("/media/recent") !== -1) return instagramPhotosPayload();
      return instagramUserPayload();
    }

    return null;
  }

  function blockedExternalScriptType(url) {
    var value = String(url || "").toLowerCase();
    if (value.indexOf("google-analytics.com/ga.js") !== -1) return "ga";
    if (value.indexOf("connect.facebook.net") !== -1 && value.indexOf("/all.js") !== -1) {
      return "facebook";
    }
    return "";
  }

  function isExternalUrl(url) {
    try {
      var parsed = new URL(String(url || ""), window.location.href);
      return parsed.origin !== window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function localApiUrl(url) {
    try {
      var parsed = new URL(String(url || ""), window.location.href);
      if (parsed.origin !== window.location.origin) return "";
      if (!/^\/api(?:\/|$)/.test(parsed.pathname)) return "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function appendQueryData(url, data) {
    var parsed;
    var params;
    var key;

    if (!data) return url;
    parsed = new URL(url, window.location.href);
    params = new URLSearchParams(parsed.search);

    if (typeof data === "string") {
      new URLSearchParams(data).forEach(function (value, name) {
        params.set(name, value);
      });
    } else if (Object.prototype.toString.call(data) === "[object Object]") {
      for (key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] != null) {
          params.set(key, data[key]);
        }
      }
    }

    parsed.search = params.toString();
    return parsed.href;
  }

  var uploadImageInFlight = 0;

  function isLegacyMainScript(url) {
    try {
      var parsed = new URL(String(url || ""), window.location.href);
      return parsed.origin === window.location.origin && /\/js\/main\.js$/.test(parsed.pathname);
    } catch (error) {
      return false;
    }
  }

  function uniqueMapPosts(posts) {
    var seen = new Set();
    return (posts || []).filter(function (post) {
      if (!post) return false;
      var identity = String(post.public_id || post.publicId || post.uid || post.id || "");
      var content = String(post.text || post.content || post.body_markdown || post.excerpt || "").trim();
      var status = String(post.status || post.dbStatus || "").toUpperCase();
      var visibility = String(post.visibility || "").toUpperCase();
      if (!identity || !content || seen.has(identity)) return false;
      if (status && status !== "NORMAL" && status !== "PUBLISHED") return false;
      if (visibility && visibility !== "PUBLIC") return false;
      seen.add(identity);
      return true;
    });
  }

  function createMemoryMapIndex(getPosts, requestMore) {
    // Particle meshes are recycled as the camera moves. Memory ownership belongs
    // to the world grid, and must survive recycling, searches and camera resets.
    var coordinates = new Map();
    var claimedIds = new Set();
    var known = new Set();
    var queue = [];
    var cursor = 0;
    var lastPosts;
    var lastLength = -1;
    function syncQueue() {
      var posts = getPosts();
      if (posts !== lastPosts || posts.length !== lastLength) {
        uniqueMapPosts(posts).forEach(function (post) {
          var identity = String(post.public_id || post.publicId || post.uid || post.id);
          if (!known.has(identity)) {
            known.add(identity);
            queue.push(post);
          }
        });
        lastPosts = posts;
        lastLength = posts.length;
      }
    }
    return {
      atGrid: function (x, y) {
        var coordinate = x + ":" + y;
        if (coordinates.has(coordinate)) return coordinates.get(coordinate);
        syncQueue();
        while (cursor < queue.length) {
          var candidate = queue[cursor++];
          var cid = String(candidate.public_id || candidate.publicId || candidate.uid || candidate.id);
          if (claimedIds.has(cid)) continue;
          claimedIds.add(cid);
          coordinates.set(coordinate, candidate);
          return candidate;
        }
        // Do not memoize empty cells: a subsequent page or new submission can
        // fill one. Never wrap the queue back to an already assigned memory.
        requestMore();
        return null;
      },
      claim: function (x, y, post) {
        if (!post) return false;
        syncQueue();
        var identity = String(post.public_id || post.publicId || post.uid || post.id);
        if (claimedIds.has(identity)) return false;
        var coordinate = x + ":" + y;
        if (coordinates.has(coordinate)) return false;
        claimedIds.add(identity);
        coordinates.set(coordinate, post);
        return true;
      },
      entries: function () {
        var list = [];
        coordinates.forEach(function (post, key) {
          var parts = key.split(":");
          list.push({ w: parseInt(parts[0], 10), E: parseInt(parts[1], 10), post: post });
        });
        return list;
      }
    };
  }

  function pickTouchMemory(event, posts, camera, projector, raycaster, Vector3, width, height) {
    // Touch has no preceding hover. Resolve the rendered memory under this tap
    // synchronously, even when down/up both arrive between animation frames.
    var point = new Vector3(event.x / width * 2 - 1, -event.y / height * 2 + 1, 1);
    projector.unprojectVector(point, camera);
    raycaster.set(camera.position, point.sub(camera.position).normalize());
    var nearest = null, distance = Infinity;
    posts.forEach(function (post) {
      if (!post.visible || !post.interactive || !post.post) return;
      if (post.uniforms.fade.value <= 0.05 || post.uniforms.alpha.value <= 0.05) return;
      var hit = raycaster.intersectObject(post)[0];
      if (hit && hit.distance < distance) { nearest = post; distance = hit.distance; }
    });
    return nearest;
  }

  function bindLegacyInput(target, down, move, up, wheel, gesture) {
    // Always listen for touch: hybrid devices and emulation can change mode
    // after initialization. Non-passive handlers let the legacy controller own
    // galaxy gestures without cancelling native form interactions.
    var lastTouch = -Infinity;
    var pinching = false, pinchDistance = 0, nativeTouch = false;
    var galaxyTouch = false, startX = 0, startY = 0, moved = false;
    function distance(event) {
      return event.touches.length < 2 ? 0 : Math.hypot(
        event.touches[0].pageX - event.touches[1].pageX,
        event.touches[0].pageY - event.touches[1].pageY);
    }
    function touch(event) {
      lastTouch = Date.now();
      if (event.type === "touchstart" && !pinching) {
        // The archive close button still dispatches through the legacy tap controller.
        nativeTouch = !!event.target.closest("button,a,input,select,textarea,label,[contenteditable='true'],[data-menu-id],.search-btn,.photo-editor,.post-2d,.revival-photo-viewer,.revival-menu-memory") && !event.target.closest(".post-2d-close-btn");
      }
      if (nativeTouch) return;
      if (event.type === "touchstart" && event.touches.length === 1 && !pinching) {
        galaxyTouch = !!event.target.closest(".base-3d-container");
        startX = event.touches[0].pageX; startY = event.touches[0].pageY; moved = false;
      }
      var contact = event.touches[0] || event.changedTouches[0];
      if (galaxyTouch && contact && Math.hypot(contact.pageX - startX, contact.pageY - startY) > 12) moved = true;
      if (event.type === "touchstart") {
        if (event.touches.length > 1) { if (!pinching) down(event); pinching = true; pinchDistance = distance(event); return; }
        pinching = false; down(event);
      } else if (event.type === "touchmove") {
        if (pinching) {
          var next = distance(event);
          if (next && pinchDistance && event.target.closest(".base-3d-container")) {
            var delta = Math.log(next / pinchDistance) * 2400;
            if (Number.isFinite(delta) && delta !== 0) wheel({ wheelDelta: delta });
            event.preventDefault();
          }
          pinchDistance = next;
        } else move(event);
      } else if (!event.touches.length) {
        if (pinching || moved || event.type === "touchcancel") {
          up({ type: "touchend", cancelled: true, touches: [], changedTouches: event.changedTouches,
            target: event.target, preventDefault: function () { if (event.cancelable) event.preventDefault(); } });
        } else up(event);
        pinching = false; pinchDistance = 0;
      }
    }
    ["touchstart", "touchmove", "touchend", "touchcancel"].forEach(function (type) {
      target.addEventListener(type, touch, { passive: false });
    });
    [["mousedown", down], ["mousemove", move], ["mouseup", up]].forEach(function (entry) {
      target.addEventListener(entry[0], function (event) {
        // A browser may synthesize mouse events after a native touch tap.
        if (Date.now() - lastTouch > 800) entry[1](event);
      }, false);
    });
    target.addEventListener("mousewheel", wheel, { passive: false });
    target.addEventListener("DOMMouseScroll", wheel, { passive: false });
    target.addEventListener("gesturechange", gesture, { passive: false });
  }

  function patchLegacyMainSource(source) {
    var marker = 'define.amd={jQuery:!0}})(),define("../../build/almond"';
    var replacement =
      'define.amd={jQuery:!0}})(),window.__REVIVAL_REQUIREJS__=requirejs,' +
      'window.__REVIVAL_REQUIRE__=require,window.__REVIVAL_DEFINE__=define,' +
      'define("../../build/almond"';
    // Admin uploads preserve .jpeg/.webp filenames; cloud URLs may have query strings.
    source = source.replace('r.extensions=["jpg","gif","png"]', 'r.extensions=["jpg","jpeg","gif","png","webp"]')
      .replace('var n=t.extensions,r=n.length,i=e.length;', 'e=e.split(/[?#]/)[0].toLowerCase();var n=t.extensions,r=n.length,i=e.length;')
      .replace('n=t.content=new Image;n.src=this.url', 'n=t.content=new Image;n.crossOrigin="anonymous";n.src=this.url');
    var patched = source.replace('var r=e&&v>0?e[v-1].id:-1', 'var r=e&&v>0?e[v-1].public_id:-1')
      .replace('"/api/related-post-count/"+e.id+', '"/api/related-post-count/"+e.public_id+')
      .replace('function T(e){b.dispatch({tagName:e.input.tagName})}', 'function T(t){var r=t&&t.input&&t.input.tagName||e.tagName;e.parsedTagName="";b.dispatch({tagName:r})}');
    if (patched.indexOf(marker) !== -1) patched = patched.replace(marker, replacement);
    patched =
      "if(window.SETTINGS&&window.REVIVAL_FADING!=null){window.SETTINGS.fading=window.REVIVAL_FADING;}\n" +
      patched;
    patched = patched.replace(
      'function u(){i&&(window.requestAnimationFrame(u),r.dispatch())}function a(){i=t.isRendering=!0,u()}function f(){i=t.isRendering=!1}',
      'var revivalFrame=0;function u(){i&&(revivalFrame=window.requestAnimationFrame(u),r.dispatch())}function a(){if(!i){i=t.isRendering=!0,u()}}function f(){i=t.isRendering=!1,window.cancelAnimationFrame(revivalFrame)}'
    );
    // A previous long query may have shrunk the editable text. Reset it before
    // focusing an empty search so its caret matches the placeholder on every open.
    patched = patched.replace(
      'g.css("visibility","visible"),m.text(""),x.css',
      'g.css("visibility","visible"),m.text(""),m[0].style.fontSize="",m[0].style[t.transform3DStyle]="",x.css'
    );
    // Shared memory links open the requested card as soon as assets are ready.
    // Keep the normal homepage introduction and its click-to-fast-forward flow.
    patched = patched.replace('e.SKIP_PRELOADER=LANG=="zh"',
      'e.SKIP_PRELOADER=!!window.SONGQI_DIRECT_MEMORY||LANG=="zh"')
      .replace('n._appInitFunc=m,u.start()},1e3)',
        'n._appInitFunc=m,u.start()},window.SONGQI_DIRECT_MEMORY?0:1e3)');
    // Both the natural intro and fast-forward call this entry. Guard before any
    // controllers, renderers or shader extensions can initialize twice.
    patched = patched.replace(
      'function m(){e.uiAsset=u.getLoadedItemByURL(e.uiAssetPath).content,',
      'function m(){if(window.I_REMEMBER_REVIVAL.introAppInitialized)return;if(!u.getLoadedItemByURL(e.uiAssetPath))return;if(!window.songqiMedia||!window.songqiLivePhotoPlayer){if(!window.I_REMEMBER_REVIVAL.introMediaWaiting){window.I_REMEMBER_REVIVAL.introMediaWaiting=true;window.addEventListener("songqi-markdown-ready",function(){window.I_REMEMBER_REVIVAL.introMediaWaiting=false;m()},{once:true})}return}window.I_REMEMBER_REVIVAL.introAppInitialized=true;e.uiAsset=u.getLoadedItemByURL(e.uiAssetPath).content,'
    );
    // The portrait footer row's map center is viewport height minus 74px. Mirror
    // that coordinate in the WebGL overlay so its pixels and hit target agree.
    patched = patched.replace(
      'function Ht(){B=D.innerWidth,j=D.innerHeight,F=B/2,I=j/2;',
      'function Ht(){B=D.innerWidth,j=D.innerHeight,F=B/2,I=j/2,r.offsetTop=D.matchMedia("(max-width:760px) and (min-height:501px)").matches?74-j/2:44;'
    );
    patched = patched.replace('o.loop=!0,c(0)', 'o.loop=!0,o.preload="auto",u.preload="auto",window.__REVIVAL_AUDIO__={loop:o,add:u},o.hidden=u.hidden=!0,document.body.appendChild(o),document.body.appendChild(u),c(0)')
      .replace('o.play(),o.readyState', 'Promise.resolve(o.play()).catch(function(){}),o.readyState')
      .replace('function l(){u.play()}', 'function l(){Promise.resolve(u.play()).catch(function(){})}');
    patched = patched.replace('this._onLargePreload.add(t)', 'this.onLargePreloaded.add(t)')
      .replace('if(this.isLargeStartLoading)return;this.isThumbStartLoading=!0', 'if(this.isThumbStartLoading)return;this.isThumbStartLoading=!0')
      .replace('e.UPLOADS_FOLDER+"posts/"+this.img+"/thumb.jpg"', '(this.thumb_url||e.UPLOADS_FOLDER+"posts/"+this.img+"/thumb.jpg")')
      .replace('e.UPLOADS_FOLDER+"posts/"+this.img+"/resized.jpg"', '(this.image_url||e.UPLOADS_FOLDER+"posts/"+this.img+"/resized.jpg")')
      .replace('t.src="uploads/posts/"+e.img+"/resized.jpg"', 't.src=e.image_url||"uploads/posts/"+e.img+"/resized.jpg"')
      .replace('backgroundImage:"url(uploads/posts/"+e.img+"/resized.jpg)"', 'backgroundImage:"url("+(e.image_url||"uploads/posts/"+e.img+"/resized.jpg")+")"');
    patched = patched.replace(/l\.hasTouch\?\(u\.addEventListener\("touchstart",O,!1\)[\s\S]*?(?=,l\.onDown\.add\(F\))/, 'window.__REVIVAL_BIND_INPUT__(u,O,M,_,L,A)');
    // A stationary pinch emits zero, not a missing legacy wheelDelta. Falling
    // through to undefined detail poisons the zoom and every camera coordinate.
    patched = patched.replace('var t=e.wheelDelta;t?t/=120:t=-e.detail/3;',
      'var t=Number.isFinite(e.wheelDelta)?e.wheelDelta/120:-e.detail/3;if(!Number.isFinite(t)||t===0)return;');
    patched = patched.replace('s=e.isClick=e.distanceTime!==null', 's=e.isClick=!e.originalEvent.cancelled&&e.distanceTime!==null');
    patched = patched.replace('e.isDoubleClick=e.currentTime-l.lastUpTime<400',
      'e.isDoubleClick=!e.originalEvent.cancelled&&e.currentTime-l.lastUpTime<400&&(!e.isTouch||(e.isClick&&l.revivalLastTouchClick&&Math.hypot(e.x-l.revivalLastTouchX,e.y-l.revivalLastTouchY)<24))');
    patched = patched.replace('l.lastUpTime=e.currentTime', 'l.lastUpTime=e.originalEvent.cancelled?0:e.currentTime,l.revivalLastTouchClick=e.isTouch&&e.isClick,l.revivalLastTouchX=e.x,l.revivalLastTouchY=e.y');
    // Keep the desktop hover path, but never use its stale target for touch.
    patched = patched.replace('function Mt(e){K=!0}',
      'function Mt(e){K=!0;if(e.isTouch){wt=e.x/B*2-1;Et=-e.y/j*2+1}}');
    patched = patched.replace('var et=a.update(),st=f.update();',
      'var et=a.update(),st=f.update();revivalTouchPosts=et.concat(st);');
    patched = patched.replace('var bt=null,wt=0,Et=0,', 'var revivalTouchPosts=[],bt=null,wt=0,Et=0,');
    patched = patched.replace('function Dt(t){K=!1,',
      'function Dt(t){if(t.isTouch){var revivalWasDown=K;K=!1;if(!revivalWasDown||!t.isClick||t.originalEvent.cancelled)return;wt=t.x/B*2-1;Et=-t.y/j*2+1;var revivalHit=e.canInteractiveWithPost&&window.__REVIVAL_PICK_TOUCH_MEMORY__(t,revivalTouchPosts,it,at,ft,b.Vector3,B,j);if(bt){bt.onOut();bt=null}if(revivalHit){revivalHit.onClick();return}if(e.hasControl&&t.isDoubleClick){tt-=wt*F*.001*(1-e.zoom*.25);e.targetZoom=y(e.targetZoom+.2,0,1)}return}K=!1,');
    patched = patched.replace('function Pt(t){if(!e.hasControl)return;',
      'function Pt(t){if(!e.hasControl||!Number.isFinite(t))return;');
    // The globe is drawn in the shared WebGL canvas, outside the HTML nav.
    patched = patched.replace('ht.render(.1),r.particles.position.copy(z.position)',
      'ht.render(.1),r.particles.visible=!document.documentElement.classList.contains("revival-memory-mobile-open"),r.particles.position.copy(z.position)');
    patched = patched.replace('function _(e){if(r.hasControl){var t=p.offset()',
      'function _(e){if(document.documentElement.classList.contains("revival-search-open")){window.__REVIVAL_EXIT_SEARCH__();return}if(r.hasControl){var t=p.offset()');
    // The server validates decoded pixels; camera photos are not limited to 5000px.
    patched = patched.replace(/function tt\(\)\{var e=this\.files\[0\],t=e\.size;[\s\S]*?(?=function nt\(e\))/,
      'function tt(){window.SongqiPhotos.uploadFiles(this.files,false)}');
    // An incidental background click must never discard an in-progress draft.
    patched = patched.replace('function _(e){e.target===this&&w&&(w.onBGClick?w.onBGClick():j())}',
      'function _(e){e.target===this&&w&&(w.id==="add-options"||w.id==="congrats")&&(w.onBGClick?w.onBGClick():j())}');
    patched = patched.replace('t.show(),w=t)}function B(e)',
      'y.toggleClass("photo-drafting",t.id==="upload-methods"||t.id==="adjustment"||t.id==="message"),t.show(),w=t)}function B(e)');
    patched = patched.replace('function j(){l.resetCamera({lockControl:!0,hasControl:!0,duration:2}),I(),z(),w&&w.hide()',
      'function j(){y.removeClass("photo-drafting"),l.resetCamera({lockControl:!0,hasControl:!0,duration:2}),I(),z(),w&&w.hide()');
    var adjustmentStart = patched.indexOf('define("steps/adjustmentStep",');
    var adjustmentEnd = patched.indexOf('define("mout/string/interpolate",', adjustmentStart);
    if (adjustmentStart >= 0 && adjustmentEnd > adjustmentStart) {
      patched = patched.slice(0, adjustmentStart) +
        'define("steps/adjustmentStep",["exports","stepController","uiController","scene3d/postSubmitCircle","EKTweener","scene3d/stepCircle"],function(e,r,i,s,f,c){Object.assign(e,window.SongqiPhotos.createAdjustmentStep(r,i,s,f,c))}),' +
        patched.slice(adjustmentEnd);
    }
    patched = patched.replace('function U(e){M=e;var t=new Image', 'function U(e){window.SongqiPhotos.showMemory(e);M=e;var t=new Image');
    patched = patched.replace('function z(e){f.trackPage({trackPage:"memory-view"})', 'function z(e){var revivalDirect=!!window.SONGQI_DIRECT_MEMORY;window.SONGQI_DIRECT_MEMORY=false;window.SongqiMemoryNavigation.opened(e);f.trackPage({trackPage:"memory-view"})');
    patched = patched.replace('d.fromTo(g,1,{opacity:0},{opacity:1,ease:"linear"}),d.to(b,0,{width:0}),d.to(b,.6,{delay:.4,width:348})',
      'd.fromTo(g,revivalDirect?0:1,{opacity:0},{opacity:1,ease:"linear"}),d.to(b,0,{width:0}),d.to(b,revivalDirect?0:.6,{delay:revivalDirect?0:.4,width:348})');
    patched = patched.replace('function Q(){history.replaceState&&history.replaceState(null,"",t.SITE_URL+"/"),D.dispatch()', 'function Q(){window.__REVIVAL_LAST_MEMORY_CLOSE__=Date.now();window.SongqiPhotos.closeMemory&&window.SongqiPhotos.closeMemory();window.SongqiMemoryNavigation.closed();history.replaceState&&history.replaceState(null,"",t.SITE_URL+"/"),D.dispatch()');
    patched = patched.replace('e.preShow=U,e.show=z,e.hide=Q,e.updateFading=Y', 'e.preShow=U,e.show=z,e.hide=Q,e.replace=function(t){U(t);O=t;history.replaceState(null,"",window.__REVIVAL_PUBLIC_MEMORY_PATH__(t));b[0].scrollpane.onResize();window.SongqiMemoryNavigation.opened(t)},e.updateFading=Y');
    patched = patched.replace('e.append("fileId",r.data.fileId),', 'e.append("fileId",r.data.fileId),r.data.photos&&r.data.photos.length&&e.append("photos",JSON.stringify(r.data.photos)),');
    // Retain the original noise field, geometry and transitions. Only replace
    // cyclic memory allocation and stale mesh/hover handling in the old renderer.
    patched = patched
      .replace('function A(){var e=l[""],t=e[d];return t||(d=0,t=e[0],S()),d++,t}',
        'function A(){var e=l[""],t=e[d];return t?(d++,t):(S(),null)}')
      .replace('e.takePost=A}', 'e.takePost=A,e.loadMorePosts=S}')
      .replace('var v=e.particles=[],m,g;',
        'var v=e.particles=[],m,g,revivalMap=window.__REVIVAL_CREATE_MEMORY_MAP_INDEX__(function(){return r.tagNamedPosts[""]||[]},function(){r.loadMorePosts()});window.__REVIVAL_ACTIVE_MAP__=revivalMap;')
      .replace('t=new n({type:"nav",visible:!0})', 't=new n({type:"nav",visible:!1})')
      .replace('function b(){var e=i.cameraPosition,t=i.lookAtPosition',
        'function b(){if(window.__REVIVAL_MEMORY_SEARCH_VISIBLE__()){for(var revivalSlot=0;revivalSlot<v.length;revivalSlot++)v[revivalSlot].visible=v[revivalSlot].interactive=!1;return []}var e=i.cameraPosition,t=i.lookAtPosition')
      .replace('D=v[C],D.hasMatch=!1,D.uniforms.fade.value',
        'D=v[C],D.hasMatch=D.visible=D.interactive=!1,D.uniforms.fade.value')
      .replace('N=B[C*4+2],D=B[C*4+3];if(!D){',
        'N=B[C*4+2],D=B[C*4+3];var revivalPost=revivalMap.atGrid(w,E);if(!revivalPost)continue;if(!D){')
      .replace('D.changePost(r.takePost())', 'D.changePost(revivalPost)')
      .replace('m.copy(D.position),m.sub(e)', 'D.visible=D.interactive=!0,m.copy(D.position),m.sub(e)')
      .replace('bt&&mt.unshift(bt);', 'bt&&!bt.visible&&(bt.onOut(),bt=null),bt&&mt.unshift(bt);')
      .replace('function N(t){if(e.visible)m=t,g||O();',
        'function N(t){t=window.__REVIVAL_UNIQUE_MAP_POSTS__(t);if(e.visible)m=t,g||O();')
      // Deep midnight sky clearColor & horizon fog for aerial perspective
      .replace('st.fog=new b.FogExp2(460551,6e-4)', 'st.fog=new b.FogExp2(395796,5.5e-4)')
      .replace('ut.setClearColor(460551,1)', 'ut.setClearColor(395796,1)')
      // Sync navPostParticles Y height with ridged mountain terrain
      .replace(
        'D.position.y=T(M*.0013+4,_*.0013+4)*-40+T(M*6e-4+32,_*6e-4+32)*-90+T(M*200+12,_*200+12)*10',
        'D.position.y=-115+Math.pow(1-Math.abs(T(M*.0014+4,_*.0014+4)),2)*125+Math.pow(1-Math.abs(T(M*.0032+17.3,_*.0032+17.3)),2)*45+T(M*200+12,_*200+12)*10'
      )
      // Upgrade particleWave with spacetime pointer resonance & ripple uniforms
      .replace(
        'posFieldOffset:{type:"v3",value:new r.Vector3(this.offsetX,0,this.offsetZ)},cameraVector:{type:"v3",value:new r.Vector3(0,0,0)},dpi:{type:"f",value:window.devicePixelRatio||1}}',
        'posFieldOffset:{type:"v3",value:new r.Vector3(this.offsetX,0,this.offsetZ)},cameraVector:{type:"v3",value:new r.Vector3(0,0,0)},dpi:{type:"f",value:window.devicePixelRatio||1},uPointerWorld:{type:"v3",value:new r.Vector3(0,0,0)},uPulse:{type:"v4",value:new r.Vector4(0,0,10,0)}}'
      )
      .replace(
        'varying float vZoom;',
        'varying float vZoom;\\nvarying float vMountainElev;\\nvarying float vEnergy;\\nuniform vec3 uPointerWorld;\\nuniform vec4 uPulse;'
      )
      .replace(
        'float offsetY = snoise(refPos.xz * 0.0013 + 4.0) * - 40.00 + snoise(refPos.xz * 0.0006 + 32.0) * - 90.0;',
        'float r1 = 1.0 - abs(snoise(refPos.xz * 0.0014 + 4.0));\\n    float r2 = 1.0 - abs(snoise(refPos.xz * 0.0032 + 17.3));\\n    float mountainH = r1 * r1 * 125.0 + r2 * r2 * 45.0;\\n    float pDist = length(refPos.xz - uPointerWorld.xy);\\n    float pointerField = (1.0 - smoothstep(0.0, 260.0, pDist)) * uPointerWorld.z;\\n    float pulseWave = 0.0;\\n    if (uPulse.w > 0.001) {\\n      float waveR = uPulse.z * 540.0;\\n      float ringD = abs(length(refPos.xz - uPulse.xy) - waveR);\\n      pulseWave = exp(-ringD * 0.018) * exp(-uPulse.z * 1.45) * uPulse.w;\\n    }\\n    float energy = clamp(pointerField * 0.78 + pulseWave * 1.15, 0.0, 1.0);\\n    float offsetY = -115.0 + mountainH + pointerField * 14.0 + pulseWave * 22.0;'
      )
      .replace(
        'float blinkRatio = step(.1, snoise(refPos.xz)) * snoise(refPos.xz * 1.0 + 30.0 + time * 0.05);\\n\\n    pAlpha = clamp(mix(0.5, .6 + .4 * blinkRatio, fixedPosNoiseRatio) * fading * pow(5., clamp(fixedPosNoiseRatio, 0., 1.)), 0., 1.);\\n\\n    alphaIntensity = 1.0 + abs(snoise(refPos.xz * 400.0) * .8) * (.3 + blinkRatio * .7);\\n\\n    gl_PointSize = mix(500.0, 5000.0, pow(zoom, 2.1))  / distanceToCamera * 6.0 * mix(0.4, 1.0, fixedPosNoiseRatio) * dpi * (.8 + blinkRatio * .3);\\n\\n    vZoom = zoom;',
        'float elevNorm = clamp(mountainH / 170.0, 0.0, 1.0);\\n    float blinkRatio = 0.5 + 0.5 * snoise(refPos.xz * 1.05 + 30.0 + time * 0.06);\\n    float nearClipFade = smoothstep(45.0, 145.0, distanceToCamera);\\n    float zoomDensityFade = 1.0 - smoothstep(0.45, 1.0, zoom) * 0.34;\\n\\n    pAlpha = clamp((mix(0.46, .64 + .38 * blinkRatio, fixedPosNoiseRatio) * (0.52 + 0.68 * elevNorm) + energy * 0.48) * fading * nearClipFade * zoomDensityFade * pow(5., clamp(fixedPosNoiseRatio, 0., 1.)), 0., 1.);\\n\\n    alphaIntensity = 1.0 + abs(snoise(refPos.xz * 400.0) * .65) * (.25 + blinkRatio * .65);\\n\\n    float rawPointSize = mix(460.0, 1550.0, pow(zoom, 1.6)) / max(distanceToCamera, 95.0) * 5.2 * mix(0.38, 1.02, clamp(fixedPosNoiseRatio * 0.72 + elevNorm * 0.28, 0., 1.)) * dpi * (.82 + blinkRatio * .24) * (1.0 + energy * 0.28);\\n    gl_PointSize = clamp(rawPointSize, 1.2 * dpi, mix(18.0, 26.0, zoom) * dpi);\\n\\n    vZoom = zoom;\\n    vMountainElev = elevNorm;\\n    vEnergy = energy;'
      )
      .replace(
        'varying float vZoom;\\n// uniform sampler2D tDiffuse;',
        'varying float vZoom;\\nvarying float vMountainElev;\\nvarying float vEnergy;\\n// uniform sampler2D tDiffuse;'
      )
      .replace(
        'float distanceToCenter = length(gl_PointCoord.xy - .5) * 2.;\\n\\n    gl_FragColor.a = (step(0., distanceToCenter) - step(.25, distanceToCenter)) * 1.;\\n    gl_FragColor.a += (step(.25, distanceToCenter) - step(.27, distanceToCenter)) * mix(1., .4, (distanceToCenter - .25) / (.27 - .25));\\n    gl_FragColor.a += (step(.27, distanceToCenter) - step(.3, distanceToCenter)) * mix(.4, .15, (distanceToCenter - .27) / (.3 - .27));\\n    gl_FragColor.a += (step(.3, distanceToCenter) - step(1., distanceToCenter)) * mix(.15, 0., (distanceToCenter - .3) / (1. - .3));\\n\\n    gl_FragColor.a = pow(abs(gl_FragColor.a), alphaIntensity) * pAlpha * ( 1. - clampNorm(vZoom, .75, 1.) * .4);',
        'vec2 starUv = (gl_PointCoord.xy - .5) * 2.;\\n    float d2 = dot(starUv, starUv);\\n    if (d2 > 1.) discard;\\n    float inv2 = 1. - d2;\\n    float zClamped = clamp(vZoom, 0., 1.);\\n    float core = smoothstep(mix(.085, .048, zClamped), .008, d2);\\n    float halo2 = inv2 * inv2;\\n    float halo = halo2 * halo2 * mix(.28, .14, zClamped);\\n    float shape = clamp(core * .96 + halo, 0., 1.);\\n    vec3 valleyTint = mix(vec3(.55, .68, .92), vec3(.98, .96, .92), vMountainElev);\\n    vec3 baseCol = mix(gl_FragColor.rgb * valleyTint, vec3(.96, .98, 1.), core * (.18 + .24 * vMountainElev));\\n    gl_FragColor.rgb = mix(baseCol, vec3(.78, .90, 1.), vEnergy * .72);\\n    gl_FragColor.a = pow(max(shape, 0.001), alphaIntensity * .92) * pAlpha * ( 1. - clampNorm(vZoom, .75, 1.) * .4);'
      )
      .replace(
        'float distanceToCenter = length(gl_PointCoord.xy - .5) * 2.;\\n\\n    float alpha = (step(0., distanceToCenter) - step(.25, distanceToCenter)) * mix(1., .4, distanceToCenter / .25);\\n    alpha += (step(.25, distanceToCenter) - step(.3, distanceToCenter)) * mix(.4, .15, (distanceToCenter - .25) / (.3 - .25));\\n    alpha += (step(.3, distanceToCenter) - step(1., distanceToCenter)) * mix(.15, 0., (distanceToCenter - .3) / (1. - .3));\\n    alpha = pow(abs(alpha), alphaIntensity) * pAlpha;',
        'vec2 starUv = (gl_PointCoord.xy - .5) * 2.;\\n    float d2 = dot(starUv, starUv);\\n    if (d2 > 1.) discard;\\n    float distanceToCenter = sqrt(d2);\\n    float inv2 = 1. - d2;\\n    float core = smoothstep(.075, .008, d2);\\n    float halo2 = inv2 * inv2;\\n    float alpha = pow(max(clamp(core * .96 + halo2 * halo2 * .24, 0., 1.), 0.001), alphaIntensity * .92) * pAlpha;'
      )
      .replace(
        'if(revivalHit){revivalHit.onClick();return}',
        'if(revivalHit){revivalHit.onClick();return}if(e.canInteractiveWithPost&&t.target&&t.target.closest&&t.target.closest(".base-3d-container")){window.__REVIVAL_TRIGGER_PULSE__&&window.__REVIVAL_TRIGGER_PULSE__(wt,Et,it,at,b.Vector3,0.95);if(window.__REVIVAL_PICK_MEMORY_BEACON__&&window.__REVIVAL_PICK_MEMORY_BEACON__(wt,Et,it,at,b.Vector3,e.zoom,true)){return}}'
      )
      .replace(
        'e.canInteractiveWithPost&&(t.isDoubleClick||t.isClick&&bt&&(bt.onOut(),bt.onClick(),bt=null))',
        'e.canInteractiveWithPost&&(t.isDoubleClick||(t.isClick&&(window.__REVIVAL_TRIGGER_PULSE__&&window.__REVIVAL_TRIGGER_PULSE__(wt,Et,it,at,b.Vector3,0.95),bt?(bt.onOut(),bt.onClick(),bt=null):(t.target&&t.target.closest&&t.target.closest(".base-3d-container")&&window.__REVIVAL_PICK_MEMORY_BEACON__&&window.__REVIVAL_PICK_MEMORY_BEACON__(wt,Et,it,at,b.Vector3,e.zoom,true)))))'
      )
      .replace(
        'e.targetZoom=y(e.targetZoom+t*.05,0,1)',
        'e.targetZoom=y(e.targetZoom+t*.05,0,1);Math.abs(t)>.08&&typeof window!=="undefined"&&window.__REVIVAL_TRIGGER_PULSE__&&window.__REVIVAL_TRIGGER_PULSE__(wt,Et,it,at,b.Vector3,0.55)'
      )
      .replace(
        'bt?H.cursor="pointer":e.hasControl?(H.cursor=K?"grabbing":"grab",H.cursor=K?"-webkit-grabbing":"-webkit-grab"):H.cursor="auto"',
        '(bt||(e.canInteractiveWithPost&&!K&&window.__REVIVAL_HOVER_MEMORY_BEACON__&&window.__REVIVAL_HOVER_MEMORY_BEACON__(wt,Et,it,at,b.Vector3,u)))?H.cursor="pointer":e.hasControl?(H.cursor=K?"grabbing":"grab",H.cursor=K?"-webkit-grabbing":"-webkit-grab"):H.cursor="auto"'
      )
      .replace(
        'it.translateY(Math.sin(ct*2)*_/2),it.lookAt(R.position)',
        'it.translateY(Math.sin(ct*2)*_/2),R.position.y+=(window.__REVIVAL_GAZE_PITCH__?window.__REVIVAL_GAZE_PITCH__(Et,e.hasControl,u):0),it.lookAt(R.position)'
      )
      .replace(
        'st.add(R),l.init(st),a.init(st),f.init(st)',
        'st.add(R),l.init(st),a.init(st),f.init(st),window.__REVIVAL_INIT_STARRY_SKY__&&window.__REVIVAL_INIT_STARRY_SKY__(st,b)'
      )
      .replace(
        'l.update();var et=a.update(),st=f.update();',
        'l.update();window.__REVIVAL_UPDATE_STARRY_SKY__&&window.__REVIVAL_UPDATE_STARRY_SKY__(Q,u,lt,it,at,b.Vector3,wt,Et,e.hasControl,bt,mt,K);var et=a.update(),st=f.update();'
      );
    return patched
      .replace('s=n.SITE_URL+s,', 's=window.__REVIVAL_PUBLIC_SHARE_URL__(s),')
      .replace(
        'e.SITE_URL=e.BASE_URL+(LANG=="fr"?"":"/"+LANG),',
        'e.SITE_URL=e.BASE_URL,'
      )
      .replace(
        /t\.SITE_URL\+"\/memory\/"\+\(parseInt\(e\.id,10\)\+t\.POST_ID_OFFSET\)/g,
        '(window.__REVIVAL_PUBLIC_MEMORY_PATH__?window.__REVIVAL_PUBLIC_MEMORY_PATH__(e):t.SITE_URL+"/memory/"+(parseInt(e.id,10)+t.POST_ID_OFFSET))'
      )
      .replace(
        /"\/memory\/"\+\(parseInt\(O\.id,10\)\+t\.POST_ID_OFFSET\)/g,
        '(window.__REVIVAL_PUBLIC_MEMORY_PATH__?window.__REVIVAL_PUBLIC_MEMORY_PATH__(O):"/memory/"+(parseInt(O.id,10)+t.POST_ID_OFFSET))'
      )
      .replace(
        /"\/memory\/"\+\(parseInt\(u\.data\.id,10\)\+t\.POST_ID_OFFSET\)/g,
        '(window.__REVIVAL_PUBLIC_MEMORY_PATH__?window.__REVIVAL_PUBLIC_MEMORY_PATH__(u.data):"/memory/"+(parseInt(u.data.id,10)+t.POST_ID_OFFSET))'
      );
  }

  function installPatchedLegacyMain(node, parent, referenceNode, originalInsertBefore, originalAppendChild) {
    if (window.__REVIVAL_PATCHED_MAIN_LOADING__) return false;
    window.__REVIVAL_PATCHED_MAIN_LOADING__ = true;

    window.fetch(node.src, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("main_load_failed");
        return response.text();
      })
      .then(function (source) {
        var script = document.createElement("script");
        script.text = patchLegacyMainSource(source) + "\n//# sourceURL=" + node.src.split("#")[0];
        if (parent && referenceNode) {
          originalInsertBefore.call(parent, script, referenceNode);
        } else if (parent) {
          originalAppendChild.call(parent, script);
        } else {
          document.head.appendChild(script);
        }
        // The bundle releases its global jQuery with noConflict(). Resolve the
        // AMD instance after evaluation, including slow initial script loads.
        if (window.__REVIVAL_REQUIRE__) {
          window.__REVIVAL_REQUIRE__(["jquery"], function () { patchJqueryAjax(); });
        }
        completeScriptNode(node);
      })
      .catch(function () {
        node.setAttribute("data-revival-main-fallback", "true");
        if (parent && referenceNode) {
          originalInsertBefore.call(parent, node, referenceNode);
        } else if (parent) {
          originalAppendChild.call(parent, node);
        } else {
          document.head.appendChild(node);
        }
      });

    return true;
  }

  function parseAjaxPayload(text) {
    var match;
    try {
      return JSON.parse(text);
    } catch (error) {
      match = String(text || "").match(/^[\w$.]+\(([\s\S]*)\);?$/);
      if (match) return JSON.parse(match[1]);
      throw error;
    }
  }

  var searchFeedbackSequence = 0;
  var menuNavigationSequence = 0;
  document.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest(".nav-map-wrapper,.nav-search-item-close-btn,.nav-add-btn")) {
      ++searchFeedbackSequence;
      ++menuNavigationSequence;
      showSearchFeedback("", null, false);
    }
  });
  function showSearchFeedback(query, payload, failed) {
    var host = document.body;
    if (!host) return;
    var feedback = document.querySelector(".revival-search-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "revival-search-feedback";
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
      host.appendChild(feedback);
    }
    feedback.replaceChildren();
    feedback.hidden = !query;
    if (!query) return;
    var lang = siteLanguage();
    if (failed) { feedback.textContent = lang === "fr" ? "Recherche indisponible. Réessayez." : lang === "zh" ? "搜索暂不可用，请重试。" : "Search unavailable. Please try again."; return; }
    if (!payload) { feedback.textContent = lang === "fr" ? "Recherche…" : lang === "zh" ? "搜索中…" : "Searching…"; return; }
    var count = payload.total == null ? (payload.posts || []).length : payload.total;
    var status = document.createElement("span");
    status.textContent = lang === "fr" ? count + " souvenir(s)" : lang === "zh" ? count + " 条回忆" : count + (count === 1 ? " memory found" : " memories found");
    feedback.appendChild(status);
    if (payload.posts && payload.posts[0]) {
      var first = payload.posts[0], link = document.createElement("a");
      link.href = window.__REVIVAL_PUBLIC_MEMORY_PATH__(first);
      link.textContent = (lang === "fr" ? "Ouvrir : " : lang === "zh" ? "打开：" : "Open: ") + String(first.title_text || first.name || query).slice(0, 55);
      feedback.appendChild(link);
    }
  }

  function localApiAjax(settings) {
    var method = String(settings.type || settings.method || "GET").toUpperCase();
    var url = localApiUrl(settings.url);
    var path;
    var requestUrl;
    var requestOptions;
    var isUploadImageRequest;
    var releaseUploadImageInflight;
    var jqxhr;
    var aborted = false;
    var controller;

    if (!url) return null;
    path = new URL(url).pathname;
    if (
      !(
        (method === "GET" && /^\/api\/(?:search-posts|auto-complete-tags|related-post-count)(?:\/|$)/.test(path)) ||
        (method === "POST" && (path === "/api/upload-image" || path === "/api/post"))
      )
    ) {
      return null;
    }

    requestUrl = method === "GET" ? appendQueryData(url, settings.data) : url;
    var parsedRequest = new URL(requestUrl), searchQuery = parsedRequest.searchParams.get("tagName") || decodeURIComponent(path.replace(/^\/api\/search-posts\/?/, ""));
    var reportSearch = method === "GET" && path.indexOf("/api/search-posts") === 0 && !parsedRequest.searchParams.has("lastId");
    var feedbackSequence = reportSearch ? ++searchFeedbackSequence : 0;
    if (reportSearch) showSearchFeedback(searchQuery, null, false);

    requestOptions = {
      credentials: "same-origin",
      method: method
    };
    controller = new AbortController();
    requestOptions.signal = controller.signal;
    if (method !== "GET") requestOptions.body = settings.data || null;
    isUploadImageRequest = method === "POST" && path === "/api/upload-image";
    if (isUploadImageRequest) {
      uploadImageInFlight += 1;
      window.__REVIVAL_UPLOAD_REQUESTS__ = uploadImageInFlight;
      releaseUploadImageInflight = function () {
        if (uploadImageInFlight > 0) uploadImageInFlight -= 1;
        window.__REVIVAL_UPLOAD_REQUESTS__ = uploadImageInFlight;
      };
    }
    jqxhr = {
      abort: function () {
        if (aborted || jqxhr.readyState === 4) return;
        aborted = true;
        jqxhr.readyState = 0;
        controller.abort();
      },
      readyState: 1,
      input: { tagName: searchQuery || "" },
      status: 0
    };

    fetch(requestUrl, requestOptions)
      .then(function (response) {
        return response.text().then(function (text) {
          return {
            response: response,
            text: text,
            payload: parseAjaxPayload(text)
          };
        });
      })
      .then(function (result) {
        if (aborted || (reportSearch && feedbackSequence !== searchFeedbackSequence)) return;
        jqxhr.readyState = 4;
        jqxhr.status = result.response.status;
        jqxhr.responseText = result.text;
        jqxhr.responseJSON = result.payload;
        if (!result.response.ok) throw result;
        if (reportSearch && feedbackSequence === searchFeedbackSequence) showSearchFeedback(searchQuery, result.payload.data, false);
        if (settings.success) settings.success(result.payload, "success", jqxhr);
        if (settings.complete) settings.complete(jqxhr, "success");
      })
      .catch(function (error) {
        if (aborted || (reportSearch && feedbackSequence !== searchFeedbackSequence)) return;
        if (reportSearch && feedbackSequence === searchFeedbackSequence) showSearchFeedback(searchQuery, null, true);
        jqxhr.readyState = 4;
        jqxhr.status = error.response ? error.response.status : 0;
        jqxhr.responseJSON = error.payload || null;
        jqxhr.errorMsg = error.payload && error.payload.errorMsg || "unexpected";
        jqxhr.responseText = error.text || "";
        if (settings.error) settings.error(jqxhr, "error", error);
        if (settings.complete) settings.complete(jqxhr, "error");
      })
      .then(function () {
        if (releaseUploadImageInflight) releaseUploadImageInflight();
      });

    return jqxhr;
  }

  function completeScriptNode(node) {
    node.readyState = "complete";
    if (typeof node.onload === "function") node.onload();
    if (typeof node.onreadystatechange === "function") node.onreadystatechange();
  }

  function patchJqueryAjax() {
    var jq = legacyModule("jquery") || window.jQuery || window.$;
    if (!jq || !jq.ajax) return false;
    if (jq.ajax.__iRememberRevivalPatched) return true;

    var originalAjax = jq.ajax;
    jq.ajax = function (options) {
      var settings =
        typeof options === "string"
          ? { url: options }
          : options || {};
      var dataType = String(settings.dataType || "").toLowerCase();
      var payload = settings.url ? localSocialPayload(settings.url) : null;
      var localApiRequest = settings.url ? localApiAjax(settings) : null;

      if (localApiRequest) return localApiRequest;

      if (!payload) {
        if (
          isExternalUrl(settings.url) &&
          (dataType === "jsonp" ||
            dataType === "script" ||
            /(?:\?|&)callback=\?/.test(String(settings.url || "")))
        ) {
          window.setTimeout(function () {
            if (settings.error) settings.error({ status: 400 }, "error", "blocked_script_request");
            if (settings.complete) settings.complete({ status: 400 }, "error");
          }, 0);
          return {
            abort: function () {},
            readyState: 4,
            status: 400
          };
        }
        return originalAjax.apply(this, arguments);
      }

      window.setTimeout(function () {
        if (settings.success) settings.success(payload);
        if (settings.complete) settings.complete({ status: 200 }, "success");
      }, 120);

      return {
        abort: function () {},
        readyState: 4,
        status: 200
      };
    };
    jq.ajax.__iRememberRevivalPatched = true;
    return true;
  }

  function safeMergeValue(value, seen) {
    var key;
    var output;

    if (!value || typeof value !== "object") return value;
    if (value.nodeType || value === window || value === document) return value;

    seen = seen || [];
    if (seen.indexOf(value) !== -1) return value;
    seen.push(value);

    if (Object.prototype.toString.call(value) === "[object Array]") {
      output = [];
      for (var i = 0; i < value.length; i += 1) {
        output[i] = safeMergeValue(value[i], seen);
      }
      return output;
    }

    output = {};
    for (key in value) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
      if (key === "__proto__" || key === "prototype" || key === "constructor") continue;
      output[key] = safeMergeValue(value[key], seen);
    }
    return output;
  }

  function patchLegacyJquerySecurity() {
    var jq = window.jQuery || window.$;
    if (!jq || jq.__iRememberSecurityPatched) return false;

    if (jq.extend && !jq.extend.__iRememberSecurityPatched) {
      var originalExtend = jq.extend;
      jq.extend = jq.fn.extend = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args[0] === true) {
          for (var i = 1; i < args.length; i += 1) {
            args[i] = safeMergeValue(args[i], []);
          }
        }
        return originalExtend.apply(this, args);
      };
      jq.extend.__iRememberSecurityPatched = true;
    }

    if (jq.parseHTML && !jq.parseHTML.__iRememberSecurityPatched) {
      var originalParseHTML = jq.parseHTML;
      jq.parseHTML = function (html, context) {
        return originalParseHTML.call(this, html, context, false);
      };
      jq.parseHTML.__iRememberSecurityPatched = true;
    }

    jq.__iRememberSecurityPatched = true;
    return true;
  }

  function installJquerySecurityHook() {
    if (window.__REVIVAL_JQUERY_SECURITY_HOOKED__) return;
    window.__REVIVAL_JQUERY_SECURITY_HOOKED__ = true;

    ["jQuery", "$"].forEach(function (name) {
      var current = window[name];
      try {
        Object.defineProperty(window, name, {
          configurable: true,
          get: function () {
            return current;
          },
          set: function (value) {
            current = value;
            patchLegacyJquerySecurity();
          }
        });
      } catch (error) {
        current = window[name];
      }
    });
  }

  function jsonpCallbackName(url) {
    var match = String(url).match(/[?&](?:callback|jsonp)=([^&#]+)/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  }

  function isExternalScript(url) {
    if (!url) return false;
    try {
      return new URL(String(url), localOrigin()).origin !== localOrigin();
    } catch (error) {
      return true;
    }
  }

  function patchJsonpScriptInsertion() {
    if (window.__REVIVAL_SOCIAL_JSONP_PATCHED__) return true;
    var originalAppendChild = Node.prototype.appendChild;
    var originalInsertBefore = Node.prototype.insertBefore;

    function intercept(node, parent, referenceNode) {
      if (!node || !node.tagName || node.tagName.toLowerCase() !== "script") {
        return false;
      }

      if (
        isLegacyMainScript(node.src) &&
        !node.getAttribute("data-revival-main-fallback")
      ) {
        return installPatchedLegacyMain(
          node,
          parent,
          referenceNode,
          originalInsertBefore,
          originalAppendChild
        );
      }

      var blockedType = blockedExternalScriptType(node.src);
      if (blockedType) {
        window.setTimeout(function () {
          if (blockedType === "facebook") {
            ensureFacebookMock();
            if (typeof window.fbAsyncInit === "function") window.fbAsyncInit();
          }
          completeScriptNode(node);
        }, 0);
        return true;
      }

      var payload = node.src ? localSocialPayload(node.src) : null;
      if (!payload) {
        if (jsonpCallbackName(node.src) || isExternalScript(node.src)) {
          window.setTimeout(function () {
            completeScriptNode(node);
          }, 0);
          return true;
        }
        return false;
      }

      window.setTimeout(function () {
        var callbackName = jsonpCallbackName(node.src);
        if (callbackName && typeof window[callbackName] === "function") {
          window[callbackName](payload);
        }

        completeScriptNode(node);
      }, 120);

      return true;
    }

    Node.prototype.appendChild = function (node) {
      if (intercept(node, this, null)) return node;
      return originalAppendChild.apply(this, arguments);
    };

    Node.prototype.insertBefore = function (node) {
      if (intercept(node, this, arguments[1] || null)) return node;
      return originalInsertBefore.apply(this, arguments);
    };

    window.__REVIVAL_SOCIAL_JSONP_PATCHED__ = true;
    return true;
  }

  try {
    var assignedFacebookInit;
    Object.defineProperty(window, "fbAsyncInit", {
      configurable: true,
      get: function () {
        return assignedFacebookInit;
      },
      set: function (callback) {
        assignedFacebookInit = callback;
        window.setTimeout(function () {
          ensureFacebookMock();
          if (typeof callback === "function") callback();
        }, 0);
      }
    });
  } catch (error) {
    ensureFacebookMock();
  }

  var socialPatchAttempts = 0;
  ensureFacebookMock();
  patchJsonpScriptInsertion();

  var socialPatchTimer = window.setInterval(function () {
    socialPatchAttempts += 1;
    ensureFacebookMock();
    patchJsonpScriptInsertion();
    if (document.querySelector(".app.show")) {
      patchLegacyJquerySecurity();
      installJquerySecurityHook();
    }
    var patched = patchJqueryAjax();
    if (document.querySelector(".app.show") && patched) {
      window.clearInterval(socialPatchTimer);
      return;
    }

    if (socialPatchAttempts > 120) {
      window.clearInterval(socialPatchTimer);
    }
  }, 100);

  function siteLanguage() {
    // The server-rendered language and URL are authoritative, including a bare
    // route's configured default. A stale session preference must not override it.
    if (window.LANG === "fr" || window.LANG === "zh" || window.LANG === "en") return window.LANG;
    return languageFromLocation();
  }

  function normalizedLanguage(language) {
    language = String(language || "").toLowerCase();
    return language === "fr" || language === "zh" || language === "en" ? language : "en";
  }

  function defaultRouteLanguage(pathname) {
    var prefix = String(pathname || "/").split("/")[1];
    if (prefix === "fr" || prefix === "zh" || prefix === "en") return prefix;
    return normalizedLanguage(window.SONGQI_SITE_SETTINGS && window.SONGQI_SITE_SETTINGS.defaultLanguage);
  }

  function languageFromLocation() {
    var url = new URL(window.location.href);
    return normalizedLanguage(url.searchParams.get("ln") || defaultRouteLanguage(url.pathname));
  }

  function languageUrl(path, language) {
    var next = new URL(String(path), window.location.href);
    if (next.origin !== window.location.origin) return path;
    var normalized = normalizedLanguage(language);
    if (normalized === defaultRouteLanguage(next.pathname)) next.searchParams.delete("ln");
    else next.searchParams.set("ln", normalized);
    return next.pathname + next.search + next.hash;
  }

  function setPreferredLanguage(language) {
    var normalized = normalizedLanguage(language);
    window.LANG = normalized;
    window.history.replaceState(window.history.state, "", languageUrl(window.location.href, normalized));
    return normalized;
  }

  function isTouchDevice() {
    return (
      "ontouchstart" in window ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
    );
  }

  function setText(selector, text) {
    var element = document.querySelector(selector);
    if (element) element.textContent = text;
  }

  function setHtml(selector, html) {
    var element = document.querySelector(selector);
    if (element) element.innerHTML = html;
  }

  var tutorialInputMode = null;
  function applyInputModeText() {
    var copy = uiCopy[siteLanguage()] || uiCopy.en;
    var pages = document.querySelectorAll(".tutorial-page-text");
    var touch = tutorialInputMode ? tutorialInputMode !== "mouse" : isTouchDevice();
    document.documentElement.classList.toggle("touch-tutorial", touch);
    var mouseText = [copy.tutorialMoveMouse,
      siteLanguage() === "fr" ? "Faites défiler ou double-cliquez<br/>pour zoomer" : siteLanguage() === "zh" ? "滚动或双击<br/>放大" : '<span class="font-italic">Scroll or double click</span><br/>to zoom in',
      siteLanguage() === "fr" ? "Cliquez pour voir<br/>un souvenir" : siteLanguage() === "zh" ? "点击查看<br/>一段回忆" : '<span class="font-italic">Click to watch</span><br/>a memory'];
    var touchText = [copy.tutorialMoveTouch, copy.tutorialZoomTouch, copy.tutorialWatchTouch];
    pages.forEach(function (page, index) { page.innerHTML = (touch ? touchText : mouseText)[index]; });
    var hand = '<path d="M43 66V35a5 5 0 0 1 10 0v19-7a5 5 0 0 1 10 0v8-4a5 5 0 0 1 10 0v8-3a5 5 0 0 1 10 0v20c0 14-7 23-19 23-10 0-15-6-21-15L32 68c-4-6 3-11 7-6l4 4Z"/>';
    var marks = ['<path d="M27 40H9m0 0 6-6m-6 6 6 6M89 40h18m0 0-6-6m6 6-6 6"/>', '<path d="M35 23 18 6m0 0v10m0-10h10M86 88l17 17m0 0V95m0 10H93"/><circle cx="48" cy="29" r="12"/>', '<circle cx="48" cy="29" r="12"/><circle class="touch-tap-ring" cx="48" cy="29" r="21"/>'];
    document.querySelectorAll(".tutorial-page-icon").forEach(function (icon, index) {
      if (icon.querySelector(".touch-tutorial-icon")) return;
      icon.insertAdjacentHTML("beforeend", '<svg class="touch-tutorial-icon" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + hand + marks[index] + '</svg>');
    });
  }
  document.addEventListener("pointerdown", function (event) {
    var mode = event.pointerType || "mouse";
    if (mode !== tutorialInputMode) { tutorialInputMode = mode; applyInputModeText(); }
  }, { passive: true });

  function applyLanguagePreference() {
    var language = siteLanguage();
    var copy = uiCopy[language] || uiCopy.en;
    var config = legacyModule("config");

    window.LANG = language;
    if (config) config.LANG = language;
    document.documentElement.lang = copy.htmlLang;
    document.documentElement.setAttribute("data-revival-language", language);

    setHtml(".header-description", copy.header);
    setText(".nav-search-text", copy.navSearch);
    setText(".nav-add-text", copy.navAdd);
    setText(".search-input-placeholder", copy.searchPlaceholder);
    setHtml(".add-steps-add-options-share-text", copy.shareMemory);
    setHtml(".add-steps-add-options-look-text", copy.lookMemory);
    setText(".add-steps-message-terms-i-accept-text", copy.acceptTerms);
    setText(".add-steps-message-terms-link", copy.termsLink);

    var notFound = document.querySelector(".search-not-found");
    if (notFound) {
      var searchOverlay = document.querySelector(".search");
      notFound.setAttribute("data-template", copy.searchNotFound);
      if (!searchOverlay || !searchOverlay.classList.contains("not-found")) {
        notFound.innerHTML = copy.searchNotFound.replace(/\{\{interpolation\}\}/g, "");
      }
    }

    var label = document.querySelector(".footer-link-lang-text");
    if (label && !closest(label, ".footer-content[data-managed-menu='true']")) {
      label.textContent = copy.footerLanguage;
    }
    Array.prototype.forEach.call(document.querySelectorAll(".footer-link-lang-item[data-id]"), function (item) {
      item.classList.toggle("selected", item.getAttribute("data-id") === language);
    });
    applyInputModeText();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fetchJson(url, signal) {
    if (!window.fetch) return Promise.reject(new Error("fetch_unavailable"));
    return window.fetch(url, { credentials: "same-origin", signal: signal }).then(function (response) {
      return response.json().then(function (payload) {
        if (!response.ok || !payload || payload.success === false) {
          throw new Error(payload && (payload.message || payload.errorMsg) || "request_failed");
        }
        return payload.data;
      });
    });
  }

  function setLegacyModalOpen(open, focusSelector) {
    var root = document.documentElement;
    if (open) {
      if (!window.I_REMEMBER_REVIVAL.preModalFocus) {
        window.I_REMEMBER_REVIVAL.preModalFocus = document.activeElement;
      }
      root.classList.add("revival-modal-open");
      window.setTimeout(function () {
        var target = focusSelector ? document.querySelector(focusSelector) : null;
        if (target && target.focus) target.focus();
      }, 0);
      return;
    }

    root.classList.remove("revival-modal-open");
    if (
      window.I_REMEMBER_REVIVAL.preModalFocus &&
      window.I_REMEMBER_REVIVAL.preModalFocus.focus
    ) {
      window.I_REMEMBER_REVIVAL.preModalFocus.focus();
    }
    window.I_REMEMBER_REVIVAL.preModalFocus = null;
  }

  function desktopCardLayout(width, height, headerHeight, footerHeight, aspectRatio) {
    var availableHeight = height - headerHeight - footerHeight - 32;
    var ratio = Number(aspectRatio) > 0 && isFinite(aspectRatio) ? Number(aspectRatio) : 1;
    var imageHeight = Math.min(600, availableHeight, Math.min(900, width - 348 - 48) / ratio);
    if (imageHeight <= 0) return null;
    return {
      imageWidth: imageHeight * ratio,
      imageHeight: imageHeight,
      top: headerHeight + 16 + (availableHeight - imageHeight) / 2
    };
  }

  function installDesktopCardFit() {
    var app = document.querySelector(".app");
    var header = document.querySelector(".header");
    var footer = document.querySelector(".footer");
    if (!app || !header || !footer || app.__revivalCardFitReady) return;
    app.__revivalCardFitReady = true;
    var frame = 0;
    var lastSize = "";
    var photo = document.querySelector(".post-2d-img");
    var photoSource = "";
    function update() {
      frame = 0;
      var layout = desktopCardLayout(app.clientWidth, app.clientHeight, header.offsetHeight, footer.offsetHeight, 1);
      if (!layout) return;
      var sizeKey = layout.imageWidth + ":" + layout.imageHeight + ":" + layout.top;
      if (sizeKey === lastSize) return;
      lastSize = sizeKey;
      app.style.setProperty("--revival-card-image-width", layout.imageWidth + "px");
      app.style.setProperty("--revival-card-image-height", layout.imageHeight + "px");
      app.style.setProperty("--revival-card-top", layout.top + "px");
      app.classList.add("revival-card-fit");
      var content = document.querySelector(".post-2d-content-wrapper");
      if (content && content.offsetParent && content.scrollpane) content.scrollpane.onResize();
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(schedule);
      [app, header, footer].forEach(function (element) { observer.observe(element); });
    }
    function readPhotoSize() {
      var background = photo.style.backgroundImage;
      if (background === photoSource) return;
      photoSource = background;
      var match = background.match(/^url\(["']?(.*?)["']?\)$/);
      if (!match) return;
      var requestedSource = background;
      var image = new Image();
      image.onload = function () {
        // A previous memory can finish loading after a new one was opened.
        if (photoSource !== requestedSource || !image.naturalWidth || !image.naturalHeight) return;
        app.style.setProperty("--revival-photo-ratio", "1");
        schedule();
      };
      image.src = match[1];
    }
    if (photo) {
      new MutationObserver(readPhotoSize).observe(photo, { attributes: true, attributeFilter: ["style"] });
      readPhotoSize();
    }
    window.addEventListener("resize", schedule, { passive: true });
    update();
  }

  function installMobileViewportSupport() {
    var viewport = window.visualViewport;
    var root = document.documentElement;
    if (window.I_REMEMBER_REVIVAL.mobileViewportReady) return;
    window.I_REMEMBER_REVIVAL.mobileViewportReady = true;
    var frame = 0;

    function update() {
      frame = 0;
      // Pinch zoom reduces the visual viewport too; it must not be mistaken
      // for a software keyboard or resize the scene under the user's fingers.
      var unzoomed = !viewport || Math.abs((viewport.scale || 1) - 1) < 0.05;
      var height = viewport && unzoomed ? viewport.height : window.innerHeight;
      var offset = viewport && unzoomed ? viewport.offsetTop : 0;
      var focused = document.activeElement;
      var editing = focused && (focused.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName));
      root.style.setProperty("--revival-visual-viewport-height", height + "px");
      root.style.setProperty("--revival-visual-viewport-offset", offset + "px");
      root.classList.toggle(
        "revival-keyboard-open",
        Boolean(viewport && unzoomed && editing && window.innerHeight - height > 120)
      );
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    update();
    if (viewport) {
      viewport.addEventListener("resize", scheduleUpdate, { passive: true });
      viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    }
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleUpdate, { passive: true });
    document.addEventListener("focusin", scheduleUpdate, true);
    document.addEventListener("focusout", scheduleUpdate, true);
  }

  function installImeCompositionSupport() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[contenteditable='true']"),
      function (element) {
        var composing = false;
        var pendingCommit = false;
        if (element.getAttribute("data-revival-ime-ready") === "true") return;
        element.setAttribute("data-revival-ime-ready", "true");

        element.addEventListener("compositionstart", function () {
          composing = true;
          pendingCommit = false;
          element.setAttribute("data-revival-composing", "true");
        }, true);

        element.addEventListener("compositionend", function () {
          composing = false;
          pendingCommit = true;
          element.removeAttribute("data-revival-composing");
          window.setTimeout(function () {
            var inputEvent;
            if (!pendingCommit) return;
            pendingCommit = false;
            inputEvent = new Event("input", { bubbles: true });
            inputEvent.revivalCompositionCommit = true;
            element.dispatchEvent(inputEvent);
          }, 0);
        }, true);

        element.addEventListener("input", function (event) {
          if (composing || event.isComposing) {
            event.stopImmediatePropagation();
            return;
          }
          if (pendingCommit) pendingCommit = false;
        }, true);

        ["keydown", "keypress", "keyup"].forEach(function (type) {
          element.addEventListener(type, function (event) {
            if (!composing && !event.isComposing && event.keyCode !== 229) return;
            event.stopImmediatePropagation();
          }, true);
        });
      }
    );
  }

  function exitLegacySearch() {
    var ui = legacyModule("uiController"), scene = legacyModule("scene3dController");
    var field = document.querySelector(".search-input");
    if (field) field.blur();
    if (ui) ui.hideSearch();
    if (scene) scene.enableControl();
  }

  function installLegacySearchState() {
    var search = document.querySelector(".search");
    var notFound = document.querySelector(".search-not-found");
    var observer;
    if (!search || window.I_REMEMBER_REVIVAL.searchStateReady) return;
    window.I_REMEMBER_REVIVAL.searchStateReady = true;

    function update() {
      var style = window.getComputedStyle(search);
      var visible = style.display !== "none" && parseFloat(style.opacity || "1") > 0.02;
      document.documentElement.classList.toggle("revival-search-open", visible);
      if (notFound) {
        var hasNoResults = search.classList.contains("not-found");
        notFound.hidden = !hasNoResults;
        notFound.setAttribute("aria-hidden", hasNoResults ? "false" : "true");
      }
    }

    observer = new MutationObserver(update);
    observer.observe(search, { attributes: true, attributeFilter: ["class", "style"] });
    update();
  }

  function showMobileMapHint() {
    var copy;
    var hint;
    if (!isTouchDevice() || window.innerWidth > 760) return;
    copy = uiCopy[siteLanguage()] || uiCopy.en;
    hint = document.querySelector(".revival-mobile-map-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "revival-mobile-map-hint";
      hint.setAttribute("role", "status");
      hint.setAttribute("aria-live", "polite");
      document.body.appendChild(hint);
    }
    hint.textContent = copy.mobileMapHint;
    hint.classList.remove("is-visible");
    window.requestAnimationFrame(function () {
      hint.classList.add("is-visible");
    });
    window.clearTimeout(window.I_REMEMBER_REVIVAL.mobileMapHintTimer);
    window.I_REMEMBER_REVIVAL.mobileMapHintTimer = window.setTimeout(function () {
      hint.classList.remove("is-visible");
    }, 5200);
  }

  function installMobileMapHint() {
    if (window.I_REMEMBER_REVIVAL.mobileMapHintReady) return;
    window.I_REMEMBER_REVIVAL.mobileMapHintReady = true;
    document.addEventListener("click", function (event) {
      if (!closest(event.target, ".add-steps-add-options-look")) return;
      window.setTimeout(showMobileMapHint, 350);
    }, true);
  }

  function setTermsVisible(visible) {
    var terms = document.querySelector(".terms");
    var wrapper = document.querySelector(".terms-wrapper");
    if (!terms || !wrapper) return;

    var transform = transformProperty();
    installPanelResizers();
    if (visible) {
      terms.style.display = "block";
      wrapper.style[transform] = "translate3d(0,0,0)";
      setLegacyModalOpen(true, ".terms-close-btn");
      return;
    }

    wrapper.style[transform] = hiddenPanelTransform(wrapper);
    window.setTimeout(function () {
      terms.style.display = "none";
      setLegacyModalOpen(false);
    }, 350);
  }

  function ensureManagedMenuStyles() {
    if (document.getElementById("revival-managed-menu-styles")) return;
    var style = document.createElement("style");
    style.id = "revival-managed-menu-styles";
    style.textContent = [
      ".footer-content[data-managed-menu='true']>.footer-link-donate:not(.footer-managed-item),.footer-content[data-managed-menu='true']>.footer-link-terms:not(.footer-managed-item),.footer-content[data-managed-menu='true']>.footer-link-credits:not(.footer-managed-item){display:none!important}",
      ".footer-content[data-managed-menu='true']>.footer-managed-item{display:block!important;float:right!important;white-space:nowrap}",
      ".footer-content[data-managed-menu='true']>.footer-sound-btn:not(.footer-managed-item),.footer-content[data-managed-menu='true']>.footer-share:not(.footer-managed-item),.footer-content[data-managed-menu='true']>.footer-logo-wrapper:not(.footer-managed-item),.footer-content[data-managed-menu='true']>.footer-link-lang:not(.footer-managed-item){display:none!important}",
      ".footer-menu-group{position:relative;cursor:pointer}.footer-menu-group-list{display:none;position:absolute;bottom:18px;right:0;min-width:150px;padding:8px 0;text-align:right}.footer-menu-group.is-open .footer-menu-group-list,.footer-menu-group:hover .footer-menu-group-list{display:grid;gap:6px}.footer-menu-group-list .footer-managed-item{display:block!important}",
      ".footer[data-managed-menu='true']>.footer-link-donate:not(.footer-managed-item),.footer[data-managed-menu='true']>.footer-link-terms:not(.footer-managed-item),.footer[data-managed-menu='true']>.footer-link-credits:not(.footer-managed-item){display:none!important}",
      ".footer[data-managed-menu='true']>.footer-managed-item{display:block!important}",
      ".revival-menu-memory{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.36);pointer-events:auto}",
      ".revival-menu-memory.is-visible{display:flex}",
      ".revival-menu-card{width:min(620px,calc(100vw - 44px));max-height:calc(100vh - 120px);display:grid;grid-template-columns:220px minmax(0,1fr);border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.92);color:white;box-shadow:0 22px 70px rgba(0,0,0,.72);transform:translate3d(0,16px,0) scale(.98);opacity:0;transition:opacity .42s linear,transform .42s ease}",
      ".revival-menu-memory.is-visible .revival-menu-card{opacity:1;transform:scale(1)}",
      ".revival-menu-image{min-height:286px;background:#151515 center/cover;border-right:1px solid rgba(255,255,255,.14)}",
      ".revival-menu-body{padding:28px;overflow:auto}",
      ".revival-menu-body h2{font-family:'ITC Century W01 Bold',Georgia,serif;font-size:28px;line-height:1.12;margin:0 0 14px}",
      ".revival-menu-body p{font-family:'ITC Century W01 Book',Georgia,serif;color:rgba(255,255,255,.68);line-height:1.68;margin:0 0 16px}",
      ".revival-menu-full{display:none;border-top:1px solid rgba(255,255,255,.16);margin-top:18px;padding-top:18px}",
      ".revival-menu-memory.is-expanded .revival-menu-full{display:block}",
      ".revival-menu-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}",
      ".revival-menu-actions button,.revival-menu-actions a{border:1px solid rgba(255,255,255,.24);border-radius:999px;background:transparent;color:white;cursor:pointer;font:12px Helvetica,Arial,sans-serif;min-height:36px;padding:0 16px;text-decoration:none;text-transform:uppercase}",
      ".revival-menu-close{position:absolute;right:22px;top:18px;border:0;background:transparent;color:white;cursor:pointer;font-size:30px;line-height:1;opacity:.72}",
      "html{--revival-panel-width:332px}",
      ".terms-wrapper,.credit-wrapper{width:var(--revival-panel-width,332px)!important;max-width:calc(100vw - 24px)!important;background:#000!important}",
      ".credit-wrapper{overflow-y:auto!important}",
      ".terms-close-btn,.credit-close-btn{position:absolute!important;top:18px!important;margin:0!important;z-index:3}",
      ".terms-close-btn{left:-16px!important}",
      ".credit-close-btn{left:18px!important}",
      ".terms-wrapper .scroll-move-container{left:34px!important;width:calc(100% - 68px)!important;padding-top:58px!important}",
      ".terms-wrapper .scroll-indicator-wrapper{width:6px!important;background:#1e1e1e!important}",
      ".terms-wrapper .scroll-indicator{border-radius:4px;background:#5f5f5f!important}",
      ".credit-wrapper .bss-inner{padding:86px 34px 34px!important;text-align:left!important}",
      ".credit-title,.credit-item,.credit-item-text{max-width:100%!important}",
      ".revival-panel-resize{position:absolute;left:0;top:0;width:12px;height:100%;cursor:ew-resize;z-index:2}",
      "html.is-touch-device .base-3d-container{touch-action:none}",
      ".revival-mobile-map-hint{position:fixed;z-index:35;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));max-width:calc(100% - 32px);border:1px solid rgba(255,255,255,.26);border-radius:999px;background:rgba(8,9,11,.9);color:#fff;font:16px/1.35 Helvetica,Arial,sans-serif;padding:12px 16px;text-align:center;transform:translate3d(-50%,12px,0);opacity:0;pointer-events:none;transition:opacity .22s linear,transform .22s ease;white-space:nowrap}",
      ".revival-mobile-map-hint.is-visible{opacity:1;transform:translate3d(-50%,0,0)}",
      "html.revival-empty-memory .add-steps-add-options-look,html.revival-empty-memory .nav-map-wrapper{display:none!important;pointer-events:none!important}",
      "@media(max-width:760px),(max-width:1024px) and (max-height:500px){.header-description{display:none!important}.header-logo{left:22px!important;top:28px!important;transform:scale(.72)!important;transform-origin:left top!important}.header-fade-container{right:16px!important;top:12px!important;transform:scale(.76)!important;transform-origin:right top!important}.nav{left:8px!important;width:72px!important;margin-top:-78px!important}.nav-map-wrapper{left:0!important;width:62px!important;height:62px!important;margin:8px 0 8px auto!important}.nav-map-btn{width:62px!important;height:62px!important}.nav-search-wrapper,.nav-add-wrapper{margin:8px 0 8px auto!important}.nav-text,.nav-search-item{left:52px!important}.search-center-wrapper{left:20px!important;right:20px!important;width:auto!important;margin-left:0!important;margin-top:-58px!important}.search-input-wrapper,.search-line{width:100%!important}.search-input,.search-input-placeholder{font-size:50px!important;line-height:58px!important;max-width:100%!important;white-space:nowrap!important}.search-not-found{left:0!important;width:100%!important;font-size:15px!important;line-height:22px!important}.search-btn{right:0!important}.footer{height:132px!important}.footer-content{height:132px!important;display:flex!important;align-items:flex-end!important;justify-content:flex-end!important;gap:8px 12px!important;flex-wrap:wrap!important;padding:0 16px 18px 16px!important}.footer-content>*{float:none!important;margin:0!important}.footer-logo-wrapper{order:20;width:46px!important;height:54px!important}.footer-share,.footer-sound-btn{width:24px!important;height:24px!important}.footer-link-item{font-size:9px!important;line-height:14px!important;white-space:nowrap!important}.footer-link-lang-list{bottom:18px!important}.terms-wrapper,.credit-wrapper{width:100vw!important;max-width:100vw!important}.revival-panel-resize{display:none!important}}",
      ".nav{left:0!important;width:100px!important;margin-top:-100px!important}",
      ".nav-map-wrapper{left:19px!important;width:92px!important;height:92px!important;margin:12px 0 12px auto!important}",
      ".nav-map-btn{width:92px!important;height:92px!important}",
      ".nav-search-wrapper,.nav-add-wrapper{clear:none!important;width:49px!important;height:46px!important;margin:12px 0 12px auto!important}",
      ".nav-text,.nav-search-item{left:55px!important}",
      "@media(max-width:720px){.revival-menu-card{grid-template-columns:1fr;max-height:calc(100vh - 80px)}.revival-menu-image{min-height:190px;border-right:0;border-bottom:1px solid rgba(255,255,255,.18)}.revival-menu-body{padding:22px}.revival-menu-body h2{font-size:25px}}",
      "html,body{width:100%;max-width:100%;overflow-x:clip;-webkit-text-size-adjust:100%;text-size-adjust:100%;overscroll-behavior-x:none}",
      "html.revival-modal-open,html.revival-modal-open body{overflow:hidden!important}",
      "body{min-width:320px;min-height:100svh}",
      ".app{top:var(--revival-visual-viewport-offset,0);height:var(--revival-visual-viewport-height,100dvh)!important;min-height:var(--revival-visual-viewport-height,100svh)!important}",
      "input,textarea,select,[contenteditable='true']{font-size:max(16px,1em)}",
      "button,a,[role='button'],label[for]{touch-action:manipulation}",
      "[role='button']:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid rgba(255,255,255,.92)!important;outline-offset:4px!important}",
      ".revival-menu-memory{top:var(--revival-visual-viewport-offset,0);height:var(--revival-visual-viewport-height,100dvh);padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));box-sizing:border-box}",
      ".revival-menu-card{width:min(620px,100%);max-height:100%}",
      ".revival-menu-body,.credit-wrapper,.terms-wrapper{overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y pinch-zoom}",
      ".revival-menu-actions button,.revival-menu-actions a{min-height:44px;font-size:16px}",
      ".revival-menu-close{display:grid;width:44px;height:44px;place-items:center;right:max(8px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top))}",
      ".terms-close-btn,.credit-close-btn{min-width:44px!important;min-height:44px!important}",
      "@media(max-width:760px),(max-width:1024px) and (max-height:500px){.tutorials{pointer-events:none!important}.base-3d-container,.base-3d-container canvas{touch-action:none!important}.header-logo{top:calc(20px + env(safe-area-inset-top))!important;left:max(18px,env(safe-area-inset-left))!important}.header-fade-container{top:calc(8px + env(safe-area-inset-top))!important;right:max(12px,env(safe-area-inset-right))!important}.nav{left:max(8px,env(safe-area-inset-left))!important}.nav-search-wrapper,.nav-add-wrapper,.search-btn,.circle-btn,[role='button']{min-width:44px;min-height:44px}.search-btn{width:44px!important;height:44px!important;top:57px!important}.search-hint{display:inline-flex;min-height:44px;align-items:center;padding:0 8px;font-size:16px}.footer{height:calc(132px + env(safe-area-inset-bottom))!important}.footer-content{height:calc(132px + env(safe-area-inset-bottom))!important;padding:0 max(16px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))!important}.footer-content>.footer-managed-item,.footer-link-item{display:inline-flex!important;min-height:44px;align-items:center;padding:0 6px;font-size:16px!important;line-height:20px!important}.footer-share,.footer-sound-btn,.add-steps-congrats-share{display:inline-flex!important;width:44px!important;height:44px!important;align-items:center;justify-content:center}.footer-link-lang-list,.footer-menu-group-list{bottom:44px!important}.terms-wrapper,.credit-wrapper{width:100%!important;max-width:100%!important;padding-bottom:env(safe-area-inset-bottom);box-sizing:border-box}.add-steps-back-btn,.add-steps-validate-btn,.add-steps-message-terms{min-height:44px;font-size:16px!important}.add-steps-message-terms{display:flex;align-items:center;justify-content:center;white-space:normal}.revival-menu-body p{font-size:16px}.revival-menu-image{min-height:150px}.revival-menu-body{padding:20px}.revival-menu-body h2{font-size:24px}.revival-mobile-map-hint{white-space:normal}}",
      "html.revival-keyboard-open .header,html.revival-keyboard-open .footer{opacity:0!important;pointer-events:none!important}",
      "html.revival-keyboard-open .search-center-wrapper{margin-top:-42px!important}",
      "@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.revival-menu-card{transform:none!important}}"
    ].join("");
    document.head.appendChild(style);
  }

  function footerItemElement(item) {
    var element;
    if (item.type === "EXTERNAL") {
      element = document.createElement("a");
      element.href = item.url || "#";
      if (item.opensNewTab) {
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      }
    } else {
      element = document.createElement("div");
      element.tabIndex = 0;
      element.setAttribute("role", "button");
    }

    element.className = "footer-link-item footer-fade-item footer-managed-item";
    element.textContent = item.label;
    element.setAttribute("data-menu-id", item.id);
    element.setAttribute("data-menu-type", item.type);
    element.setAttribute("data-menu-label", item.label);
    element.setAttribute("data-managed-generated", "true");
    return element;
  }

  function footerGroupElement(item, children) {
    var group = footerItemElement(item);
    var list = document.createElement("div");
    group.className += " footer-menu-group";
    group.setAttribute("aria-haspopup", "true");
    group.setAttribute("aria-expanded", "false");
    list.className = "footer-menu-group-list";
    children.forEach(function (child) { list.appendChild(footerItemElement(child)); });
    group.appendChild(list);
    return group;
  }

  function renderManagedFooter(items) {
    ensureManagedMenuStyles();
    var footer = document.querySelector(".footer-content");
    var footerShell = document.querySelector(".footer");
    var language = document.querySelector(".footer-link-lang");
    if (!footer || !language || !items) return;
    footer.setAttribute("data-managed-menu", "true");
    if (footerShell) footerShell.setAttribute("data-managed-menu", "true");

    Array.prototype.forEach.call(
      footer.querySelectorAll("[data-managed-generated='true']"),
      function (node) {
        node.parentNode.removeChild(node);
      }
    );

    Array.prototype.forEach.call(
      footer.querySelectorAll(".footer-sound-btn,.footer-share,.footer-logo-wrapper,.footer-link-lang"),
      function (node) {
        node.classList.remove("footer-managed-item");
        node.style.display = "none";
      }
    );

    Array.prototype.forEach.call(
      footer.querySelectorAll(".footer-link-donate,.footer-link-terms,.footer-link-credits"),
      function (node) {
        node.style.display = "none";
      }
    );

    // Keep the legacy DOM anchor for footer ordering, without exposing a
    // language control in the public interface. Language routes remain supported.
    language.hidden = true;
    language.setAttribute("aria-hidden", "true");
    language.style.display = "none";

    var fixedTypes = { SOUND: ".footer-sound-btn", SHARE: ".footer-share", LOGO: ".footer-logo-wrapper" };
    Object.keys(fixedTypes).forEach(function (type) {
      if (!items.some(function (item) { return item.type === type && !item.parentId; })) return;
      Array.prototype.forEach.call(footer.querySelectorAll(fixedTypes[type]), function (node) {
        node.style.display = "";
        node.classList.add("footer-managed-item");
      });
    });

    var managed = items.filter(function (item) {
      return ["LANGUAGE", "SOUND", "SHARE", "LOGO"].indexOf(item.type) === -1 && !item.parentId;
    });
    var anchor = language;
    for (var i = managed.length - 1; i >= 0; i -= 1) {
      var children = items.filter(function (item) { return item.parentId === managed[i].id || item.parentId === managed[i].uid; });
      var element = managed[i].type === "GROUP" ? footerGroupElement(managed[i], children) : footerItemElement(managed[i]);
      footer.insertBefore(element, anchor.nextSibling);
      anchor = element;
    }
  }

  function showFooterSearchToken(label) {
    var wrapper = document.querySelector(".nav-search-wrapper");
    var item = document.querySelector(".nav-search-item");
    var text = document.querySelector(".nav-search-item-text");
    var line = document.querySelector(".nav-search-item-line");
    if (!wrapper || !item || !text || !line) return;
    wrapper.classList.add("has-item");
    item.style.display = "block";
    item.style.opacity = "1";
    text.textContent = label;
    line.style.width = item.offsetWidth + "px";
  }

  function legacyModule(name) {
    var runtimeRequire = window.__REVIVAL_REQUIREJS__ || window.requirejs;
    return runtimeRequire && runtimeRequire._defined
      ? runtimeRequire._defined[name]
      : null;
  }

  function ensureIntroFastForwardStyles() {
    if (document.getElementById("revival-intro-fast-forward-styles")) return;
    var style = document.createElement("style");
    style.id = "revival-intro-fast-forward-styles";
    style.textContent = [
      "html.is-intro-fast-forward .preloader{cursor:pointer}",
      "html.is-intro-fast-forward .preloader .preloader-text-line{display:none!important;opacity:0!important}",
      "html.is-intro-fast-forward .preloader[data-fast-forward-phase='first'] .preloader-text-line-1,html.is-intro-fast-forward .preloader[data-fast-forward-phase='first'] .preloader-text-line-2{display:block!important;opacity:.5!important}",
      "html.is-intro-fast-forward .preloader[data-fast-forward-phase='second'] .preloader-text-line-3,html.is-intro-fast-forward .preloader[data-fast-forward-phase='second'] .preloader-text-line-4{display:block!important;opacity:.5!important}",
      "html.is-intro-fast-forward-complete .preloader{display:none!important}"
    ].join("");
    document.head.appendChild(style);
  }

  function elementIsVisible(element) {
    var rect;
    var style;
    if (!element) return false;
    style = window.getComputedStyle ? window.getComputedStyle(element) : element.style;
    if (style.display === "none" || style.visibility === "hidden") return false;
    rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function preloaderIsActive() {
    var preloader = document.querySelector(".preloader");
    return elementIsVisible(preloader) && !window.I_REMEMBER_REVIVAL.introFastForwardComplete;
  }

  function setIntroFastForwardPhase(phase) {
    var preloader = document.querySelector(".preloader");
    if (!preloader) return;
    preloader.setAttribute("data-fast-forward-phase", phase);
  }

  function legacyAssetsReadyForIntroExit() {
    var config = legacyModule("config");
    var preloader = legacyModule("preloaderController");
    if (!config || !preloader || !preloader.getLoadedItemByURL) return false;
    return !!preloader.getLoadedItemByURL(config.uiAssetPath);
  }

  function runLegacyIntroAppInit() {
    var ui = legacyModule("uiController");
    if (!ui || typeof ui._appInitFunc !== "function") return false;
    if (!legacyAssetsReadyForIntroExit()) return false;
    ui._appInitFunc();
    return true;
  }

  function introReadyForExit() {
    if (!document.querySelector(".app.show")) return false;
    if (window.I_REMEMBER_REVIVAL.introAppInitialized) return true;
    return (
      elementIsVisible(document.querySelector(".add-steps-add-options")) ||
      elementIsVisible(document.querySelector(".post-2d"))
    );
  }

  function completeIntroFastForward() {
    var preloader = document.querySelector(".preloader");
    if (window.I_REMEMBER_REVIVAL.introFastForwardComplete) return;
    window.I_REMEMBER_REVIVAL.introFastForwardComplete = true;
    document.documentElement.classList.remove("is-intro-fast-forward");
    document.documentElement.classList.add("is-intro-fast-forward-complete");
    document.documentElement.setAttribute("data-intro-fast-forward", "complete");
    if (preloader) {
      preloader.removeAttribute("data-fast-forward-phase");
      preloader.style.display = "none";
    }
  }

  function pollIntroFastForward(startTime) {
    if (!window.I_REMEMBER_REVIVAL.introFastForward) return;

    if (runLegacyIntroAppInit() && introReadyForExit()) {
      completeIntroFastForward();
      return;
    }

    if (+(new Date()) - startTime > 12000) return;
    window.setTimeout(function () {
      pollIntroFastForward(startTime);
    }, 80);
  }

  function startIntroFastForward() {
    if (window.I_REMEMBER_REVIVAL.introFastForward || !preloaderIsActive()) return false;
    window.I_REMEMBER_REVIVAL.introFastForward = true;
    ensureIntroFastForwardStyles();
    document.documentElement.classList.add("is-intro-fast-forward");
    document.documentElement.setAttribute("data-intro-fast-forward", "requested");
    setIntroFastForwardPhase("first");
    window.setTimeout(function () {
      setIntroFastForwardPhase("second");
    }, 220);
    window.setTimeout(function () {
      pollIntroFastForward(+(new Date()));
    }, 560);
    return true;
  }

  function installIntroFastForward() {
    function handlePointer(event) {
      if (event.type !== "keydown" && !closest(event.target, ".preloader")) return;
      if (!startIntroFastForward()) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }

    document.addEventListener("click", handlePointer, true);
    document.addEventListener("touchstart", handlePointer, true);
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        handlePointer(event);
      },
      true
    );
  }

  function showLegacySearchResults(payload) {
    var scene = legacyModule("scene3dController");
    var ui = legacyModule("uiController");
    var posts = [];
    if (payload && payload.post) posts.push(payload.post);
    if (!posts.length && payload && payload.data && payload.data.posts) {
      posts = payload.data.posts;
    }
    if (!posts.length && payload && payload.results) posts = payload.results;
    if (!scene || !scene.showSearchedPosts || !posts.length) return false;
    if (ui && ui.hidePost2d) ui.hidePost2d();
    var Post = legacyModule("posts/Post");
    if (!Post) return false;
    posts = posts.map(function (post) { var item = post.preloadThumb ? post : new Post(post); if (!item.isThumbStartLoading) item.preloadThumb(); return item; });
    scene.showSearchedPosts(posts);
    return true;
  }

  function hideFooterSearchToken() {
    var wrapper = document.querySelector(".nav-search-wrapper");
    var item = document.querySelector(".nav-search-item");
    if (wrapper) wrapper.classList.remove("has-item");
    if (item) item.style.opacity = "0";
  }

  function ensureMenuMemoryOverlay() {
    ensureManagedMenuStyles();
    var overlay = document.querySelector(".revival-menu-memory");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "revival-menu-memory";
    if (document.querySelector(".app[data-nosnippet]")) overlay.setAttribute("data-nosnippet", "");
    // Let native taps and scrolling through the legacy input controller.
    overlay.__skipPreventDefault = true;
    overlay.setAttribute("role", "dialog");
    overlay.tabIndex = -1;
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "revival-menu-memory-title");
    overlay.innerHTML = [
      '<button class="revival-menu-close" type="button" aria-label="Close">×</button>',
      '<article class="revival-menu-card">',
      '<div class="revival-menu-image"></div>',
      '<div class="revival-menu-body">',
      '<h2 id="revival-menu-memory-title"></h2>',
      '<p class="revival-menu-excerpt"></p>',
      '<div class="revival-menu-full"></div>',
      '<div class="revival-reader-author"></div>',
      '<div class="revival-menu-actions">',
      '<button class="revival-menu-read" type="button">Read more</button>',
      '<a class="revival-menu-permalink" target="_blank" rel="noopener noreferrer">Open memory</a>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
    document.body.appendChild(overlay);
    return overlay;
  }

  function renderMenuMemory(payload) {
    var memory = payload && payload.memory;
    var page = payload && payload.page;
    if (!memory && page) {
      memory = {
        title: page.title,
        excerpt: page.excerpt,
        bodyHtml: page.bodyHtml,
        imageUrl: "/uploads/posts/revival-upload/thumb.jpg",
        publicUrl: "#"
      };
    }
    if (!memory) return;

    var overlay = ensureMenuMemoryOverlay();
    var copy = uiCopy[siteLanguage()] || uiCopy.en;
    overlay.querySelector(".revival-menu-close").setAttribute("aria-label", copy.close);
    overlay.querySelector(".revival-menu-read").textContent = copy.readMore;
    overlay.querySelector(".revival-menu-permalink").textContent = copy.openMemory;
    overlay.classList.add("is-expanded");
    overlay.querySelector(".revival-menu-image").style.backgroundImage =
      "url('" + String(memory.imageUrl || "/uploads/posts/revival-upload/thumb.jpg").replace(/'/g, "%27") + "')";
    var readerTitle = window.songqiMarkdown
      ? window.songqiMarkdown.readerTitle({ title: memory.title, bodyMarkdown: memory.bodyMarkdown || memory.content || memory.text || "" })
      : memory.title;
    overlay.querySelector("h2").textContent = readerTitle || "I remember,";
    overlay.querySelector(".revival-menu-excerpt").textContent = memory.excerpt || memory.text || "";
    var body = overlay.querySelector(".revival-menu-full");
    body.innerHTML = memory.bodyHtml || "<p>" + escapeHtml(memory.bodyMarkdown || memory.text || "") + "</p>";
    var firstHeading = body.firstElementChild;
    if (firstHeading && /^H[12]$/.test(firstHeading.tagName) && firstHeading.textContent.trim().toLowerCase() === String(memory.title || "").trim().toLowerCase()) firstHeading.remove();
    overlay.querySelector(".revival-reader-author").textContent = memory.authorName || memory.author || "";
    overlay.querySelector(".revival-menu-body").scrollTop = 0;
    var permalink = overlay.querySelector(".revival-menu-permalink");
    permalink.href = memory.publicUrl || "#";
    permalink.style.display = memory.publicUrl ? "" : "none";
    overlay.classList.add("is-visible");
    document.documentElement.classList.add("memory-reader-open");
    var app = document.querySelector(".app"); if (app) app.inert = true;
    setLegacyModalOpen(true, ".revival-menu-memory");
  }

  function renderMenuMemoryAfterSearch(payload, sequence) {
    if (sequence !== menuNavigationSequence) return;
    var navigated = showLegacySearchResults(payload);
    window.setTimeout(function () {
      if (sequence === menuNavigationSequence) renderMenuMemory(payload);
    }, navigated ? 850 : 120);
  }

  function closeMenuMemory() {
    ++menuNavigationSequence;
    var overlay = document.querySelector(".revival-menu-memory");
    if (overlay) {
      overlay.classList.remove("is-visible", "is-expanded");
      document.documentElement.classList.remove("memory-reader-open");
      var app = document.querySelector(".app"); if (app) app.inert = false;
      setLegacyModalOpen(false);
    }
    hideFooterSearchToken();
  }

  function normalizeSearchTag(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\u200b/g, "")
      .replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function searchInputText() {
    var input = document.querySelector(".search-input");
    var value = input ? input.textContent || "" : "";
    return value.replace(/\u200b/g, "").trim();
  }

  function setSearchFallbackNav(tagName) {
    var search = document.querySelector(".search");
    var applyVisibleState = function () {
      var nav = document.querySelector(".nav");
      var wrapper = document.querySelector(".nav-search-wrapper");
      var item = document.querySelector(".nav-search-item");
      var itemText = document.querySelector(".nav-search-item-text");
      var line = document.querySelector(".nav-search-item-line");

      if (nav) nav.style.display = "block";
      if (wrapper) wrapper.classList.add("has-item");
      if (itemText) itemText.textContent = tagName;
      if (item) {
        item.style.display = "block";
        item.style.opacity = "1";
      }
      if (line) {
        line.style.width = item ? Math.max(item.offsetWidth, itemText ? itemText.offsetWidth : 0, 44) + "px" : "100%";
      }
    };

    applyVisibleState();
    window.setTimeout(applyVisibleState, 80);
    window.setTimeout(applyVisibleState, 650);
    if (search) {
      search.classList.remove("not-found");
      search.style.opacity = "0";
      search.style.display = "none";
    }
  }

  function showSearchFallbackNoResult(tagName) {
    var search = document.querySelector(".search");
    var message = document.querySelector(".search-not-found");
    if (!search) return;
    if (message) {
      if (!message.getAttribute("data-template")) message.setAttribute("data-template", message.innerHTML);
      message.innerHTML = message.getAttribute("data-template").replace(/\{\{interpolation\}\}/g, escapeHtml(tagName));
      message.style.opacity = "1";
    }
    search.classList.add("not-found");
    search.style.display = "block";
    search.style.opacity = "1";
  }

  function submitSearchFallback() {
    ++menuNavigationSequence;
    var raw = searchInputText();
    var tag = normalizeSearchTag(raw);
    var url;

    if (!tag) return false;
    url =
      "/api/search-posts/" +
      encodeURIComponent(tag) +
      "?tagName=" +
      encodeURIComponent(raw);

    localApiAjax({
      url: url,
      type: "GET",
      success: function (payload) {
        var posts =
          payload && payload.success && payload.data && payload.data.posts
            ? payload.data.posts
            : [];
        if (posts.length > 0) {
          var sequence = searchFeedbackSequence;
          var seenCursors = {};
          function nextPage(cursor) {
            if (!cursor || seenCursors[cursor] || sequence !== searchFeedbackSequence) return;
            seenCursors[cursor] = true;
            localApiAjax({ url: url + "&lastId=" + encodeURIComponent(cursor), type: "GET", success: function (next) {
              if (sequence !== searchFeedbackSequence) return;
              var seen = {}; posts.forEach(function (p) { seen[p.id] = true; });
              (next.data.posts || []).forEach(function (p) { if (!seen[p.id]) { posts.push(p); seen[p.id] = true; } });
              showLegacySearchResults({ data: { posts: posts } });
              nextPage(next.data.nextCursor);
            }, error: function () { if (sequence === searchFeedbackSequence) showSearchFeedback(raw, null, true); } });
          }
          nextPage(payload.data.nextCursor);
          setSearchFallbackNav(raw || tag);
          try {
            showLegacySearchResults({ data: { posts: posts } });
          } catch (error) {}
        } else {
          showSearchFallbackNoResult(raw || tag);
        }
      },
      error: function () {
        // The shared request adapter reports failures distinctly from an empty
        // result and ignores replies after a newer search or map navigation.
        setSearchFallbackNav(raw || tag);
      }
    });

    return true;
  }

  function installSearchFallback() {
    document.addEventListener(
      "click",
      function (event) {
        if (!closest(event.target, ".search-btn")) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        submitSearchFallback();
      },
      true
    );

    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key !== "Enter" || !closest(event.target, ".search-input")) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        submitSearchFallback();
      },
      true
    );
  }

  function uploadFileError(file) {
    var limits = window.SONGQI_UPLOAD_LIMITS || { maxBytes: 8388608, maxVideoBytes: 524288000 };
    var video = /^video\//.test(file.type) || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
    var audio = /^audio\//.test(file.type) || /\.(mp3|m4a|wav|ogg|flac)$/i.test(file.name);
    var live = file.type === "application/x-songqi-live-photo" || /\.(livp|zip)$/i.test(file.name);
    var maxBytes = live ? 104857600 : audio ? (limits.maxAudioBytes || 104857600) : video ? (limits.maxVideoBytes || 524288000) : limits.maxBytes;
    if (file.size <= maxBytes) return "";
    var mb = Math.round(maxBytes / 1048576);
    var language = siteLanguage();
    if (language === "zh") return "请选择小于 " + mb + " MB 的文件。";
    if (language === "fr") return "Choisissez un fichier de moins de " + mb + " Mo.";
    return "Please choose a file under " + mb + " MB.";
  }

  function installFullPhotoViewer() {
    window.SongqiPhotos.sound = legacyModule("soundController");
    window.SongqiPhotos.installViewer();
  }

  function installTouchInteraction() {
    if (!isTouchDevice() || window.I_REMEMBER_REVIVAL.touchInteractionReady) return;
    window.I_REMEMBER_REVIVAL.touchInteractionReady = true;
    document.documentElement.classList.add("is-touch-device");
  }

  function enhanceLegacyAccessibility() {
    var a11y = {
      zh: {"Skip introduction":"跳过介绍","Explore the memory map":"探索回忆星系","Search memories":"搜索回忆","Add a memory":"添加回忆","Submit memory search":"搜索","Explore all memories":"查看所有回忆","Go back":"返回","Continue":"继续","Choose a photo from Facebook":"从 Facebook 选择照片","Choose a photo from Instagram":"从 Instagram 选择照片","Accept the terms of service":"同意服务条款","Open the terms of service":"打开服务条款","Close terms":"关闭条款","Close credits":"关闭介绍","Toggle sound":"切换声音","Your name":"你的名字","Your email":"你的邮箱","Your memory":"你的回忆","Choose a photo from this device":"从设备选择照片","Close memory":"关闭回忆"},
      fr: {"Skip introduction":"Passer l’introduction","Explore the memory map":"Explorer les souvenirs","Search memories":"Rechercher un souvenir","Add a memory":"Ajouter un souvenir","Submit memory search":"Rechercher","Explore all memories":"Voir tous les souvenirs","Go back":"Retour","Continue":"Continuer","Choose a photo from Facebook":"Choisir une photo sur Facebook","Choose a photo from Instagram":"Choisir une photo sur Instagram","Accept the terms of service":"Accepter les conditions","Open the terms of service":"Ouvrir les conditions","Close terms":"Fermer les conditions","Close credits":"Fermer les crédits","Toggle sound":"Activer ou couper le son","Your name":"Votre nom","Your email":"Votre e-mail","Your memory":"Votre souvenir","Choose a photo from this device":"Choisir une photo sur cet appareil","Close memory":"Fermer le souvenir"}
    };
    function label(value) { return (a11y[siteLanguage()] || {})[value] || value; }

    var buttons = [
      [".preloader", "Skip introduction"],
      [".nav-map-btn", "Explore the memory map"],
      [".nav-search-btn", "Search memories"],
      [".nav-add-btn", "Add a memory"],
      [".search-btn", "Submit memory search"],
      [".add-steps-add-options-share", "Add a memory"],
      [".add-steps-add-options-look", "Explore all memories"],
      [".add-steps-back-btn", "Go back"],
      [".add-steps-validate-btn", "Continue"],
      [".circle-btn-symbol-facebook", "Choose a photo from Facebook"],
      [".circle-btn-symbol-instagram", "Choose a photo from Instagram"],
      [".add-steps-message-terms-i-accept", "Accept the terms of service"],
      [".add-steps-message-terms-link", "Open the terms of service"],
      [".terms-close-btn", "Close terms"],
      [".credit-close-btn", "Close credits"],
      [".footer-sound-btn", "Toggle sound"],
      [".post-2d-close-btn", "Close memory"]
    ];
    var contentEditables = [
      [".search-input", "Search memories", "searchbox"],
      [".add-steps-message-name-wrapper .add-steps-message-input", "Your name", "textbox"],
      [".add-steps-message-email-wrapper .add-steps-message-input", "Your email", "textbox"],
      [".add-steps-message-message .add-steps-message-input", "Your memory", "textbox"]
    ];

    buttons.forEach(function (entry) {
      Array.prototype.forEach.call(document.querySelectorAll(entry[0]), function (element) {
        if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)) {
          element.setAttribute("role", "button");
          if (!element.hasAttribute("tabindex")) element.tabIndex = 0;
        }
        element.setAttribute("aria-label", label(entry[1]));
      });
    });

    contentEditables.forEach(function (entry) {
      Array.prototype.forEach.call(document.querySelectorAll(entry[0]), function (element) {
        element.setAttribute("role", entry[2]);
        element.setAttribute("aria-label", label(entry[1]));
        element.setAttribute("aria-multiline", entry[1] === "Your memory" ? "true" : "false");
        element.setAttribute("spellcheck", entry[1] === "Your email" ? "false" : "true");
        if (entry[1] === "Your email") {
          element.setAttribute("inputmode", "email");
          element.setAttribute("autocapitalize", "none");
          element.setAttribute("enterkeyhint", "next");
        } else if (entry[1] === "Search memories") {
          element.setAttribute("enterkeyhint", "search");
        }
      });
    });

    var uploadInput = document.querySelector("#local-upload");
    if (uploadInput) { uploadInput.setAttribute("aria-label", siteLanguage() === "fr" ? "Choisir des photos, vidéos ou fichiers audio" : siteLanguage() === "zh" ? "选择照片、视频或音频" : "Choose photos, videos or audio from this device"); uploadInput.accept = window.songqiMedia.accept; }

    var intro = document.querySelector(".preloader");
    if (intro) intro.setAttribute("aria-live", "polite");

    var searchDummy = document.querySelector(".search-input-dummy");
    if (searchDummy) searchDummy.setAttribute("aria-hidden", "true");
  }

  function installLegacyKeyboardActivation() {
    if (window.I_REMEMBER_REVIVAL.keyboardActivationReady) return;
    window.I_REMEMBER_REVIVAL.keyboardActivationReady = true;
    document.addEventListener("keydown", function (event) {
      var modal = Array.prototype.find.call(document.querySelectorAll(
        ".revival-menu-memory.is-visible,.terms,.credit"
      ), elementIsVisible);
      var focusable;
      var first;
      var last;
      if (modal && !elementIsVisible(modal)) modal = null;

      if (event.key === "Escape" && modal) {
        event.preventDefault();
        if (modal.classList.contains("revival-menu-memory")) closeMenuMemory();
        if (modal.classList.contains("terms")) setTermsVisible(false);
        if (modal.classList.contains("credit")) setCreditVisible(false);
        return;
      }

      if (event.key === "Tab" && modal) {
        focusable = Array.prototype.filter.call(
          modal.querySelectorAll(
            "a[href],button,input,textarea,select,[contenteditable='true'],[tabindex]:not([tabindex='-1'])"
          ),
          elementIsVisible
        );
        if (focusable.length) {
          first = focusable[0];
          last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }

      var target = closest(event.target, '[role="button"]');
      if (!target || /^(A|BUTTON|INPUT)$/.test(target.tagName)) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      target.click();
    }, true);
  }

  function applyEmptyMemoryState() {
    var posts = window.DEFAULT_POSTS && window.DEFAULT_POSTS.data && window.DEFAULT_POSTS.data.posts;
    if (!posts || posts.length > 0) return;
    ensureManagedMenuStyles();
    document.documentElement.classList.add("revival-empty-memory");
  }

  var activeLongMemory = null;
  var initialMemoryMatch = String(window.location.pathname).match(/^\/memory\/([^/?#]+)/);
  var lastViewedMemory = initialMemoryMatch ? initialMemoryMatch[1] : "";

  function memoryIdFromPath(path) {
    var parsed;
    var match;
    try { parsed = new URL(String(path || ""), window.location.href); } catch (error) { return ""; }
    match = parsed.pathname.match(/^\/memory\/([^/?#]+)/);
    return match ? match[1] : "";
  }

  function setMemoryExplore(memory) {
    var wrapper = document.querySelector(".post-2d-message-wrapper");
    var existing = document.querySelector(".revival-memory-explore");
    var button;
    if (existing) existing.parentNode.removeChild(existing);
    activeLongMemory = null;
    var preview = memory && window.songqiMarkdown && window.songqiMarkdown.preview(memory);
    if (!wrapper || !preview || !preview.longForm) return;
    button = document.createElement("button");
    button.type = "button";
    button.className = "revival-memory-explore";
    button.__skipPreventDefault = true;
    button.textContent = (uiCopy[siteLanguage()] || uiCopy.en).readMore;
    button.setAttribute("aria-haspopup", "dialog");
    wrapper.appendChild(button);
    activeLongMemory = {
      title: memory.title,
      content: memory.content,
      authorName: memory.authorName,
      excerpt: preview.text,
      bodyHtml: window.songqiMarkdown ? window.songqiMarkdown.render(window.songqiMarkdown.body(memory)) : "<p>" + escapeHtml(memory.content || "") + "</p>",
      imageUrl: memory.attachments && memory.attachments.some(function(item){return /^image\//.test(item.type);})
        ? memory.attachments.filter(function(item){return /^image\//.test(item.type);})[0].url
        : "/uploads/posts/revival-upload/resized.jpg",
      publicUrl: "/memory/" + encodeURIComponent(memory.id)
    };
  }

  var memoryRequestSequence = 0;
  var memoryRequestController;
  function refreshMemoryRoute(path, initial) {
    var requestSequence = ++memoryRequestSequence;
    if (memoryRequestController) memoryRequestController.abort();
    memoryRequestController = new AbortController();
    var id = memoryIdFromPath(path);
    if (!id) {
      if (window.SONGQI_SITE_SETTINGS) document.title = window.SONGQI_SITE_SETTINGS.siteTitle;
      lastViewedMemory = "";
      setMemoryExplore(null);
      return;
    }
    if (id !== lastViewedMemory) setMemoryExplore(null);
    lastViewedMemory = id;
    fetchJson("/api/v1/memories/" + encodeURIComponent(id), memoryRequestController.signal)
      .then(function(memory){if(requestSequence === memoryRequestSequence) { setMemoryExplore(memory); if (memory && window.SONGQI_SITE_SETTINGS) document.title = memory.title + " · " + window.SONGQI_SITE_SETTINGS.siteTitle; }})
      .catch(function () {});
  }

  function installMemoryRouteObserver() {
    window.addEventListener("songqi-markdown-ready", function(){refreshMemoryRoute(window.location.pathname, true);});
    var currentPath = window.location.pathname + window.location.search + window.location.hash;
    var cleanPath = languageUrl(window.location.href, siteLanguage());
    if (currentPath !== cleanPath) window.history.replaceState(window.history.state, "", cleanPath);
    ["pushState", "replaceState"].forEach(function (name) {
      var original = window.history[name];
      window.history[name] = function () {
        if (arguments[2] != null) {
          try { arguments[2] = languageUrl(arguments[2], siteLanguage()); } catch (error) {}
        }
        var result = original.apply(this, arguments);
        refreshMemoryRoute(arguments[2] || window.location.pathname, false);
        return result;
      };
    });
    window.addEventListener("popstate", function () {
      window.LANG = languageFromLocation();
      applyLanguagePreference();
      refreshMemoryRoute(window.location.pathname, false);
    });
    refreshMemoryRoute(window.location.pathname, true);
  }

  function loadManagedFooter() {
    fetchJson("/api/public/menu")
      .then(function (data) {
        renderManagedFooter(data.items || []);
        applyLanguagePreference();
      })
      .catch(function () {});
  }

  ensureManagedMenuStyles();
  installMobileViewportSupport();
  installDesktopCardFit();
  installImeCompositionSupport();
  installLegacySearchState();
  installMobileMapHint();
  enhanceLegacyAccessibility();
  installLegacyKeyboardActivation();
  applyLanguagePreference();
  loadManagedFooter();
  installPanelResizers();
  installTouchInteraction();
  installMemoryRouteObserver();
  applyEmptyMemoryState();
  document.addEventListener("DOMContentLoaded", function () {
    ensureManagedMenuStyles();
    installMobileViewportSupport();
    installDesktopCardFit();
    installFullPhotoViewer();
    installImeCompositionSupport();
    installLegacySearchState();
    installMobileMapHint();
    enhanceLegacyAccessibility();
    applyLanguagePreference();
    installPanelResizers();
    installTouchInteraction();
    applyEmptyMemoryState();
  });
  window.setTimeout(enhanceLegacyAccessibility, 800);
  window.setTimeout(installImeCompositionSupport, 800);
  window.setTimeout(installLegacySearchState, 800);
  window.setTimeout(applyLanguagePreference, 800);
  window.setTimeout(applyLanguagePreference, 1800);
  installIntroFastForward();
  installSearchFallback();
  window.__REVIVAL_EXIT_SEARCH__ = exitLegacySearch;
  window.__REVIVAL_BIND_INPUT__ = bindLegacyInput;
  window.__REVIVAL_PICK_TOUCH_MEMORY__ = pickTouchMemory;
  window.__REVIVAL_UPLOAD_ERROR__ = uploadFileError;

  document.addEventListener(
    "click",
    function (event) {
      var languageItem = closest(event.target, ".footer-link-lang-item[data-id]");
      if (languageItem) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        setPreferredLanguage(languageItem.getAttribute("data-id"));
        applyLanguagePreference();
        return;
      }

      var managedItem = closest(event.target, ".footer-managed-item[data-menu-id]");
      if (managedItem) {
        var type = managedItem.getAttribute("data-menu-type");
        if (type === "EXTERNAL") return;
        event.preventDefault();
        event.stopPropagation();

        if (type === "LANGUAGE") return;
        if (type === "GROUP") {
          managedItem.classList.toggle("is-open");
          managedItem.setAttribute(
            "aria-expanded",
            managedItem.classList.contains("is-open") ? "true" : "false"
          );
          return;
        }
        if (type === "TERMS") {
          setTermsVisible(true);
          return;
        }
        if (type === "CREDITS") {
          setCreditVisible(true);
          return;
        }

        var menuSequence = ++menuNavigationSequence;
        ++searchFeedbackSequence;
        showFooterSearchToken(managedItem.getAttribute("data-menu-label") || managedItem.textContent);
        fetchJson(
          "/api/public/menu-target/" +
            encodeURIComponent(managedItem.getAttribute("data-menu-id"))
        )
          .then(function (payload) { renderMenuMemoryAfterSearch(payload, menuSequence); })
          .catch(function () {
            if (menuSequence === menuNavigationSequence) hideFooterSearchToken();
          });
        return;
      }

      if (
        closest(event.target, ".revival-menu-close") ||
        event.target === document.querySelector(".revival-menu-memory")
      ) {
        event.preventDefault();
        event.stopPropagation();
        closeMenuMemory();
        return;
      }

      if (closest(event.target, ".revival-menu-read")) {
        event.preventDefault();
        event.stopPropagation();
        var overlay = document.querySelector(".revival-menu-memory");
        if (overlay) overlay.classList.toggle("is-expanded");
        return;
      }

      if (closest(event.target, ".revival-memory-explore") && activeLongMemory) {
        event.preventDefault();
        event.stopPropagation();
        renderMenuMemory({ memory: activeLongMemory });
        var longOverlay = document.querySelector(".revival-menu-memory");
        if (longOverlay) longOverlay.classList.add("is-expanded");
        return;
      }

      if (closest(event.target, ".footer-link-credits")) {
        event.preventDefault();
        event.stopPropagation();
        setCreditVisible(true);
        return;
      }

      if (
        closest(event.target, ".credit-close-btn") ||
        event.target === document.querySelector(".credit")
      ) {
        event.preventDefault();
        event.stopPropagation();
        setCreditVisible(false);
        return;
      }

      if (
        closest(event.target, ".terms-close-btn") ||
        event.target === document.querySelector(".terms")
      ) {
        event.preventDefault();
        event.stopPropagation();
        setTermsVisible(false);
      }
    },
    true
  );
}());

;(function () {
  document.addEventListener("pointerdown", function () {
    var runtime = window.__REVIVAL_REQUIREJS__ || window.requirejs;
    var sound = runtime && runtime._defined && runtime._defined.soundController;
    var audio = window.__REVIVAL_AUDIO__;
    if (sound && !sound.isMute && audio && audio.loop.paused) audio.loop.play().catch(function () {});
  }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    var runtime = window.__REVIVAL_REQUIREJS__ || window.requirejs;
    var stage = runtime && runtime._defined && runtime._defined.stageReference;
    if (!stage) return;
    if (document.hidden && stage.isRendering) stage.stopRender();
    else if (!document.hidden && !stage.isRendering) stage.startRender();
  });
  document.addEventListener("touchmove", function (event) {
    if (matchMedia("(max-width:760px), (max-width:1024px) and (max-height:500px)").matches && event.target.closest(".post-2d-center-wrapper,.revival-menu-card,.add-steps-message")) event.stopPropagation();
  }, { capture: true, passive: true });
})();

;(function () {
  var skyState = null;
  var scratchRay = null;
  var hoverCache = { x: NaN, y: NaN, time: 0, hit: false };

  function initStarrySky(scene, THREE) {
    if (!scene || !THREE || skyState) return;

    var reducedMotion = Boolean(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    var deterministic = Boolean(
      window.I_REMEMBER_REVIVAL && window.I_REMEMBER_REVIVAL.deterministic
    );

    // 1. Atmospheric Night Sky Gradient Dome + Analytic Milky Way Glow (0 extra draw calls / overdraw)
    var domeGeo = new THREE.Geometry();
    var segW = 16;
    var segH = 10;
    var domeR = 2650;
    for (var iy = 0; iy <= segH; iy += 1) {
      var v = iy / segH;
      var phi = v * Math.PI;
      for (var ix = 0; ix <= segW; ix += 1) {
        var u = ix / segW;
        var theta = u * Math.PI * 2;
        domeGeo.vertices.push(new THREE.Vector3(
          -domeR * Math.cos(theta) * Math.sin(phi),
          domeR * Math.cos(phi),
          domeR * Math.sin(theta) * Math.sin(phi)
        ));
      }
    }
    var stride = segW + 1;
    for (var fy = 0; fy < segH; fy += 1) {
      for (var fx = 0; fx < segW; fx += 1) {
        var a = fy * stride + fx;
        var b = a + 1;
        var c = a + stride;
        var d = c + 1;
        if (fy !== 0) domeGeo.faces.push(new THREE.Face3(a, c, b));
        if (fy !== segH - 1) domeGeo.faces.push(new THREE.Face3(b, c, d));
      }
    }
    var tilt = 0.56;
    var cosTilt = Math.cos(tilt);
    var sinTilt = Math.sin(tilt);
    var domeMat = new THREE.ShaderMaterial({
      uniforms: {
        uRotY: { type: "f", value: 0 },
        uOpacity: { type: "f", value: 0.85 }
      },
      vertexShader: [
        "varying vec3 vDir;",
        "void main() {",
        "  vDir = normalize(position);",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "precision mediump float;",
        "uniform float uRotY;",
        "uniform float uOpacity;",
        "varying vec3 vDir;",
        "void main() {",
        "  vec3 dir = normalize(vDir);",
        "  float h = clamp(dir.y, -0.15, 1.0);",
        "  vec3 horizon = vec3(0.0235, 0.0392, 0.0784);",
        "  vec3 midSky = vec3(0.018, 0.032, 0.070);",
        "  vec3 zenith = vec3(0.008, 0.015, 0.038);",
        "  vec3 col = mix(horizon, midSky, smoothstep(-0.02, 0.28, h));",
        "  col = mix(col, zenith, smoothstep(0.28, 0.85, h));",
        "  float cR = cos(-uRotY);",
        "  float sR = sin(-uRotY);",
        "  vec3 gDir = vec3(dir.x * cR + dir.z * sR, dir.y, -dir.x * sR + dir.z * cR);",
        "  float galDist = abs(dot(gDir, vec3(0.0, 0.847, -0.531)));",
        "  float band = exp(-galDist * 7.0);",
        "  float rift = 0.72 + 0.28 * sin(gDir.x * 6.0 + gDir.z * 4.5) * cos(gDir.y * 5.0 - gDir.x * 3.5);",
        "  float horizonFade = smoothstep(-0.02, 0.28, h);",
        "  col += vec3(0.016, 0.026, 0.056) * band * rift * horizonFade * uOpacity;",
        "  gl_FragColor = vec4(col, 1.0);",
        "}"
      ].join("\n"),
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false
    });
    var skyDome = new THREE.Mesh(domeGeo, domeMat);
    skyDome.frustumCulled = false;
    scene.add(skyDome);

    // 2. Astronomical Power-Law Starfield (960 stars, soft bokeh matched to terrain points)
    var totalStars = 960;
    var geometry = new THREE.Geometry();
    var sizes = [];
    var phases = [];
    var colors = [];
    var flares = [];
    var starPositions = new Float32Array(totalStars * 3);
    var unitDirs = new Float32Array(totalStars * 3);
    var hitCos = new Float32Array(totalStars);

    var faintPalette = [
      new THREE.Color(0xdce8ff),
      new THREE.Color(0xf2f6ff),
      new THREE.Color(0xffffff),
      new THREE.Color(0xfff1dc)
    ];
    var heroPalette = [
      new THREE.Color(0xb4ceff),
      new THREE.Color(0xdce8ff),
      new THREE.Color(0xffffff),
      new THREE.Color(0xffe9c8)
    ];

    for (var i = 0; i < totalStars; i += 1) {
      var x, y, z;
      var radius = 1750 + Math.random() * 700;
      var isMilkyWay = i >= 640 && i < 900;
      var isHero = i >= 900;

      if (isMilkyWay) {
        var lon = Math.random() * Math.PI * 2;
        var lat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.2;
        var gx = Math.cos(lat) * Math.cos(lon);
        var gy = Math.sin(lat);
        var gz = Math.cos(lat) * Math.sin(lon);
        x = gx * radius;
        y = (gy * cosTilt - gz * sinTilt) * radius;
        z = (gy * sinTilt + gz * cosTilt) * radius;
        if (y < -radius * 0.08) y = Math.abs(y) * 0.85;
      } else {
        var theta = Math.random() * Math.PI * 2;
        var u = -0.06 + Math.random() * 1.06;
        var sinPhi = Math.sqrt(Math.max(0, 1 - u * u));
        x = radius * sinPhi * Math.cos(theta);
        y = radius * u;
        z = radius * sinPhi * Math.sin(theta);
      }

      geometry.vertices.push(new THREE.Vector3(x, y, z));
      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
      var invLen = 1 / Math.sqrt(x * x + y * y + z * z);
      unitDirs[i * 3] = x * invLen;
      unitDirs[i * 3 + 1] = y * invLen;
      unitDirs[i * 3 + 2] = z * invLen;
      hitCos[i] = isHero ? 0.9985 : 0.99935;

      var mag = Math.pow(Math.random(), 3.4);
      var size = isHero
        ? 5.5 + Math.random() * 5.0
        : isMilkyWay
          ? 1.4 + mag * 2.8
          : 1.6 + mag * 3.2;
      sizes.push(size);
      phases.push(Math.random() * Math.PI * 2);
      colors.push(
        isHero
          ? heroPalette[Math.floor(Math.random() * heroPalette.length)]
          : faintPalette[Math.floor(Math.random() * faintPalette.length)]
      );
      flares.push(isHero ? 0.25 + Math.random() * 0.35 : 0.0);
    }

    var uniforms = {
      uTime: { type: "f", value: 0 },
      uDpi: { type: "f", value: window.devicePixelRatio || 1 },
      uZoom: { type: "f", value: 0 },
      uOpacity: { type: "f", value: 0.84 },
      uWarp: { type: "f", value: 0 }
    };

    var attributes = {
      aSize: { type: "f", value: sizes },
      aPhase: { type: "f", value: phases },
      aColor: { type: "c", value: colors },
      aFlare: { type: "f", value: flares }
    };

    var vertexShader = [
      "attribute float aSize;",
      "attribute float aPhase;",
      "attribute vec3 aColor;",
      "attribute float aFlare;",
      "uniform float uTime;",
      "uniform float uDpi;",
      "uniform float uZoom;",
      "uniform float uOpacity;",
      "uniform float uWarp;",
      "varying vec3 vColor;",
      "varying float vAlpha;",
      "varying float vFlare;",
      "void main() {",
      "  float elev = clamp(normalize(position).y, -0.1, 1.0);",
      "  float extinction = smoothstep(-0.02, 0.24, elev);",
      "  float scintAmp = mix(0.28, 0.10, smoothstep(0.0, 0.7, elev));",
      "  float speed = 0.45 + fract(aPhase * 3.17) * 0.85;",
      "  float wave = sin(uTime * speed + aPhase * 11.0) * cos(uTime * 0.42 + aPhase * 5.3);",
      "  float twinkle = 1.0 - scintAmp * (0.5 - 0.5 * wave);",
      "  vColor = mix(vec3(0.75, 0.82, 0.96), aColor, smoothstep(0.0, 0.25, elev));",
      "  vColor = mix(vColor, vec3(0.84, 0.93, 1.0), uWarp * 0.35);",
      "  vFlare = aFlare * (0.85 + 0.15 * twinkle + uWarp * 0.45);",
      "  vAlpha = clamp(twinkle * extinction * uOpacity * (1.0 + uWarp * 0.28), 0.0, 1.0);",
      "  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
      "  gl_PointSize = aSize * uDpi * (0.92 + 0.14 * twinkle) * (1.0 + uZoom * 0.12 + uWarp * 0.35);",
      "  gl_Position = projectionMatrix * mvPosition;",
      "}"
    ].join("\n");

    var fragmentShader = [
      "precision mediump float;",
      "varying vec3 vColor;",
      "varying float vAlpha;",
      "varying float vFlare;",
      "void main() {",
      "  vec2 uv = (gl_PointCoord.xy - 0.5) * 2.0;",
      "  float d2 = dot(uv, uv);",
      "  if (d2 > 1.0) discard;",
      "  float inv2 = 1.0 - d2;",
      "  float core = smoothstep(0.08, 0.008, d2);",
      "  float halo = inv2 * inv2 * inv2 * 0.26;",
      "  float spikes = 0.0;",
      "  if (vFlare > 0.02) {",
      "    float sx = max(0.0, 1.0 - abs(uv.y) * 8.5) * max(0.0, 1.0 - abs(uv.x) * 1.45);",
      "    float sy = max(0.0, 1.0 - abs(uv.x) * 8.5) * max(0.0, 1.0 - abs(uv.y) * 1.45);",
      "    spikes = (sx * sx + sy * sy) * vFlare * 0.6;",
      "  }",
      "  float intensity = clamp(core * 0.96 + halo + spikes, 0.0, 1.1);",
      "  vec3 finalColor = mix(vColor, vec3(1.0), core * 0.55);",
      "  gl_FragColor = vec4(finalColor, intensity * vAlpha);",
      "}"
    ].join("\n");

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      attributes: attributes,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false
    });

    var particles = new THREE.ParticleSystem(geometry, material);
    particles.frustumCulled = false;
    scene.add(particles);

    // 3. Volumetric 3D Spacetime Drifters (220 tiny world-wrapped particles bridging ground & sky)
    var driftCount = 220;
    var driftGeo = new THREE.Geometry();
    var driftSizes = [];
    var driftPhases = [];
    var driftColors = [];
    var driftPalette = [
      new THREE.Color(0x8db6ff),
      new THREE.Color(0xcce0ff),
      new THREE.Color(0xfff1dc),
      new THREE.Color(0xffffff)
    ];
    for (var di = 0; di < driftCount; di += 1) {
      driftGeo.vertices.push(new THREE.Vector3(
        Math.random() * 1600,
        -60 + Math.random() * 340,
        Math.random() * 1600
      ));
      driftSizes.push(1.8 + Math.random() * 2.6);
      driftPhases.push(Math.random() * Math.PI * 2);
      driftColors.push(driftPalette[di % driftPalette.length]);
    }
    var driftUniforms = {
      uTime: { type: "f", value: 0 },
      uDpi: { type: "f", value: window.devicePixelRatio || 1 },
      uCamPos: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
      uWarp: { type: "f", value: 0 },
      uOpacity: { type: "f", value: 0.72 }
    };
    var driftMat = new THREE.ShaderMaterial({
      uniforms: driftUniforms,
      attributes: {
        aSize: { type: "f", value: driftSizes },
        aPhase: { type: "f", value: driftPhases },
        aColor: { type: "c", value: driftColors }
      },
      vertexShader: [
        "attribute float aSize;",
        "attribute float aPhase;",
        "attribute vec3 aColor;",
        "uniform float uTime;",
        "uniform float uDpi;",
        "uniform vec3 uCamPos;",
        "uniform float uWarp;",
        "uniform float uOpacity;",
        "varying vec3 vColor;",
        "varying float vAlpha;",
        "void main() {",
        "  vec2 relXZ = mod(position.xz - uCamPos.xz + 800.0, 1600.0) - 800.0;",
        "  float driftY = position.y + sin(uTime * 0.55 + aPhase) * 9.0;",
        "  vec3 worldPos = vec3(uCamPos.x + relXZ.x, driftY, uCamPos.z + relXZ.y);",
        "  float distXZ = length(relXZ);",
        "  float edgeFade = 1.0 - smoothstep(480.0, 800.0, distXZ);",
        "  vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);",
        "  float dist = max(1.0, length(mvPos.xyz));",
        "  float nearFade = smoothstep(60.0, 190.0, dist);",
        "  float pulse = 0.72 + 0.28 * sin(uTime * 1.1 + aPhase * 3.0);",
        "  vColor = mix(aColor, vec3(0.84, 0.94, 1.0), uWarp * 0.45);",
        "  vAlpha = clamp(edgeFade * nearFade * pulse * uOpacity * (0.68 + uWarp * 0.55), 0.0, 1.0);",
        "  gl_PointSize = clamp((aSize * 300.0 / dist) * uDpi * (1.0 + uWarp * 0.3), 1.0, 6.5 * uDpi);",
        "  gl_Position = projectionMatrix * mvPos;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "precision mediump float;",
        "varying vec3 vColor;",
        "varying float vAlpha;",
        "void main() {",
        "  vec2 uv = (gl_PointCoord.xy - 0.5) * 2.0;",
        "  float d2 = dot(uv, uv);",
        "  if (d2 > 1.0) discard;",
        "  float inv2 = 1.0 - d2;",
        "  float core = smoothstep(0.075, 0.008, d2);",
        "  float intensity = clamp(core * 0.95 + inv2 * inv2 * inv2 * 0.24, 0.0, 1.0);",
        "  gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.45), intensity * vAlpha);",
        "}"
      ].join("\n"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false
    });
    var drifters = new THREE.ParticleSystem(driftGeo, driftMat);
    drifters.frustumCulled = false;
    scene.add(drifters);

    // 4. Celestial Astrolabe Coordinate Rings (subtle spacetime sphere lines)
    var celestialRings = [];
    var ringGroup = new THREE.Object3D();
    var ringSpecs = [
      { rx: 0.48, rz: 0.22, color: 0x6e98e6 },
      { rx: -0.62, rz: 0.52, color: 0x8bb4ff },
      { rx: 1.18, rz: -0.35, color: 0x5d84c9 }
    ];
    for (var ri = 0; ri < ringSpecs.length; ri += 1) {
      var rGeo = new THREE.Geometry();
      var rSegs = 84;
      var rRad = 2200;
      for (var rs = 0; rs <= rSegs; rs += 1) {
        var rAng = (rs / rSegs) * Math.PI * 2;
        rGeo.vertices.push(new THREE.Vector3(Math.cos(rAng) * rRad, 0, Math.sin(rAng) * rRad));
      }
      var rMat = new THREE.LineBasicMaterial({
        color: ringSpecs[ri].color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.032,
        depthTest: false,
        fog: false
      });
      var rLine = new THREE.Line(rGeo, rMat);
      rLine.rotation.x = ringSpecs[ri].rx;
      rLine.rotation.z = ringSpecs[ri].rz;
      rLine.frustumCulled = false;
      ringGroup.add(rLine);
      celestialRings.push({ line: rLine, mat: rMat });
    }
    scene.add(ringGroup);

    // 5. Dynamic Cursor Constellation Synapses (pre-allocated LinePieces buffer)
    var maxConstellationSegs = 28;
    var cGeo = new THREE.Geometry();
    for (var ci = 0; ci < maxConstellationSegs * 2; ci += 1) {
      cGeo.vertices.push(new THREE.Vector3(0, 0, 0));
      cGeo.colors.push(new THREE.Color(0x000000));
    }
    var cMat = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.65,
      depthTest: false,
      fog: false
    });
    var constellationLines = new THREE.Line(cGeo, cMat, THREE.LinePieces);
    constellationLines.frustumCulled = false;
    scene.add(constellationLines);

    // 6. 1-to-1 Blinking Memory Beacons (each blinking ringed light point = 1 real unique Memory)
    var maxBeacons = 256;
    var beaconGeo = new THREE.Geometry();
    var beaconPhases = [];
    var beaconActive = [];
    var beaconHover = [];
    for (var bi = 0; bi < maxBeacons; bi += 1) {
      beaconGeo.vertices.push(new THREE.Vector3(0, -99999, 0));
      beaconPhases.push((bi * 1.6180339) % (Math.PI * 2));
      beaconActive.push(0.0);
      beaconHover.push(0.0);
    }
    var beaconUniforms = {
      uTime: { type: "f", value: 0 },
      uDpi: { type: "f", value: window.devicePixelRatio || 1 },
      uOpacity: { type: "f", value: 1.0 }
    };
    var beaconAttributes = {
      aPhase: { type: "f", value: beaconPhases },
      aActive: { type: "f", value: beaconActive },
      aHover: { type: "f", value: beaconHover }
    };
    var beaconMat = new THREE.ShaderMaterial({
      uniforms: beaconUniforms,
      attributes: beaconAttributes,
      vertexShader: [
        "attribute float aPhase;",
        "attribute float aActive;",
        "attribute float aHover;",
        "uniform float uTime;",
        "uniform float uDpi;",
        "uniform float uOpacity;",
        "varying float vBlink;",
        "varying float vHover;",
        "varying float vAlpha;",
        "void main() {",
        "  if (aActive < 0.5 || uOpacity < 0.01) {",
        "    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);",
        "    gl_PointSize = 0.0;",
        "    vBlink = 0.0;",
        "    vHover = 0.0;",
        "    vAlpha = 0.0;",
        "    return;",
        "  }",
        "  float wave = 0.5 + 0.5 * sin(uTime * 2.2 + aPhase);",
        "  float blink = 0.24 + 0.76 * pow(wave, 1.45);",
        "  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);",
        "  float dist = max(70.0, length(mvPos.xyz));",
        "  float baseSize = clamp(2400.0 / dist, 15.0, 34.0) * uDpi;",
        "  gl_PointSize = baseSize * (0.88 + 0.22 * blink + aHover * 0.45);",
        "  vBlink = blink;",
        "  vHover = aHover;",
        "  vAlpha = uOpacity;",
        "  gl_Position = projectionMatrix * mvPos;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "precision mediump float;",
        "varying float vBlink;",
        "varying float vHover;",
        "varying float vAlpha;",
        "void main() {",
        "  if (vAlpha < 0.01) discard;",
        "  vec2 uv = (gl_PointCoord.xy - 0.5) * 2.0;",
        "  float d2 = dot(uv, uv);",
        "  if (d2 > 1.0) discard;",
        "  float d = sqrt(d2);",
        "  float inv2 = 1.0 - d2;",
        "  float core = smoothstep(0.085, 0.008, d2) * (0.45 + 0.75 * vBlink + vHover * 0.35);",
        "  float glow = inv2 * inv2 * inv2 * (0.18 + 0.24 * vBlink);",
        "  float ring = exp(-pow((d - 0.58) * 9.0, 2.0)) * (0.34 + 0.44 * vBlink + vHover * 0.52);",
        "  float intensity = clamp(core + glow + ring, 0.0, 1.25);",
        "  vec3 warmGold = vec3(1.0, 0.92, 0.74);",
        "  vec3 hoverCyan = vec3(0.78, 0.94, 1.0);",
        "  vec3 col = mix(warmGold, hoverCyan, clamp(vHover * 0.85, 0.0, 1.0));",
        "  col = mix(col, vec3(1.0), core * 0.55);",
        "  gl_FragColor = vec4(col, intensity * vAlpha);",
        "}"
      ].join("\n"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false
    });
    var memoryBeaconParticles = new THREE.ParticleSystem(beaconGeo, beaconMat);
    memoryBeaconParticles.frustumCulled = false;
    scene.add(memoryBeaconParticles);

    var meteors = [];
    if (!reducedMotion && !deterministic) {
      for (var m = 0; m < 2; m += 1) {
        var mGeo = new THREE.Geometry();
        mGeo.vertices.push(new THREE.Vector3(), new THREE.Vector3());
        mGeo.colors.push(new THREE.Color(0xffffff), new THREE.Color(0x6699ff));
        var mMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0,
          depthTest: false,
          fog: false
        });
        var line = new THREE.Line(mGeo, mMat);
        line.frustumCulled = false;
        scene.add(line);
        meteors.push({
          line: line,
          geo: mGeo,
          mat: mMat,
          active: false,
          progress: 0,
          duration: 1.2,
          cooldown: 2.5 + m * 4.5 + Math.random() * 4.0,
          start: new THREE.Vector3(),
          dir: new THREE.Vector3(),
          length: 220
        });
      }
    }

    skyState = {
      skyDome: skyDome,
      domeUniforms: domeMat.uniforms,
      particles: particles,
      uniforms: uniforms,
      drifters: drifters,
      driftUniforms: driftUniforms,
      ringGroup: ringGroup,
      celestialRings: celestialRings,
      constellationLines: constellationLines,
      constellationGeo: cGeo,
      maxConstellationSegs: maxConstellationSegs,
      constellationNodes: [],
      memoryBeacons: memoryBeaconParticles,
      beaconGeo: beaconGeo,
      beaconMat: beaconMat,
      beaconUniforms: beaconUniforms,
      beaconActive: beaconActive,
      beaconHover: beaconHover,
      maxBeacons: maxBeacons,
      beacons: [],
      beaconById: {},
      occupiedCells: {},
      lastBeaconSyncCount: -1,
      hoveredBeaconIdx: -1,
      meteors: meteors,
      starPositions: starPositions,
      unitDirs: unitDirs,
      hitCos: hitCos,
      totalStars: totalStars,
      reducedMotion: reducedMotion,
      lastTime: Date.now(),
      prevCamPos: new THREE.Vector3(),
      hasPrevCam: false,
      prevZoom: 0,
      warp: 0,
      gazePitch: 0,
      pointerWorld: { x: 0, z: 0, strength: 0 },
      pulse: { x: 0, z: 0, age: 10, strength: 0 }
    };
  }

  function spawnMeteor(meteor, cameraPos) {
    var theta = Math.random() * Math.PI * 2;
    var r = 1350 + Math.random() * 450;
    var y = 380 + Math.random() * 680;
    meteor.start.set(
      cameraPos.x + Math.cos(theta) * r,
      cameraPos.y + y,
      cameraPos.z + Math.sin(theta) * r
    );
    var tangentAngle = theta + (Math.random() > 0.5 ? 1.2 : -1.2);
    meteor.dir.set(
      Math.cos(tangentAngle),
      -0.38 - Math.random() * 0.25,
      Math.sin(tangentAngle)
    ).normalize();
    meteor.length = 160 + Math.random() * 140;
    meteor.duration = 0.85 + Math.random() * 0.55;
    meteor.progress = 0;
    meteor.active = true;
  }

  function computeGazePitch(ndcY, hasControl, zoom) {
    if (!skyState || skyState.reducedMotion) return 0;
    var target = 0;
    if (
      hasControl &&
      Number.isFinite(ndcY) &&
      !document.documentElement.classList.contains("revival-modal-open") &&
      !document.documentElement.classList.contains("revival-search-open")
    ) {
      var clampedY = Math.max(-1, Math.min(1, ndcY));
      var zScale = 1 - (typeof zoom === "number" ? zoom : 0) * 0.55;
      target = clampedY > 0 ? clampedY * 42 * zScale : clampedY * 18 * zScale;
    }
    skyState.gazePitch += (target - skyState.gazePitch) * 0.08;
    return skyState.gazePitch;
  }

  function triggerSpacetimePulse(ndcX, ndcY, camera, projector, Vector3, strength) {
    if (!skyState || skyState.reducedMotion) return;
    var px = skyState.pointerWorld.x;
    var pz = skyState.pointerWorld.z;
    if (camera && projector && Vector3 && Number.isFinite(ndcX) && Number.isFinite(ndcY)) {
      if (!scratchRay) scratchRay = new Vector3();
      scratchRay.set(ndcX, ndcY, 1);
      projector.unprojectVector(scratchRay, camera);
      scratchRay.sub(camera.position).normalize();
      if (scratchRay.y < -0.02) {
        var t = Math.max(40, Math.min(1200, (-45 - camera.position.y) / scratchRay.y));
        px = camera.position.x + scratchRay.x * t;
        pz = camera.position.z + scratchRay.z * t;
      } else {
        px = camera.position.x + scratchRay.x * 380;
        pz = camera.position.z + scratchRay.z * 380;
      }
    }
    skyState.pulse.x = px;
    skyState.pulse.z = pz;
    skyState.pulse.age = 0;
    skyState.pulse.strength = typeof strength === "number" ? strength : 0.9;
  }

  function updateConstellations(cameraPos, camera, projector, Vector3, ndcX, ndcY, hasControl, hoveredPost) {
    if (!skyState || !skyState.constellationLines) return;
    var cGeo = skyState.constellationGeo;
    var verts = cGeo.vertices;
    var cols = cGeo.colors;
    var maxSegs = skyState.maxConstellationSegs;
    var segIdx = 0;

    if (
      !skyState.reducedMotion &&
      hasControl &&
      camera &&
      projector &&
      Vector3 &&
      Number.isFinite(ndcX) &&
      Number.isFinite(ndcY) &&
      !document.documentElement.classList.contains("revival-modal-open") &&
      !document.documentElement.classList.contains("revival-search-open")
    ) {
      if (!scratchRay) scratchRay = new Vector3();
      scratchRay.set(ndcX, ndcY, 1);
      projector.unprojectVector(scratchRay, camera);
      scratchRay.sub(camera.position).normalize();

      var rotY = skyState.particles.rotation.y;
      var cosR = Math.cos(-rotY);
      var sinR = Math.sin(-rotY);
      var lx = scratchRay.x * cosR + scratchRay.z * sinR;
      var ly = scratchRay.y;
      var lz = -scratchRay.x * sinR + scratchRay.z * cosR;

      if (ly > -0.18) {
        var dirs = skyState.unitDirs;
        var pos = skyState.starPositions;
        var count = skyState.totalStars;
        var nodes = skyState.constellationNodes;
        nodes.length = 0;
        var minDot = 0.945;

        // Collect nearest bright/mid stars in cursor cone (max 7)
        for (var i = 0; i < count; i += 1) {
          var o = i * 3;
          if (dirs[o + 1] < 0.01) continue;
          var dot = lx * dirs[o] + ly * dirs[o + 1] + lz * dirs[o + 2];
          if (dot > minDot) {
            var weight = (dot - minDot) / (1 - minDot);
            if (nodes.length < 7) {
              nodes.push({ idx: i, dot: dot, weight: weight });
              if (nodes.length === 7) nodes.sort(function (a, b) { return b.dot - a.dot; });
            } else if (dot > nodes[6].dot) {
              nodes[6].idx = i;
              nodes[6].dot = dot;
              nodes[6].weight = weight;
              nodes.sort(function (a, b) { return b.dot - a.dot; });
            }
          }
        }

        // Connect neighboring stars in the cursor constellation
        for (var a = 0; a < nodes.length && segIdx < maxSegs; a += 1) {
          var na = nodes[a];
          var ia = na.idx * 3;
          for (var b = a + 1; b < nodes.length && segIdx < maxSegs; b += 1) {
            var nb = nodes[b];
            var ib = nb.idx * 3;
            var pairDot = dirs[ia] * dirs[ib] + dirs[ia + 1] * dirs[ib + 1] + dirs[ia + 2] * dirs[ib + 2];
            if (pairDot < 0.965) continue;
            var alpha = Math.min(1, Math.min(na.weight, nb.weight) * 1.45) * (0.28 + skyState.warp * 0.25);
            var v0 = verts[segIdx * 2];
            var v1 = verts[segIdx * 2 + 1];
            v0.set(pos[ia], pos[ia + 1], pos[ia + 2]);
            v1.set(pos[ib], pos[ib + 1], pos[ib + 2]);
            cols[segIdx * 2].setRGB(0.55 * alpha, 0.76 * alpha, 1.0 * alpha);
            cols[segIdx * 2 + 1].setRGB(0.75 * alpha, 0.88 * alpha, 1.0 * alpha);
            segIdx += 1;
          }
        }

        // Bridge hovered foreground memory particle (or hovered Memory Beacon) toward the nearest sky star
        var bridgePos = hoveredPost && hoveredPost.position
          ? hoveredPost.position
          : (skyState.hoveredBeaconIdx >= 0 && skyState.beacons[skyState.hoveredBeaconIdx]
            ? skyState.beacons[skyState.hoveredBeaconIdx]
            : null);
        if (bridgePos && nodes.length && segIdx < maxSegs) {
          var bx = bridgePos.x !== undefined ? bridgePos.x : bridgePos.wx;
          var by = bridgePos.y !== undefined ? bridgePos.y : bridgePos.wy;
          var bz = bridgePos.z !== undefined ? bridgePos.z : bridgePos.wz;
          var hdx = bx - cameraPos.x;
          var hdy = by - cameraPos.y;
          var hdz = bz - cameraPos.z;
          var hx = hdx * cosR + hdz * sinR;
          var hz = -hdx * sinR + hdz * cosR;
          var topStar = nodes[0].idx * 3;
          verts[segIdx * 2].set(hx, hdy, hz);
          verts[segIdx * 2 + 1].set(pos[topStar], pos[topStar + 1], pos[topStar + 2]);
          cols[segIdx * 2].setRGB(0.65, 0.82, 1.0);
          cols[segIdx * 2 + 1].setRGB(0.18, 0.30, 0.52);
          segIdx += 1;
        }
      }
    }

    for (var s = segIdx; s < maxSegs; s += 1) {
      verts[s * 2].set(0, 0, 0);
      verts[s * 2 + 1].set(0, 0, 0);
      cols[s * 2].setRGB(0, 0, 0);
      cols[s * 2 + 1].setRGB(0, 0, 0);
    }

    skyState.constellationLines.position.copy(cameraPos);
    skyState.constellationLines.rotation.y = skyState.particles.rotation.y;
    cGeo.verticesNeedUpdate = true;
    cGeo.colorsNeedUpdate = true;
  }

  function updateStarrySky(cameraPos, zoom, particleFields, camera, projector, Vector3, ndcX, ndcY, hasControl, hoveredPost, rgbShiftPass, isDragging) {
    if (!skyState || !cameraPos) return;

    var now = Date.now();
    var dt = Math.min(0.05, Math.max(0.001, (now - skyState.lastTime) / 1000));
    skyState.lastTime = now;

    var fading = particleFields && particleFields[0] && particleFields[0].uniforms
      ? particleFields[0].uniforms.fading.value
      : 1;
    var zoomVal = typeof zoom === "number" ? zoom : 0;

    // Camera velocity & warp computation
    var rawSpeed = 0;
    if (skyState.hasPrevCam) {
      var dcx = cameraPos.x - skyState.prevCamPos.x;
      var dcy = cameraPos.y - skyState.prevCamPos.y;
      var dcz = cameraPos.z - skyState.prevCamPos.z;
      var camSpeed = Math.sqrt(dcx * dcx + dcy * dcy + dcz * dcz) / dt;
      var zoomSpeed = Math.abs(zoomVal - skyState.prevZoom) / dt;
      rawSpeed = Math.min(1, camSpeed / 260 + zoomSpeed * 0.9 + (isDragging ? 0.16 : 0));
    }
    skyState.prevCamPos.copy(cameraPos);
    skyState.prevZoom = zoomVal;
    skyState.hasPrevCam = true;
    skyState.warp += (rawSpeed - skyState.warp) * Math.min(1, dt * 8);

    skyState.skyDome.position.copy(cameraPos);
    skyState.particles.position.copy(cameraPos);
    skyState.ringGroup.position.copy(cameraPos);

    if (!skyState.reducedMotion) {
      skyState.uniforms.uTime.value += dt;
      skyState.driftUniforms.uTime.value = skyState.uniforms.uTime.value;
      skyState.particles.rotation.y += dt * (0.004 + skyState.warp * 0.012);
      skyState.domeUniforms.uRotY.value = skyState.particles.rotation.y;
      skyState.ringGroup.rotation.y = skyState.particles.rotation.y * 1.4;
    }

    skyState.uniforms.uZoom.value = zoomVal;
    skyState.uniforms.uWarp.value = skyState.warp;
    skyState.driftUniforms.uCamPos.value.copy(cameraPos);
    skyState.driftUniforms.uWarp.value = skyState.warp;

    var targetOpacity = typeof fading === "number" ? Math.max(0.55, Math.min(0.88, fading + 0.1)) : 0.84;
    skyState.uniforms.uOpacity.value += (targetOpacity - skyState.uniforms.uOpacity.value) * 0.08;
    skyState.domeUniforms.uOpacity.value = skyState.uniforms.uOpacity.value;
    skyState.driftUniforms.uOpacity.value = skyState.uniforms.uOpacity.value * 0.85;

    // Pulse progression
    if (skyState.pulse.age < 3.5) {
      skyState.pulse.age += dt;
      if (skyState.pulse.age >= 3.5) skyState.pulse.strength = 0;
    }
    var pulseBoost = skyState.pulse.age < 2.2 ? Math.exp(-skyState.pulse.age * 1.6) * 0.065 : 0;

    // Subtle astrolabe ring luminance response
    var ringOpacity = (0.028 + skyState.warp * 0.085 + pulseBoost) * Math.min(1, fading + 0.15);
    for (var ri = 0; ri < skyState.celestialRings.length; ri += 1) {
      skyState.celestialRings[ri].mat.opacity = ringOpacity * (1 - ri * 0.18);
    }

    // Relativistic RGB chromatic shift on fast travel/zoom (kept subtle when zoomed in)
    if (rgbShiftPass && rgbShiftPass.uniforms && rgbShiftPass.uniforms.amount) {
      rgbShiftPass.uniforms.amount.value = 0.00028 * (1 - zoomVal * 0.45) + skyState.warp * 0.00055;
    }

    // Pointer-to-terrain gravitational field uniform
    var pTargetStrength = 0;
    if (
      !skyState.reducedMotion &&
      hasControl &&
      camera &&
      projector &&
      Vector3 &&
      Number.isFinite(ndcX) &&
      Number.isFinite(ndcY) &&
      !document.documentElement.classList.contains("revival-modal-open") &&
      !document.documentElement.classList.contains("revival-search-open")
    ) {
      if (!scratchRay) scratchRay = new Vector3();
      scratchRay.set(ndcX, ndcY, 1);
      projector.unprojectVector(scratchRay, camera);
      scratchRay.sub(camera.position).normalize();
      if (scratchRay.y < -0.02) {
        var tHit = Math.max(40, Math.min(1400, (-45 - camera.position.y) / scratchRay.y));
        var wx = camera.position.x + scratchRay.x * tHit;
        var wz = camera.position.z + scratchRay.z * tHit;
        if (skyState.pointerWorld.strength < 0.02) {
          skyState.pointerWorld.x = wx;
          skyState.pointerWorld.z = wz;
        } else {
          skyState.pointerWorld.x += (wx - skyState.pointerWorld.x) * 0.25;
          skyState.pointerWorld.z += (wz - skyState.pointerWorld.z) * 0.25;
        }
        pTargetStrength = 1;
      }
    }
    skyState.pointerWorld.strength += (pTargetStrength - skyState.pointerWorld.strength) * 0.16;

    if (particleFields && particleFields.length) {
      for (var pf = 0; pf < particleFields.length; pf += 1) {
        var uMap = particleFields[pf] && particleFields[pf].uniforms;
        if (!uMap) continue;
        if (uMap.uPointerWorld) {
          uMap.uPointerWorld.value.set(
            skyState.pointerWorld.x,
            skyState.pointerWorld.z,
            skyState.pointerWorld.strength
          );
        }
        if (uMap.uPulse) {
          uMap.uPulse.value.set(
            skyState.pulse.x,
            skyState.pulse.z,
            skyState.pulse.age,
            skyState.pulse.strength
          );
        }
      }
    }

    syncMemoryBeacons(zoomVal, fading);

    updateConstellations(cameraPos, camera, projector, Vector3, ndcX, ndcY, hasControl, hoveredPost);

    for (var i = 0; i < skyState.meteors.length; i += 1) {
      var meteor = skyState.meteors[i];
      if (!meteor.active) {
        meteor.cooldown -= dt;
        if (meteor.cooldown <= 0) {
          spawnMeteor(meteor, cameraPos);
        }
        continue;
      }

      meteor.progress += dt / meteor.duration;
      if (meteor.progress >= 1) {
        meteor.active = false;
        meteor.mat.opacity = 0;
        meteor.cooldown = 4.5 + Math.random() * 7.5;
        continue;
      }

      var travel = meteor.progress * 720;
      var tailDist = Math.max(0, travel - meteor.length * Math.sin(meteor.progress * Math.PI));
      var head = meteor.geo.vertices[0];
      var tail = meteor.geo.vertices[1];
      head.set(
        meteor.start.x + meteor.dir.x * travel,
        meteor.start.y + meteor.dir.y * travel,
        meteor.start.z + meteor.dir.z * travel
      );
      tail.set(
        meteor.start.x + meteor.dir.x * tailDist,
        meteor.start.y + meteor.dir.y * tailDist,
        meteor.start.z + meteor.dir.z * tailDist
      );
      meteor.geo.verticesNeedUpdate = true;
      meteor.mat.opacity = Math.sin(meteor.progress * Math.PI) * 0.85;
    }
  }

  function availableMemoryPosts() {
    var runtime = window.__REVIVAL_REQUIREJS__ || window.requirejs;
    var postCtrl = runtime && runtime._defined && runtime._defined.postController;
    if (!postCtrl || !postCtrl.tagNamedPosts || !postCtrl.tagNamedPosts[""]) return [];
    var posts = postCtrl.tagNamedPosts[""];
    return window.__REVIVAL_UNIQUE_MAP_POSTS__ ? window.__REVIVAL_UNIQUE_MAP_POSTS__(posts) : posts;
  }

  function computeBeaconCoords(w, E, T) {
    var M = w * 10;
    var _ = E * 10;
    var wx = M + (T(M * 0.3, _ * 0.3) - 0.5) * 8;
    var wz = _ + (T(M * 0.4, _ * 0.4) - 0.5) * 8;
    var r1 = 1 - Math.abs(T(M * 0.0014 + 4, _ * 0.0014 + 4));
    var r2 = 1 - Math.abs(T(M * 0.0032 + 17.3, _ * 0.0032 + 17.3));
    var wy = -115 + r1 * r1 * 125 + r2 * r2 * 45 + T(M * 200 + 12, _ * 200 + 12) * 10;
    return { wx: wx, wy: wy, wz: wz };
  }

  function syncMemoryBeacons(zoomVal, fading) {
    if (!skyState || !skyState.memoryBeacons) return;

    var searchHidden = window.__REVIVAL_MEMORY_SEARCH_VISIBLE__ && window.__REVIVAL_MEMORY_SEARCH_VISIBLE__();
    var zoomFade = zoomVal <= 0.68 ? 1 : zoomVal >= 0.86 ? 0 : 1 - (zoomVal - 0.68) / 0.18;
    var fadeFactor = typeof fading === "number" ? Math.max(0, Math.min(1, fading)) : 1;
    skyState.beaconUniforms.uTime.value = skyState.uniforms.uTime.value;
    skyState.beaconUniforms.uOpacity.value = searchHidden ? 0 : zoomFade * fadeFactor;

    var runtime = window.__REVIVAL_REQUIREJS__ || window.requirejs;
    var noiseUtils = runtime && runtime._defined && runtime._defined["utils/noiseUtils"];
    var T = noiseUtils && noiseUtils.snoise2D;
    if (!T) return;

    var posts = availableMemoryPosts();
    var mapIndex = window.__REVIVAL_ACTIVE_MAP__;
    var changed = false;

    // 1. Sync any coordinates already claimed by navPostParticles
    if (mapIndex && mapIndex.entries) {
      var claimed = mapIndex.entries();
      for (var ci = 0; ci < claimed.length && skyState.beacons.length < skyState.maxBeacons; ci += 1) {
        var entry = claimed[ci];
        var cid = String(entry.post.public_id || entry.post.publicId || entry.post.uid || entry.post.id);
        if (skyState.beaconById[cid]) continue;
        var pos = computeBeaconCoords(entry.w, entry.E, T);
        var beacon = { id: cid, post: entry.post, w: entry.w, E: entry.E, wx: pos.wx, wy: pos.wy, wz: pos.wz };
        skyState.beaconById[cid] = beacon;
        skyState.occupiedCells[entry.w + ":" + entry.E] = true;
        skyState.beacons.push(beacon);
        changed = true;
      }
    }

    // 2. Assign 1 unique spaced N > 0.75 cell per unplaced real memory
    if (posts.length !== skyState.lastBeaconSyncCount) {
      skyState.lastBeaconSyncCount = posts.length;
      var w = 0, E = 0, S = 0, z = 0.5;
      var spiralIdx = 0;
      var maxSpiral = 12000;

      for (var pi = 0; pi < posts.length && skyState.beacons.length < skyState.maxBeacons; pi += 1) {
        var post = posts[pi];
        var pid = String(post.public_id || post.publicId || post.uid || post.id);
        if (skyState.beaconById[pid]) continue;

        while (spiralIdx < maxSpiral) {
          if (spiralIdx === 0) S++;
          else {
            var O = (2 * S - 1) * (2 * S - 1);
            if (spiralIdx === O) E--;
            else {
              var U = (spiralIdx - O) * z | 0;
              if (U === 0) w++;
              else if (U === 1) E++;
              else if (U === 2) w--;
              else if (U === 3) {
                E--;
                if ((spiralIdx - O + 1) * z === 4) {
                  S++;
                  if (S >= 52) break;
                  z = 0.5 / S;
                }
              }
            }
          }
          spiralIdx++;

          var key = w + ":" + E;
          if (skyState.occupiedCells[key]) continue;
          var M = w * 10;
          var _ = E * 10;
          var A = T(M * 0.1, _ * 0.1);
          var N = (A + T(M * 0.005, _ * 0.005)) * 0.5;
          N = 1 - (Math.cos(N * Math.PI) + 1) * 0.5 - A - T(M * 0.03, _ * 0.03);
          N -= T(M * 0.003 + 2.1, _ * 0.003 + 2.1) * 1.5 + T(M * 0.3 + 1.1, _ * 0.3 + 1.1) + T(M * 0.001 + 1.1, _ * 0.001 + 1.1);
          N *= 0.5;
          if (N <= 0.75) continue;

          // Keep >= 42 world units between memory beacons so each blinking light point stands distinctly on its own
          var candPos = computeBeaconCoords(w, E, T);
          var spaced = true;
          for (var ei = 0; ei < skyState.beacons.length; ei += 1) {
            var eb = skyState.beacons[ei];
            var dx = candPos.wx - eb.wx;
            var dz = candPos.wz - eb.wz;
            if (dx * dx + dz * dz < 42 * 42) {
              spaced = false;
              break;
            }
          }
          if (!spaced) continue;

          if (!mapIndex || mapIndex.claim(w, E, post)) {
            var newBeacon = { id: pid, post: post, w: w, E: E, wx: candPos.wx, wy: candPos.wy, wz: candPos.wz };
            skyState.beaconById[pid] = newBeacon;
            skyState.occupiedCells[key] = true;
            skyState.beacons.push(newBeacon);
            changed = true;
            break;
          }
        }
      }
    }

    if (changed) {
      var verts = skyState.beaconGeo.vertices;
      for (var bi = 0; bi < skyState.maxBeacons; bi += 1) {
        if (bi < skyState.beacons.length) {
          var b = skyState.beacons[bi];
          verts[bi].set(b.wx, b.wy, b.wz);
          skyState.beaconActive[bi] = 1.0;
        } else {
          verts[bi].set(0, -99999, 0);
          skyState.beaconActive[bi] = 0.0;
        }
      }
      skyState.beaconGeo.verticesNeedUpdate = true;
      skyState.beaconMat.attributes.aActive.needsUpdate = true;
    }
  }

  function setHoveredBeaconIdx(idx) {
    if (!skyState || skyState.hoveredBeaconIdx === idx) return;
    if (skyState.hoveredBeaconIdx >= 0 && skyState.hoveredBeaconIdx < skyState.maxBeacons) {
      skyState.beaconHover[skyState.hoveredBeaconIdx] = 0.0;
    }
    skyState.hoveredBeaconIdx = idx;
    if (idx >= 0 && idx < skyState.maxBeacons) {
      skyState.beaconHover[idx] = 1.0;
    }
    skyState.beaconMat.attributes.aHover.needsUpdate = true;
  }

  function pickMemoryBeacon(ndcX, ndcY, camera, projector, Vector3, zoomVal, openMemory) {
    if (!skyState || !skyState.beacons.length) {
      setHoveredBeaconIdx(-1);
      return null;
    }
    if (!camera || !projector || !Vector3) return null;
    if (!Number.isFinite(ndcX) || !Number.isFinite(ndcY)) return null;
    if (typeof zoomVal === "number" && zoomVal >= 0.85) {
      setHoveredBeaconIdx(-1);
      return null;
    }
    if (window.__REVIVAL_MEMORY_SEARCH_VISIBLE__ && window.__REVIVAL_MEMORY_SEARCH_VISIBLE__()) {
      setHoveredBeaconIdx(-1);
      return null;
    }
    if (openMemory && Date.now() - (window.__REVIVAL_LAST_MEMORY_CLOSE__ || 0) < 450) return null;
    var post2d = document.querySelector(".post-2d");
    if (post2d && window.getComputedStyle && window.getComputedStyle(post2d).display !== "none") return null;
    if (document.documentElement.classList.contains("revival-modal-open") || document.documentElement.classList.contains("revival-search-open")) return null;

    if (!scratchRay) scratchRay = new Vector3();
    scratchRay.set(ndcX, ndcY, 1);
    projector.unprojectVector(scratchRay, camera);
    scratchRay.sub(camera.position).normalize();

    var rx = scratchRay.x;
    var ry = scratchRay.y;
    var rz = scratchRay.z;
    var bestIdx = -1;
    var bestCos = 0.9982;

    for (var i = 0; i < skyState.beacons.length; i += 1) {
      var b = skyState.beacons[i];
      var px = b.wx - camera.position.x;
      var py = b.wy - camera.position.y;
      var pz = b.wz - camera.position.z;
      var pLen = Math.sqrt(px * px + py * py + pz * pz);
      if (pLen < 1) continue;
      var pCos = (px * rx + py * ry + pz * rz) / pLen;
      if (pCos > bestCos) {
        bestCos = pCos;
        bestIdx = i;
      }
    }

    if (!openMemory) {
      setHoveredBeaconIdx(bestIdx);
    }

    var hitPost = bestIdx >= 0 ? skyState.beacons[bestIdx].post : null;
    if (hitPost && openMemory) {
      var rt = window.__REVIVAL_REQUIREJS__ || window.requirejs;
      var ui = rt && rt._defined && rt._defined.uiController;
      if (ui && ui.preShowPost2d && ui.showPost2d) {
        ui.preShowPost2d(hitPost);
        ui.showPost2d(hitPost);
      }
    }
    return hitPost;
  }

  function hoverMemoryBeacon(ndcX, ndcY, camera, projector, Vector3, zoomVal) {
    var now = Date.now();
    if (
      now - hoverCache.time < 40 &&
      Math.abs(ndcX - hoverCache.x) < 0.003 &&
      Math.abs(ndcY - hoverCache.y) < 0.003
    ) {
      return hoverCache.hit;
    }
    hoverCache.x = ndcX;
    hoverCache.y = ndcY;
    hoverCache.time = now;
    hoverCache.hit = Boolean(pickMemoryBeacon(ndcX, ndcY, camera, projector, Vector3, zoomVal, false));
    return hoverCache.hit;
  }

  window.__REVIVAL_INIT_STARRY_SKY__ = initStarrySky;
  window.__REVIVAL_UPDATE_STARRY_SKY__ = updateStarrySky;
  window.__REVIVAL_PICK_MEMORY_BEACON__ = pickMemoryBeacon;
  window.__REVIVAL_HOVER_MEMORY_BEACON__ = hoverMemoryBeacon;
  window.__REVIVAL_TRIGGER_PULSE__ = triggerSpacetimePulse;
  window.__REVIVAL_GAZE_PITCH__ = computeGazePitch;
})();
