define(["Lumos"],function(Lumos){
  
  var Company = function(company) {
    var self = this;

    self.name = company.name;
    self.location = company.location;
  }

  Company.store = "companies";
  Company.fields = {"name":{},"location":{}};
  Lumos.extend(Company);

  return Company;
})


