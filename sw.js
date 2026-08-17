const CACHE_NAME = "aura-static-v3";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];


self.addEventListener(
  "install",
  event => {

    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache =>
          cache.addAll(STATIC_FILES)
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
                  key !== CACHE_NAME
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

    if(
      request.method !== "GET"
    ){
      return;
    }


    /*
     * Never cache Supabase,
     * OpenRouter, auth, or function
     * requests.
     */
    if(
      request.url.includes(
        ".supabase.co"
      ) ||
      request.url.includes(
        "openrouter.ai"
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
                response.status !== 200 ||
                response.type ===
                  "opaque"
              ){
                return response;
              }


              const copy =
                response.clone();


              caches.open(
                CACHE_NAME
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
