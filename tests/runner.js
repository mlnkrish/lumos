require.config({
  baseUrl: ".."
});

require(["tests/connection-test",
         "tests/model-test",
         "tests/transaction-test"
         ],
  function(){
    jasmine.runTests();
  });
