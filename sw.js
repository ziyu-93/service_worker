/**
 * sw.js 
 * 线程状态 -->> 子线程
 * 触发 install 事件，并在 install 事件中指定缓存资源
 * 如果注册成功后，之后再请求资源的时候，就会请求 sw
 */
const cacheStorageKey = 'minimal-pwa-3';

const cacheList = [
    '/',
    "index.html",
    "main.css",
    "index.js",
    "e.png"
]

// 浏览器解析完 sw 文件， service worker 内部触发 install 事件
self.addEventListener('install', (e) => {
    console.log('Cache event!');
    // 将 cacheList 列表中的内容，添加到缓存中
    e.waitUntil(
        caches.open(cacheStorageKey).then((cache) => {
            console.log('Adding to Cache:', cacheList);
            return cache.addAll(cacheList); // 实现缓存
        }).then(() => {
            // 如果浏览器，获取到了 sw 的新版代码，那么会，重新缓存 -----
            // *** 如果缓存了 sw.js 那么修改 sw 后，也不会得到最新的内容
            // *** 所以对sw文件最好配置成cache-control: no-cache或者添加md5。
            console.log('install event open cache' + cacheStorageKey);
            console.log('Skip waiting');
            return self.skipWaiting();
        })
    )
})

// 如果当前浏览器没有激活的service worker或者已经激活的worker被解雇，
// 新的service worker进入active事件
// 同样只执行一次，这个部分
// 作用  -->>  清除本地存在的  cache Storage 将当前需要缓存的，保留
self.addEventListener('activate', (e) => {
    console.log('Activate event');
    console.log('Promise all', Promise, Promise.all);
    // active 事件中通常做一些过期资源释放的工作
    let cacheDeletePromises = caches.keys().then(cacheNames => {
        console.log('cacheNames', cacheNames, cacheNames.map);
        return Promise.all(cacheNames.map(name => {
            if (name && name !== cacheStorageKey) {
                console.log('caches.delete', caches.delete);
                let deletePromise = caches.delete(name);
                console.log('cache delete result:', deletePromise);
                return deletePromise;
            } else {
                return Promise.resolve();
            }
        }))
    })

    console.log('cacheDeletePromises', cacheDeletePromises);
    e.waitUntil(
        Promise.all([cacheDeletePromises])
        .then(() => {
            // 如果浏览器，获取到了 sw 的新版代码，那么会，重新缓存 -----
            console.log('activate event ' + cacheStorageKey);
            console.log('Clients claims');
            return self.clients.claim();
        })
    )
})


// 主线程有 fetch 方式请求资源，那么就可以在 ServiceWorker 代码中触发 fetch 事件
self.addEventListener('fetch', e => {
    console.log('Fetch event' + cacheStorageKey + ':', e.request.url);
    e.respondWith(
        fetch(e.request.url)
        .then((httpRes) => {
            // 请求失败了，直接返回失败结果
            if (httpRes.status !== 200) {
                return caches.match(e.request)
            }

            // 请求成功了，将请求返回，缓存起来
            let responseClone = httpRes.clone();
            caches.open(cacheStorageKey).then((res) => {
                // 将新内容 缓存 cache ..
                return res.put(e.request, responseClone);
            })

            return httpRes
        })
        .catch((err) => {
            console.log(err);
            return caches.match(e.request)
        })
    )
})