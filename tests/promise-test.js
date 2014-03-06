define(["Lumos"],function(Lumos){
  
  describe("promises", function() {
    
    it("should execute then block", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(resolve,0)
      }).then(done);
    });

    it("should execute multiple then blocks", function(done){
      Lumos.P(function(resolve,reject){
        setTimeout(resolve,0)
      }).then(function(){
        return Lumos.P(function(resolve,reject){
          setTimeout(resolve,0)
        })
      }).then(done);
    });

    it("should execute then block and pass parameters", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(function(){resolve(1,2);},0)
      }).then(function(a,b){
        expect(a).toBe(1);
        expect(b).toBe(2);
        done();
      });
    });

    it("should execute then block and pass parameters", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(function(){resolve(1,2);},0)
      }).then(function(a,b){
        expect(a).toBe(1);
        expect(b).toBe(2);
        done();
      });
    });

    it("should execute then block and pass parameters even if when returned val is not a promise", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(resolve,0)
      }).then(function(){
        return 100;
      }).then(function(a){
        expect(a).toBe(100);
        return Lumos.P(function(resolve,reject){
          setTimeout(function(){resolve(1,2);},0)
        })
      }).then(function(a,b){
        expect(a).toBe(1);
        expect(b).toBe(2);
        return 19;
      }).then(function(a){
        expect(a).toBe(19);
        done();
      });
    });

    it("should execute then block only if something is bound", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(function(){resolve(1,2);done()},0)
      });
    });

    it("should execute catch block on rejection", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(function(){reject(1001);},0)
      }).catch(function(a){
        expect(a).toBe(1001);
        done();
      });
    });

    it("should skip then blocks and execute catch block", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(reject,0)
      }).then(function(){
        fail();
      }).catch(done);
    });

    it("should skip then blocks and execute catch block and continue executing then blocks", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(reject,0)
      }).then(function(){
        fail();
      }).catch(function(){
        return Lumos.P(function(resolve,reject){
          setTimeout(function(){resolve(100)},0)
        })
      }).catch(function(){
        fail()
      }).then(function(a){
        expect(a).toBe(100);
        done();
      });
    });

    it("should execute catch block on error in the promise definition", function(done) {
      Lumos.P(function(resolve,reject){
        throw "err";
      }).then(function(){
        fail();
      }).catch(function(a){
        expect(a).toBe("err");
        return Lumos.P(function(resolve,reject){
          setTimeout(function(){resolve(100)},0)
        })
      }).then(function(a){
        expect(a).toBe(100);
        done();
      });
    });

    it("should execute catch block on error in the then block exec", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(resolve,0);
      }).then(function(){
        throw "err";
      }).catch(function(a){
        expect(a).toBe("err");
        done();
      });
    });

    it("should execute catch block on error in the then block promise exec", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(resolve,0);
      }).then(function(){
        return Lumos.P(function(resolve,reject){
          throw "err";
        })
      }).then(function(){
        fail();
      }).catch(function(a){
        expect(a).toBe("err");
        done();
      });
    });

    it("should execute susequent catch block on error in the catch block", function(done) {
      Lumos.P(function(resolve,reject){
        setTimeout(resolve,0);
      }).then(function(){
        throw "err";
      }).catch(function(a){
        expect(a).toBe("err");
        throw "another err";
      }).then(function(){
        fail();
      }).catch(function(a){
        expect(a).toBe("another err");
        return Lumos.P(function(resolve,reject){
          throw "super err";
        })
      }).then(function(){
        fail();
      }).catch(function(a){
        expect(a).toBe("super err");
        done();
      });
    });

  });

})
