define(["lumos"],function(lumos, user){
  
  describe("establishing connection to indexedDb", function() {
    
    it("should open connection to the specified database and migrations", function(done) {
      migration1 = function(db) {
        var store = db.createObjectStore("books", {keyPath: "isbn"});
      }

      lumos.connect("library",[migration1], function(){
        expect(lumos.db().version).toBe(1)
        done();
      }, done);
    }); 
    
    it("should migrate existing database to new version", function(done) {
      migration1 = function(db) {
        var store = db.createObjectStore("books", {keyPath: "isbn"});
      }
      migration2 = function(db) {
        var store = db.createObjectStore("magzines", {keyPath: "isbn"});
      }
      migration3 = function(db) {
        var store = db.createObjectStore("periodicals", {keyPath: "isbn"});
      }

      lumos.connect("library",[migration1], function(){
        expect(lumos.db().version).toBe(1)
        lumos.close();

          lumos.connect("library",[migration1,migration2,migration3], function(){
            expect(lumos.db().version).toBe(3)
            done();
          }, done);

      }, done);


    }); 

    afterEach(function() {
      lumos.destroy();
    });

  });

})
