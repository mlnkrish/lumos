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
        console.log("migrating from "+event.oldVersion+" to "+newVersion);
        for(var i=event.oldVersion ; i<newVersion; i++) {
          migrations[i](db);
        }
      };

      request.onsuccess = function() {
        db = request.result;
        if(!!success) 
          success();
      };

      request.onerror = function() {
        console.log("ERROR!");
        if(!!error) 
          error();
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

    self.destroy = function(){
      if(!!db) {
        self.close();
        indexedDB.deleteDatabase(db.name);
      }
    }

    var classMethods = {
      find : function() {
        console.log("find function" + db);
      }
    }

    var objectMethods = {
      save: function() {
        console.log("save function" + db)
      }
    }

    self.extend = function(model) {
      for(var key in classMethods){
        Object.defineProperty(model, key, {value: classMethods[key]})
      }

      for(var key in objectMethods){
        Object.defineProperty(model.prototype, key, {value: classMethods[key]})
      }
    }
  }
  
  lumos = new _lumos();

  if (typeof define === 'function' && define.amd) {
    define('lumos', [], function() {
      return lumos;
    });
  }
}).call(this)