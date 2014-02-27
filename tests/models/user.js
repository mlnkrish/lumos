define(["Lumos"],function(Lumos){
  
  var User = function(user) {
    var self = this;

    self.name = user.name;
    self.email = user.email;



  }

  User.store = "users";
  User.fields = {"name":{},"email":{}};

  Lumos.extend(User);

  return User;
})


