require.config({
  baseUrl: ".."
});

require(["tests/connection-test",
         "tests/model-test"
         ],
  function(){
    jasmine.runTests();
  });
