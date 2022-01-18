"use strict";
console.log("game.js loaded...");

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
	const { Layer } = require("./render");
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
	 * Binds and calls the loop() function. **Under no circumstances should this be overwritten.** Override loop() instead.
	 */
	__loop() {
		if (this.loop) {
			this.loop();
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
	constructor() {
		super();
	}
}
class Text extends Primitive {
	constructor() {
		super();
	}
}
class TiledBackground extends Primitive {
	constructor() {
		super();
	}
}
class Tilemap extends Primitive {
	constructor() {
		super();
	}
}

// Try exporting if we are in node. (used for development only)
try {
	module.exports = {
		uuid,
		__warn,
		Primitive,
		Sprite,
		Text,
		TiledBackground,
		Tilemap,
	};
} catch {}
