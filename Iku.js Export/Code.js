"use strict";

try {
  const { rend, ctx, canvas, Layer, camera } = require("../Iku/render");
  const {
    Sprite,
    keys,
    inp,
    TopDownController,
    Primitive,
    Text,
    Solid,
  } = require("../Iku/game");
  const { Cartesian2, BoundingBox2D } = require("../Iku/math");
} catch {}

const layer = new Layer("layer");

class Wall extends Sprite {
  constructor(x, y) {
    super(x, y);

    this.width = 32;
    this.height = 32;

    new Solid(this, 0, 0, 0, 0);

    layer.addPrimitive(this);
  }

  render() {
    ctx.beginPath();

    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.closePath();
  }
}

new Wall(64, 64);
new Wall(64 + 32, 64);

const player = new Sprite(0, 0);
player.width = 32;
player.height = 64;
layer.addPrimitive(player);
player.render = function () {
  ctx.beginPath();

  ctx.fillStyle = "teal";
  ctx.fillRect(this.x, this.y, this.width, this.height);

  ctx.closePath();
};

new TopDownController(player, 10, 50, 5); // Give the player a movement controller.
new Solid(player, 0, 0, player.width, player.height);

camera.setTarget(player, true); // Set the player as the camera's target.
