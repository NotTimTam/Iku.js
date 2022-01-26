"use strict";
console.log("game.js loaded...");

// Only developers who know what they are doing should change this.
const debug = false;

// Try importing if we are in node. (used for development only)
try {
	const {
		Cartesian2,
		Cartesian3,
		Angle,
		Vector2,
		BoundingBox2D,
		BoundingBox3D,
		math,
	} = require("./math");
	const { Layer, ctx } = require("./render");
} catch {}

// Methods

/**
 * Generate a unique ID for objects.
 * @returns a unique uuid (v4)
 */
function uuid() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16)
	);
}

/**
 * @param {...string} [args] - Any strings to log to the console with a warning.
 */
function __warn() {
	console.warn(`[Iku] Warning:`);

	for (let message of arguments) {
		console.warn(message);
	}
}

// Input
class Input {
	constructor() {
		this.mouse = {
			x: 0,
			y: 0,
			down: false,
		};

		this.keys = {};

		// Mouse Events
		window.addEventListener("mousemove", (e) => {
			this.mouse.x = (e.clientX / window.innerWidth) * ctx.canvas.width;
			this.mouse.y = (e.clientY / window.innerHeight) * ctx.canvas.height;
			this.__event(
				`mouse at: ${this.mouse.x.toFixed(2)}, ${this.mouse.y.toFixed(
					2
				)}`
			);
		});
		window.addEventListener("mousedown", (e) => {
			this.mouse.down = true;
			this.__event(`mouse down`);
		});
		window.addEventListener("mouseup", (e) => {
			this.mouse.down = false;
			this.__event(`mouse up`);
		});

		// Key Events
		window.onkeydown = (e) => {
			this.keys[e.key] = true;
		};

		window.onkeyup = (e) => {
			this.keys[e.key] = false;
			this.__event(`"${e.key}" released`);
		};
	}

	__event(evt) {
		if (debug) {
			console.log(`[input] ${evt}`);
		}
	}
}
const inp = new Input();
const mouse = inp.mouse;
const keys = inp.keys;

// Primitives

class Primitive {
	/**
	 * The basic building block of all in-game objects.
	 */
	constructor() {
		this.id = uuid();
	}

	/**
	 * This primitives loop. **MUST BE OVERWRITTEN**
	 *
	 * Render loops should follow this basic three-step method:
	 *
	 * 1. Input
	 *    - Any user input or AI processing.
	 *
	 * 2. Logic
	 *    - Any game logic. (physics, generation, etc)
	 *
	 * 3. Render
	 *
	 *    - Clear the screen.
	 *    - Draw to the screen.
	 */

	/**
	 * Binds and calls the input, logic, and render functions of this primitive. **Under no circumstances should this be overwritten.** Override input(), logic(), and render() instead.
	 */
	__loop() {
		if (this.input) {
			this.input.call(this);
		}

		if (this.logic) {
			this.logic.call(this);
		}

		if (this.render) {
			this.render.call(this);
		}
	}

	// /**
	//  * Sets a new gameloop for this primitive.
	//  * @param {function} newLoop - The loop function to set.
	//  */
	// set loop(newLoop) {
	// 	this.loop = newLoop;
	// }

	// /**
	//  * Returns the loop function associated with this primitive.
	//  * @returns {function}
	//  */
	// get loop() {
	// 	return this.loop;
	// }
}

// Primitive.prototype.loop = function () {};

class Sprite extends Primitive {
	/**
	 * A primitive with behaviours.
	 * @param {number} x - The x-coordinate of the sprite.
	 * @param {number} y - The y-coordinate of the sprite.
	 */
	constructor(x, y) {
		super();

		this.x = x;
		this.y = y;
		this.behaviours = [];
	}

	/**
	 * Binds and calls the input, logic, and render functions of this primitive and all of its behaviours. **Under no circumstances should this be overwritten.** Override input(), logic(), and render() instead.
	 */
	__loop() {
		if (this.input) {
			this.input.call(this);
		}

		if (this.logic) {
			this.logic.call(this);
		}

		if (this.render) {
			this.render.call(this);
		}
	}
}

class Text extends Primitive {
	/**
	 * A primitive that displays text to the screen.
	 * Unlike other primitives, this one should not
	 * have its loop fuctions overwritten.
	 * @param {number} x - The x-coordinate of the text.
	 * @param {number} y - The y-coordinate of the text.
	 * @param {string} text - The text to display to the screen.
	 * @param {string} color - The color of the text. Can be any CSS color type. (name, RGB, HEX, HSL, etc)
	 * @param {string} fontStyle - The font styling of the text. Identical in function to ctx.font.
	 * @param {string} fontVariant - The font variant of the text. Identical in function to the ctx.fontVariant.
	 * @param {string} fontWeight - The font weight of the text. Identical in function to the ctx.fontWeight.
	 * @param {string} textAlign - The horizontal alignment of the text. Identical in function to the ctx.textAlign.
	 * @param {string} textBaseline - The vertical alignment of the text. Identical in function to the ctx.textBaseline.
	 * @param {number} maxWidth - The maximum width of the text in pixels.
	 */
	constructor(
		x,
		y,
		text,
		color = "black",
		fontStyle = "12px bold monospace",
		fontVariant = "normal",
		fontWeight = "300",
		textAlign = "left",
		textBaseline = "middle",
		maxWidth = null
	) {
		super();

		this.x = x;
		this.y = y;
		this.text = text;

		if (!color) color = "black";
		if (!fontStyle) fontStyle = "12px bold monospace";
		if (!fontVariant) fontVariant = "normal";
		if (!fontWeight) fontWeight = "300";
		if (!textAlign) textAlign = "left";
		if (!textBaseline) textBaseline = "middle";

		this.color = color;
		this.fontStyle = fontStyle;
		this.fontVariant = fontVariant;
		this.fontWeight = fontWeight;
		this.textAlign = textAlign;
		this.textBaseline = textBaseline;
		this.maxWidth = maxWidth;
	}

	render() {
		ctx.beginPath();

		ctx.font = this.fontStyle;
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		ctx.fontVariant = this.fontVariant;
		ctx.fontWeight = this.fontWeight;
		ctx.textAlign = this.textAlign;
		ctx.textBaseline = this.textBaseline;

		ctx.fillText(this.text, this.x, this.y, this.maxWidth && this.maxWidth);

		ctx.closePath();
	}

	__loop() {
		if (this.input) {
			this.input.call(this);
		}

		if (this.logic) {
			this.logic.call(this);
		}

		if (this.render) {
			this.render.call(this);
		}
	}
}

class TiledBackground extends Primitive {
	/**
	 * (**unimplemented**)
	 */
	constructor() {
		super();
	}
}

class Tilemap extends Primitive {
	/**
	 * (**unimplemented**)
	 */
	constructor() {
		super();
	}
}

// Try exporting if we are in node. (used for development only)
try {
	module.exports = {
		uuid,
		__warn,
		debug,
		Primitive,
		Sprite,
		Text,
		TiledBackground,
		Tilemap,
		inp,
		keys,
		mouse,
	};
} catch {}
