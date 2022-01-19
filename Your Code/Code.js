"use strict";

try {
	const { rend, ctx, canvas } = require("../Iku/render");
	const { Sprite, Text, keys, inp } = require("../Iku/game");
} catch {}

const mainLayer = rend.createLayer("mainLayer");
const secondaryLayer = rend.createLayer("mainLayer", -1);

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

let e = 0;
for (let y = 0; y < canvas.height / 64; y += 1) {
	const tP = new Cube(0, y * 64, "red");

	mainLayer.addPrimitive(tP);

	const tP2 = new Cube(e * (canvas.height / 64) + 32, y * 64, "green", -1);

	secondaryLayer.addPrimitive(tP2);

	e++;
}

const text = new Text(
	0,
	64,
	" ",
	"purple",
	"48px Segoe UI",
	null,
	"bold",
	"left",
	"middle",
	canvas.width
);
addEventListener("keypress", (e) => {
	let letterArray =
		`1234567890-=!@#$%^&*()_+?/>.<,"':;[{]}\\|~\`abcdefghijklmnopqrstuvwxyz `.split(
			""
		);
	for (let letter of letterArray) {
		if (e.key == letter) {
			text.text += letter;
		}
	}
	if (e.key == "Enter") {
		text.text = " ";
	}
});

mainLayer.addPrimitive(text);
