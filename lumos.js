(function (){
  var lumos;

  var _lumos = function(){
    var self = this;
    var db;
    
    
    //the datatbase to open and the array of migrations to run on that database.
    self.connect = function(databaseName, migrations, success, error){
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
        if(!!success) success();
      };

      request.onerror = function(e) {
        console.log("Encountered error: " + e.target.error.name);
        if(!!error) error();
      };
    }

    self.close = function(){
      if(!!db) {
        db.close();
      }
    }

    self.db = function(){
      return db;
    }

    self.inTransaction = function(entities, unitOfWork, complete, error) {
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
      
      unitOfWork.apply(tx,newEntities);

      tx.oncomplete = function() {
        if(!!complete) complete();
      }

      tx.onerror = function(e) {
        console.log("Encountered error: " + e.target.error.name);
        if(!!error) error();
      }

      tx.onabort = function(e) {
        console.log("Transaction aborted");
        if(!!error) error();
      }

    }

    self.destroy = function(success, error){
      if(!!db) {
        self.close();
        deleteRequest = indexedDB.deleteDatabase(db.name);
        deleteRequest.onsuccess = function() {
          if(!!success) success();
        }
        deleteRequest.onerror = function(e) {
          console.log("Encountered error: " + e.target.error.name);
          if(!!error) error();
        }
      } else {
        console.log("No database to destroy!");
        if(!!error) error();
      }
    }

    var classMethods = {
      find : function(id, complete, error) {
        var clazz = this;
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
          if(!!complete) {
            if(!!req.result)
              complete(new clazz(req.result));
            else
              complete(null);
          }
        } 
        req.onerror = function(e){
          console.log("Encountered error: " + e.target.error.name);
          if(!!error) error();
        }  
        
      }
    }

    var objectMethods = {
      save: function(complete,error) {
        var toSave = {};
        var clazz = this.constructor;
        var hasRunningTransaction = (!!clazz.tx);
        
        //pick transaction
        var tx;
        if(hasRunningTransaction) {
          tx=clazz.tx
        }
        else {
          tx = db.transaction(clazz.store, "readwrite");
        }

        //pick fields and save
        for(var field in clazz.fields){
          toSave[field] = this[field];
        }
        var store = tx.objectStore(clazz.store);
        var req = store.put(toSave);

        //hook callbacks
        if(hasRunningTransaction) {
          req.onsuccess = function(){
            if(!!complete) complete();
          } 
          req.onerror = function(e){
            console.log("Encountered error: " + e.target.error.name);
            if(!!error) error();
          }  
        } else {
         tx.oncomplete = function() {
           if(!!complete) complete();
         }
         tx.onerror = function(e) {
           console.log("Encountered error: " + e.target.error.name);
           if(!!error) error();
         } 
        }
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
  }
  
  lumos = new _lumos();

  if (typeof define === 'function' && define.amd) {
    define('Lumos', [], function() {
      return lumos;
    });
  }
}).call(this)