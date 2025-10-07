export interface AuthorizableUser<Roles = string, Id = string, Phone = string> {
  id: Id;
  phone: Phone;
  roles: Array<Roles>;
}
