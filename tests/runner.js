require.config({
  baseUrl: ".."
});

require(["tests/connection-test",
         "tests/model-test",
         "tests/transaction-test",
         "tests/promise-test"
         ],
  function(){
    jasmine.runTests();
  });
