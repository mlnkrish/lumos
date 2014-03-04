define(["Lumos", "tests/models/user"],function(Lumos, User){
  
  describe("entity persistance", function() {
    
    beforeEach(function(done) {
      migration1 = function(db) {
        var store = db.createObjectStore("users", {autoIncrement: true});
      }
      Lumos.connect("app",[migration1], done, done);
    
    });

    it("should be able save a new entity", function(done) {
      
      user = new User({name:"MLN",email:"mln@gmail.com"});
      user.save(function(){
       
        User.find(1, function(user){
          expect(user.name).toBe("MLN");
          expect(user.email).toBe("mln@gmail.com");
          done();
        });

      });
     
    }); 

    afterEach(function(done) {
      Lumos.destroy(done,done);
    });


  });

})
