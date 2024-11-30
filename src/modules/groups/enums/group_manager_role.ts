export class GroupRole {
  private static _creator = "creator";
  private static _admin = "admin";
  private static _mod = "mod";
  private static _member = "member";

  static get creator(): { value: string; level: number } {
    return {
      value: `${this._creator}`,
      level: this.getLevelFromString(this._creator),
    };
  }
  static get admin(): { value: string; level: number } {
    return {
      value: `${this._admin}`,
      level: this.getLevelFromString(this._admin),
    };
  }
  static get mod(): { value: string; level: number } {
    return { value: `${this._mod}`, level: this.getLevelFromString(this._mod) };
  }
  static get member(): { value: string; level: number } {
    return {
      value: `${this._member}`,
      level: this.getLevelFromString(this._member),
    };
  }

  static getLevelFromString(role: string): number {
    switch (role) {
      case "creator":
        return 3;
      case "admin":
        return 2;
      case "mod":
        return 1;
      default:
        return 0;
    }
  }
}
