define(["Lumos", "tests/models/user", "tests/models/company"],function(Lumos, User, Company){

  describe("transactions", function() {
    
    beforeEach(function(done) {
      migration1 = function(db) {
        var store1 = db.createObjectStore("users", {autoIncrement: true});
        var store2 = db.createObjectStore("companies", {autoIncrement: true});
      }
      Lumos.connect("app",[migration1]).then(done)
    
    });

    it("should be able save multiple entities in a transaction", function(done) {
      
      Lumos.inTransaction([User,Company], function(txUser,txCompany) {
        var user = new txUser({name:"MLN",email:"mln@gmail.com"});
        var company = new txCompany({name:"FooCorp",location:"Atlantis"});
        company.save().then(function(){
          return user.save();
        }).then(function(){
          console.log("all saved");
        });
      }).then(function(){
        Company.find(1).then(function(c){
          expect(c.name).toBe("FooCorp");
          expect(c.location).toBe("Atlantis");
          done();
        });
      })

    }); 

    it("should rollback a transaction", function(done) {
      
      Lumos.inTransaction([User,Company], function(txUser,txCompany) {
        var user = new txUser({name:"MLN",email:"mln@gmail.com"});
        var company = new txCompany({name:"FooCorp",location:"Atlantis"});
        company.save().then(function(){
          throw "bwahahah!!";            
        })
      }).catch(function() {
        Company.find(1).then(function(c){
          expect(c).toBe(null);
          User.find(1).then(function(u){
            expect(u).toBe(null);
            done();
          })
        });
      });

    }); 

    it("will not rollback on async failures", function(done){
      Lumos.inTransaction([User,Company], function(txUser,txCompany) {
        var user = new txUser({name:"MLN",email:"mln@gmail.com"});
        var company = new txCompany({name:"FooCorp",location:"Atlantis"});
        company.save().then(function(){
          setTimeout(function(){throw "MLN";},1)
        });
      }).then(function(){
        Company.find(1).then(function(c){
          expect(c.name).toBe("FooCorp");
          expect(c.location).toBe("Atlantis");
          done();
        });
      }); 

    })

    afterEach(function(done) {
      Lumos.destroy().then(done)
    });

  });

})
