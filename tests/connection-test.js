define(["Lumos"],function(Lumos, user){
  
  describe("initialization and migrations", function() {
    
    it("should open connection to the specified database and migrations", function(done) {
      migration1 = function(db) {
        var store = db.createObjectStore("books", {keyPath: "isbn"});
      }

      Lumos.connect("app",[migration1]).then(function(){
        expect(Lumos.db().version).toBe(1);
        done();
      });
    }); 

    it("should fail on encountering an error", function(done) {
      migration1 = function(db) {
        throw "bwahahaha!";
      }
      Lumos.connect("app",[migration1]).catch(done);
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

      Lumos.connect("app",[migration1]).then(function(){
        expect(Lumos.db().version).toBe(1);
        return Lumos.close();
      }).then(function(){
        return Lumos.connect("app",[migration1,migration2,migration3]);        
      }).then(function(){
        expect(Lumos.db().version).toBe(3);
        done();
      });

    }); 

    afterEach(function(done) {
      Lumos.destroy().then(done).catch(done);
    });

  });

})
