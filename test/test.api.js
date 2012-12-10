


test('Everyplay instance', function(){
  var instance = EP.initialize({
      client_id:"1"
    , redirect_uri: "http://localhost:4501"
  });
  assert(instance != null);
});

test('everyplay.get simple GET', function(next){
  var instance = EP.initialize({
      client_id:"1"
    , redirect_uri: "http://localhost:4501"
    , site:'http://api.everyplay.com'
  });
  instance.accessToken(null);
  instance.get("/videos/1133", function(err, videos) {
    assert(err == null);
    assert(videos != null);
    next();
  });
});


