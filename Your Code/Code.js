"use strict";

try {
	const { rend, ctx, canvas, Layer, camera } = require("../Iku/render");
	const {
		Sprite,
		tileBasedController,
		keys,
		inp,
		topDownController,
	} = require("../Iku/game");
} catch {}

const layer = new Layer("hehehe");

class Cube extends Sprite {
	constructor(x, y, color = "tomato", initSpeedChange = 1) {
		super(x, y);

		this.color = color;
		this.speed = initSpeedChange === -1 ? 32 : 0;
		this.size = 64;
		this.speedChange = initSpeedChange;
	}

	input() {
		this.x += this.speed;
		this.speed += this.speedChange;
	}

	logic() {
		if (this.x > ctx.canvas.width - 1 + this.size) {
			this.x = 1 - this.size;
		}
		if (this.x < 1 - this.size) {
			this.x = ctx.canvas.width - 1 + this.size;
		}

		if (this.y > ctx.canvas.height - 1 + this.size) {
			this.y = 1 - this.size;
		}
		if (this.y < 1 - this.size) {
			this.y = ctx.canvas.height - 1 + this.size;
		}

		if (this.speed < 0 || this.speed > 32) {
			this.speedChange *= -1;
		}
	}

	render() {
		ctx.beginPath();

		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.size, this.size);

		ctx.closePath();
	}
}

const player = new Cube(canvas.width / 2, canvas.height / 2, "purple", 0);

player.input = () => {};
new topDownController(player, 10, 100, 100);
camera.setTarget(player, true);
player.logic = function () {};
layer.addPrimitive(player);
