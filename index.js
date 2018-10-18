console.log(fetch('http://localhost/service_worker/sw/index.js'))

// 注册 service worker
// 此文件 -->> 主线程
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js')
        // 注册  --->  parsed 解析阶段
        .then((registration) => {
            window.registration = registration;
            console.log('Registered events at scope:', registration.scope);

            if (registration.waiting) {
                // 进入到这里，就表示已经 cache 完成, 不过没有执行下面的 console.log
                // service worker is waiting
                console.log('installed');
            }

            if (registration.active) {
                // 进入到这里，就表示已经 activate 完成, 进入到 activated 状态 -->>  被激活状态
                // service worker is Active
                console.log('actived');
            }
        })
}


