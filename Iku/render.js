"use strict";
console.log("render.js loaded...");

// Try importing if we are in node. (used for development only)
try {
	const {
		uuid,
		__warn,
		Primitive,
		Sprite,
		Text,
		TiledBackground,
		Tilemap,
	} = require("./game");
} catch {}

/*
Render objects and methods.
*/

class Layer {
	/**
	 * A layer. Contains objects that render and run in its own loop.
	 * @param {string} name - The name to identify the layer by.
	 */
	constructor(name) {
		this.name = name;
		this.id = uuid();

		this.primitives = [];
	}

	/**
	 * The function called every frame on this layer.
	 */
	__loop() {
		for (let primitive of this.primitives) {
			primitive.__loop();
		}
	}

	/**
	 * Adds a primitive to the stack.
	 * @param {Primitive|Sprite|Text|TiledBackground|Tilemap} primitive - The primitive to assign to this layer.
	 */
	addPrimitive(primitive) {
		this.primitives.push(primitive);
	}

	/**
	 * Remove a primitive from the stack. Does not delete the primitive.
	 * @param {number} id - The id of the primitive to remove.
	 */
	removePrimitive(id) {
		const primitive = this.primitives.find(
			(searchedPrimitive) => searchedPrimitive.id === id
		);

		if (primitive) {
			this.primitives.splice(this.primitives.indexOf(primitive), 1);
		} else {
			__warn(`Primitive with ID "${id}" not found.`);
		}
	}

	/**
	 * Get a primitive from this layer's stack.
	 * @param {number} id - The id of the primitive you are trying to access.
	 * @returns {Primitive} - The primitive to return.
	 */
	getPrimitive(id) {
		const primitive = this.primitives.find(
			(searchedPrimitive) => searchedPrimitive.id === id
		);

		if (primitive) {
			return primitive;
		} else {
			__warn(`Primitive with ID "${id}" not found.`);
		}
	}
}

class Renderer {
	constructor() {
		// Context and canvas gen.
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		document.body.appendChild(this.canvas);

		// Styling gen.
		this.canvas.style = `
			position: absolute;
			top: 0;
			left: 0;

            width: 100vw;
            height: 100vh;

            z-index: 999;

            background: none;
		`;

		// Layer control.
		this.layers = [];

		// Resize setup.
		window.addEventListener("resize", this.__resizeCanvas.bind(this));
		this.__resizeCanvas();

		// First render call.
		requestAnimationFrame(this.__render.bind(this));
	}

	// Layer Functions

	/**
	 * Creates a new render layer.
	 * @param {string} name - The name of the layer.
	 * @param {function} loopFunction - The rendering function to call every frame for this layer.
	 * @param {number} layering - Where on the stack to put this layer. 1 being first, -1 being last.
	 *
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
	 *
	 */
	createLayer(name, layering = 1) {
		const layer = new Layer(name);

		if (layering === 1) {
			this.layers.push(layer);
		} else if (layering === 0) {
			this.layers.unshift(layer);
		} else {
			throw new Error(`Layering (${layering}) is invalid.`);
		}

		return layer;
	}

	/**
	 * Removes a layer from the stack via its ID.
	 * @param {number} id - The ID of the layer to remove.
	 * @returns {object} layer - The deleted layer.
	 */
	removeLayer(id) {
		const layer = this.layers.find(
			(searchedLayer) => searchedLayer.id === id
		);
		if (layer) {
			rend.layers.splice(rend.layers.indexOf(this));
		} else {
			__warn(`Layer with id "${id}" not found.`);
		}

		return layer;
	}

	getLayer(id) {
		const layer = this.layers.find(
			(searchedLayer) => searchedLayer.id === id
		);

		if (layer) {
			return layer;
		} else {
			__warn(`Layer with id "${id}" not found.`);
		}
	}

	// Render Functions

	/**
	 * Resizes the screen to match your settings. Called automatically.
	 */
	__resizeCanvas() {
		this.canvas.width =
			this.canvas.clientWidth *
			(window.devicePixelRatio ? window.devicePixelRatio : 1);
		this.canvas.height =
			this.canvas.clientHeight *
			(window.devicePixelRatio ? window.devicePixelRatio : 1);
	}

	/**
	 * Clears the screen entirely. Should be called at the start of every frame.
	 */
	clearScreen() {
		this.ctx.beginPath();

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.closePath();
	}

	/**
	 * The main render loop. Called every animation frame, runs code for all layers and should not be overwritten.
	 */
	__render() {
		this.clearScreen();

		for (let layer of this.layers) {
			layer.__loop();
		}

		requestAnimationFrame(this.__render.bind(this));
	}
}

const rend = new Renderer();
const ctx = rend.ctx;

// Try exporting if we are in node. (used for development only)
try {
	module.exports = { rend, ctx, Layer };
} catch {}
