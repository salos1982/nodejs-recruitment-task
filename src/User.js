class User {
  id;
  role;
  name;

  constructor(id, role, name) {
    this.id = id;
    this.role = role;
    this.name = name;
  }
}

module.exports = User;
