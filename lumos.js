(function (){
  var lumos;

  var _ret = function(){
    var self = this;
    self.fns = []

    self.then = function(fn){
      fn.then = true;
      self.fns.push(fn);
      return self;
    }

    self.catch = function(fn){
      fn.catch = true;
      self.fns.push(fn);
      return self;  
    }
  }

  var P = function(fnc){
    var ret = new _ret();
    
    var res = function(){
      if(ret.fns.length != 0) {
        var fn = ret.fns.shift();
        try {
          if(fn.then){
            var result = fn.apply(this,arguments);
            if(!!result) {
              if(result.constructor === _ret){
                result.fns = ret.fns;
              }
              else {
                res(result);
              }
            }   
          }else{
            res.apply(this,arguments);
          }
        }catch(err){
          rej(err);
        }
      }
    }

    var rej = function(){
      if(ret.fns.length != 0) {
        var fn = ret.fns.shift();
        try {
          if(fn.catch){
            var result = fn.apply(this,arguments);
            if(!!result) {
              if(result.constructor === _ret){
                result.fns = ret.fns;
              }
              else {
                res(result);
              }
            }  
          }else{
            rej.apply(this,arguments);
          }  
        } catch(err){
          rej(err);
        }
      } else {
        throw arguments;
      }
    }

    try {
      fnc(res,rej);
    } catch(err){
      setTimeout(function(){rej(err);},0);
    }

    return ret; 
  }

  var _lumos = function(){
    var self = this;
    var db;
    
    //the datatbase to open and the array of migrations to run on that database.
    self.connect = function(databaseName, migrations){

      return P(function(resolve,reject){
        var request = indexedDB.open(databaseName,migrations.length);

        request.onupgradeneeded = function(event) {
          db = request.result;
          var newVersion = migrations.length;
          console.log("migrating "+db.name+" from "+event.oldVersion+" to "+newVersion);
          for(var i=event.oldVersion ; i<newVersion; i++) {
            migrations[i](db);
          }
        };

        request.onsuccess = function() {
          db = request.result;
          resolve(db);
        };

        request.onerror = function(e) {
          console.log("Encountered error: " + e.target.error.name);
          reject();
        };


      });
      
    }

    self.close = function(){
      return P(function(resolve,reject){
        if(!!db) {
          db.close();
          db = null;
          setTimeout(resolve,0);
        } else {
          setTimeout(resolve,0);
        }
      });
    }

    self.db = function(){
      return db;
    }

    self.inTransaction = function(entities, unitOfWork) {
      var self = this;
      return P(function(resolve,reject){
        var newEntities = [];
        var storeNames = [];
        
        for(i=0; i<entities.length; i++) {
          var e = entities[i];
          storeNames.push(e.store);
        }

        var tx = db.transaction(storeNames, "readwrite");

        for(i=0; i<entities.length; i++) {
          //cloning entity definition
          eval("var newE = " +  entities[i].toString());
          newE.tx = tx;
          newE.store = entities[i].store;
          newE.fields = entities[i].fields;
          lumos.extend(newE);

          newEntities.push(newE)
        }
        
        unitOfWork.apply(self,newEntities);

        tx.oncomplete = function() {
          resolve();
        }

        tx.onerror = function(e) {
          console.log("Encountered error: " + e.target.error.name);
          reject();
        }

        tx.onabort = function(e) {
          console.log("Transaction aborted");
          reject();
        }
      });

    }

    self.destroy = function(){
      return P(function(resolve,reject){
        if(!!db) {
          db.close();
          var deleteRequest = indexedDB.deleteDatabase(db.name);
          deleteRequest.onsuccess = function() {
            resolve();
          }
          deleteRequest.onerror = function(e) {
            console.log("Encountered error: " + e.target.error.name);
            reject();
          }  
          db=null;
        } else {
          console.log("No database to destroy!");
          reject();
        }
      });
      
    }

    var classMethods = {
      find : function(id) {
        var clazz = this;
        return P(function(resolve,reject){
          var hasRunningTransaction = (!!clazz.tx);

          //pick transaction
          var tx;
          if(hasRunningTransaction) {
            tx=clazz.tx;
          }
          else {
            tx = db.transaction(clazz.store, "readonly");
          }

          var store = tx.objectStore(clazz.store); 
          var req = store.get(id); 
          
          req.onsuccess = function(){
            if(!!req.result)
              resolve(new clazz(req.result));
            else
              resolve(null);
          } 
          req.onerror = function(e){
            console.log("Encountered error: " + e.target.error.name);
            reject();
          }  
        });
      }
    }

    var objectMethods = {
      save: function() {
        var clazz = this.constructor;
        var self = this;
        return P(function(resolve,reject){
          var toSave = {};
          var hasRunningTransaction = (!!clazz.tx);
          
          //pick transaction
          var tx;
          if(hasRunningTransaction){
            tx=clazz.tx
          }
          else {
            tx = db.transaction(clazz.store, "readwrite");
          }

          //pick fields and save
          for(var field in clazz.fields){
            toSave[field] = self[field];
          }
          var store = tx.objectStore(clazz.store);
          var req = store.put(toSave);

          //hook callbacks
          if(hasRunningTransaction) {
            req.onsuccess = function(){
              resolve();
            } 

            req.onerror = function(e){
              console.log("Encountered error: " + e.target.error.name);
              reject();
            }  
          } else {
           tx.oncomplete = function() {
             resolve();
           }
           tx.onerror = function(e) {
             console.log("Encountered error: " + e.target.error.name);
             reject();
           } 
          }
        });
      }
    }

    self.extend = function(entity) {
      // fields = entity.fields;
      // for(var field in fields) {
      //   entity["findBy"+ field] = function (){
      //   };
      // }

      for(var key in classMethods){
        Object.defineProperty(entity, key, {value: classMethods[key]})
      }

      for(var key in objectMethods){
        Object.defineProperty(entity.prototype, key, {value: objectMethods[key]})
      }
    }

    self.P = P;
  }
  
  lumos = new _lumos();

  if (typeof define === 'function' && define.amd) {
    define('Lumos', [], function() {
      return lumos;
    });
  }
}).call(this)