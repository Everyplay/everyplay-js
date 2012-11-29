
test('everyplay.connect with token', function(next) {
  var instance = EP.initialize({
      client_id:"88d6bf2ca69dc1366d71557e01dae536f0853db7"
    , site: "https://api.everyplay.com"
    , base: "https://api.everyplay.com:3000"
    , redirect_uri: "https://developers.everyplay.com/test/"
  });
  instance.accessToken("kissa");
  instance.connect(function(err, token) {
    assert(token == "kissa");
    instance.accessToken(null);
    next();
  });
});

test('everyplay.connect without token', function(next) {
  var instance = EP.initialize({
      client_id:"88d6bf2ca69dc1366d71557e01dae536f0853db7"
    , site: "http://localhost:4501"
    , base: "http://localhost:3000"
    , redirect_uri: "https://developers.everyplay.com/test/"
  });
  instance.accessToken(null);
  instance.connect(function(err, token) {
    console.log("connect returned");
    assert(token != null);
    assert(err == null);
    next();
  });
});