define(["lumos", "tests/models/user"],function(lumos, user){
  
  xdescribe("establishing connection to indexedDb", function() {
    
    beforeEach(function(done) {
      lumos.connect("mydb",[], done, done);
    });

    it("should open connection to the specified database", function(done) {
      // lumos.connect("mydb",[], done, done);
      done();
    }); 

    afterEach(function() {
      lumos.destroy();
    });


  });

})
