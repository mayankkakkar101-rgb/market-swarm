export class InputHandler {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
    };
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  attach() {
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  detach() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }

  _setKey(code, pressed) {
    switch (code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.up = pressed;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.down = pressed;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = pressed;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = pressed;
        break;
      case "Space":
        this.keys.attack = pressed;
        break;
    }
  }

  _onKeyDown(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    this._setKey(e.code, true);
  }

  _onKeyUp(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    this._setKey(e.code, false);
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;
    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;
    return { dx, dy };
  }

  consumeAttackPress() {
    if (this.keys.attack) {
      this.keys.attack = false;
      return true;
    }
    return false;
  }
}
