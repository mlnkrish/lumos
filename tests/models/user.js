define(["Lumos"],function(Lumos){
  
  var User = function(user) {
    var self = this;

    self.name = user.name;
    self.email = user.email;
    self.company = user.company_id;
    
  }

  User.store = "users";
  User.fields = {"name":{},"email":{}, "company":{}};
  Lumos.extend(User);

  return User;
})


