


test('Everyplay instance', function(){
  var instance = everyplay.initialize({
      client_id:"1"
    , redirect_uri: "http://localhost:4501"
  });
  assert(instance != null);
});

test('everyplay.get simple GET', function(next){
  var instance = everyplay.initialize({
      client_id:"1"
    , redirect_uri: "http://localhost:4501"
  });
  instance.accessToken(null);
  instance.get("/videos/1023", function(err, videos) {
    assert(err == null);
    assert(videos != null);
    next();
  });
});


