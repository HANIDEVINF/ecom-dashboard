/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "c3ecac64267c4e253031046da3baa69d"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "12a71eedf81a8862e2d6e2e58201488d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "12a71eedf81a8862e2d6e2e58201488d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "43e530dba909fc983884196ba2faf5ca"
  }, {
    "url": "index.html",
    "revision": "52bbf73eec4cd525f140c4844b4ab732"
  }, {
    "url": "icon.svg",
    "revision": "bf50bbad47208a00487bfe3b672fa916"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b4fb4b919ee30aec7b16f185ed5351ab"
  }, {
    "url": "assets/index-DqiOgHrO.js",
    "revision": null
  }, {
    "url": "assets/index-DWHs3OAk.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b4fb4b919ee30aec7b16f185ed5351ab"
  }, {
    "url": "icon.svg",
    "revision": "bf50bbad47208a00487bfe3b672fa916"
  }, {
    "url": "pwa-192x192.png",
    "revision": "43e530dba909fc983884196ba2faf5ca"
  }, {
    "url": "pwa-512x512.png",
    "revision": "12a71eedf81a8862e2d6e2e58201488d"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "12a71eedf81a8862e2d6e2e58201488d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "5bb5906e102b31fe5c949a5878e9b927"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
