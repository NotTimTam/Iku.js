"use strict";

try {
	const { rend, ctx, canvas, Layer, camera } = require("../../Iku/render");
	const {
		Sprite,
		keys,
		inp,
		TopDownController,
		Primitive,
		Text,
		Solid,
	} = require("../../Iku/game");
	const { Cartesian2, BoundingBox2D } = require("../../Iku/math");
} catch {}

const layer = new Layer("layer");

class Wall extends Sprite {
	constructor(x, y, color) {
		super(x, y);

		this.width = 32;
		this.height = 32;
		this.c = color;

		new Solid(this, 0, 0, 32, 32);
	}

	render() {
		if (!rend.isOnScreen(this)) return;
		ctx.beginPath();

		ctx.fillStyle = this.c;
		ctx.fillRect(this.x, this.y, this.width, this.height);

		ctx.closePath();
	}
}

let w1 = new Wall(0, 0, "blue");
layer.addPrimitive(w1);

w1.e = 0;

let layer2 = new Layer("layer2", 1, { x: 50, y: 50 });
let w2 = new Wall(0, 0, "red");
layer2.addPrimitive(w2);

w2.logic = function () {
	console.log(
		"\n\n\nblue:",
		rend.isOnScreen(w1),
		"\nred:",
		rend.isOnScreen(this)
	);
};

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

new TopDownController(player, 10, 100, 100); // Give the player a movement controller.
new Solid(player, 0, 0, player.width, player.height);

camera.setTarget(player, true); // Set the player as the camera's target.
