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

      request.onerror = function(eve) {
        console.log("ERROR!");
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

    self.destroy = function(success, error){
      if(!!db) {
        self.close();
        deleteRequest = indexedDB.deleteDatabase(db.name);
        deleteRequest.onsuccess = function() {
          if(!!success) success();
        }
        deleteRequest.onerror = function() {
          if(!!error) error();
        }
      } else {
        //TODO: Is this okay
        if(!!success) success();
      }
    }

    var classMethods = {
      find : function(id, complete, error) {
        var clazz = this;
        var tx = db.transaction(clazz.store, "readonly");
        var store = tx.objectStore(clazz.store); 
        var req = store.get(id); 
        req.onsuccess = function(){
          if(!!complete) complete(new clazz(req.result));
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
        var clazz = this.constructor
        for(var field in clazz.fields){
          toSave[field] = this[field];
        }
        var tx = db.transaction(clazz.store, "readwrite");
        var store = tx.objectStore(clazz.store);
        store.put(toSave);
        tx.oncomplete = function() {
          if(!!complete) complete();
        };
        tx.onerror = function() {
          if(!!error) error();
        }
      }
    }

    self.extend = function(model) {
      for(var key in classMethods){
        Object.defineProperty(model, key, {value: classMethods[key]})
      }

      for(var key in objectMethods){
        Object.defineProperty(model.prototype, key, {value: objectMethods[key]})
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