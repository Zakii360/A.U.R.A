const CACHE = "aura-v2";

const STATIC = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener(
  "install",
  event => {

    event.waitUntil(
      caches
        .open(CACHE)
        .then(cache =>
          cache.addAll(STATIC)
        )
    );

    self.skipWaiting();
  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(
      caches
        .keys()
        .then(keys =>
          Promise.all(
            keys
              .filter(
                key =>
                  key !== CACHE
              )
              .map(
                key =>
                  caches.delete(key)
              )
          )
        )
    );

    self.clients.claim();
  }
);


self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;

    /*
     * Never cache API/Supabase requests.
     */
    if(
      request.method !== "GET" ||
      request.url.includes(
        ".supabase.co"
      )
    ){

      return;
    }


    event.respondWith(

      caches.match(
        request
      ).then(
        cached => {

          if(cached){
            return cached;
          }


          return fetch(
            request
          ).then(
            response => {

              if(
                !response ||
                response.status !== 200
              ){

                return response;
              }


              const copy =
                response.clone();


              caches.open(
                CACHE
              ).then(
                cache =>
                  cache.put(
                    request,
                    copy
                  )
              );


              return response;
            }
          );

        }
      )

    );
  }
);
