"use strict";

console.log("render.js loaded...");

// Try importing if we are in node. (used for development only)
try {
	const {
		Cartesian2,
		math,
		Vector2,
		Angle,
		BoundingBox2D,
	} = require("./math");
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

class __Camera {
	/**
	 * The camera by which all layers and objects are positioned. This is a rendering object and should not be overwritten unless you know what you are doing.
	 *
	 * Do not modify the camera's x or y positioning, instead modify targetX and targetY.
	 * @param {Cartesian2} position - The initial x and y positions of the camera.
	 * @param {boolean} smoothing - Whether or not to smooth camera movement.
	 * @param {number} smoothingAmount - The amount by which to segment movement. Higher numbers mean slower camera. 12 is a decent value.
	 */
	constructor(position, smoothing = true, smoothingAmount = 12) {
		this.x = position.x;
		this.y = position.y;

		this.targetX = this.x;
		this.targetY = this.y;

		this.smoothing = smoothing;
		this.smoothingAmount = smoothingAmount;

		// Camera target data.
		this.lockedTarget = false;
		this.centerScreenOnTarget = true;
	}

	/**
	 * Moves the camera to its position on each frame.
	 */
	__logic() {
		if (this.target) {
			this.targetX = this.centerScreenOnTarget
				? this.target.x - ctx.canvas.width / 2
				: this.target.x;
			this.targetY = this.centerScreenOnTarget
				? this.target.y - ctx.canvas.height / 2
				: this.target.y;
		}

		if (!this.smoothing) {
			// Regular camera movement.
			this.x = this.targetX;
			this.y = this.targetY;
		} else {
			// Smooth camera movement.
			const nextPos = math.cartesian2(
				new Vector2(
					math.angle(
						new Cartesian2(this.targetX, this.targetY),
						new Cartesian2(this.x, this.y)
					),

					math.distance(
						new Cartesian2(this.targetX, this.targetY),
						new Cartesian2(this.x, this.y)
					) / this.smoothingAmount
				)
			);

			this.x += nextPos.x;
			this.y += nextPos.y;
		}
	}

	/**
	 * Picks a permanent target for the camera to follow. Unset with <camera.unsetTarget()>.
	 * @param {Sprite} sprite - Sets the camera's lock-on target.
	 * @param {boolean} centerScreen - Whether or not to target at the top left (false) or center (true) of the camera.
	 */
	setTarget(sprite, centerScreen = true) {
		this.lockedTarget = true;
		this.target = sprite;
		this.centerScreenOnTarget = centerScreen;
	}

	/**
	 * Unsets the camera's target and goes back to manual camera controls.
	 */
	unsetTarget() {
		this.lockedTarget = false;
		this.target = null;
		this.centerScreenOnTarget = false;
	}
}

class Layer {
	/**
	 * A layer. Contains objects that render and run in its own loop.
	 * @param {string} name - The name to identify the layer by.
	 * @param {number} layering - Where on the stack to put this layer. 1 being first, -1 being last.
	 */
	constructor(name, layering = 1, parallax = new Cartesian2(100, 100)) {
		this.name = name;
		this.id = uuid();
		this.primitives = [];

		if (parallax.x < 0) parallax.x = 0;
		else if (parallax.x > 100) parallax.x = 100;
		if (parallax.y < 0) parallax.y = 0;
		else if (parallax.y > 100) parallax.y = 100;
		parallax.x /= 100;
		parallax.y /= 100;
		this.parallax = parallax;

		if (layering === 1) {
			rend.layers.push(this);
		} else if (layering === -1) {
			rend.layers.unshift(this);
		} else {
			throw new Error(`Layering (${layering}) is invalid.`);
		}
	}

	/**
	 * The function called every frame on this layer.
	 */
	__loop() {
		// Run primitives.
		ctx.beginPath();
		ctx.save();
		ctx.translate(-camera.x * this.parallax.x, -camera.y * this.parallax.y);
		for (let primitive of this.primitives) {
			primitive.__loop();
		}
		ctx.restore();
		ctx.closePath();
	}

	/**
	 * Adds a primitive to the stack.
	 * @param {Primitive|Sprite|Text|TiledBackground|Tilemap} primitive - The primitive to assign to this layer.
	 */
	addPrimitive(primitive) {
		this.primitives.push(primitive);
		primitive.layer = this;
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
			throw new Error(`Primitive with ID "${id}" not found.`);
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
			throw new Error(`Primitive with ID "${id}" not found.`);
		}
	}
}

class Renderer {
	constructor() {
		// Context and canvas gen.
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d", {
			alpha: true,
			willReadFrequently: true,
			powerPreference: "high-performance",
		});
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

		// Camera.
		this.camera = new __Camera(new Cartesian2(0, 0));

		// Resize setup.
		window.addEventListener("resize", this.__resizeCanvas.bind(this));
		this.__resizeCanvas();

		// First render call.
		requestAnimationFrame(this.__render.bind(this));
	}

	// General Functions
	/**
	 * Checks whether or not an object is on screen.
	 * @param {Primitive} primitive - The primitive to check. **must be on a layer and have a width/height.**
	 * @returns {boolean} onScreen - Whether or not the bounding box is on-screen.
	 */
	isOnScreen(primitive) {
		if (
			primitive.x == undefined ||
			primitive.y == undefined ||
			primitive.width == undefined ||
			primitive.height == undefined
		)
			throw new Error(
				`Primitive with ID "${
					primitive.id ? primitive.id : "unknown ID"
				}" does not have the necessary positional data. (x, y, width, height)`
			);

		// Get the true on-screen position of the primitive.
		const truePos = {
			x: primitive.x + this.camera.x * primitive.layer.parallax.x,
			y: primitive.y + this.camera.y * primitive.layer.parallax.y,
		};

		if (primitive.e == 0) console.log(primitive.id, truePos);

		if (truePos.x > this.camera.x + this.canvas.width) return false;
		if (truePos.y > this.camera.y + this.canvas.height) return false;
		if (truePos.x + primitive.width < this.camera.x) return false;
		if (truePos.y + primitive.height < this.camera.y) return false;

		return true;
	}

	// Layer Functions

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
			throw new Error(`Layer with id "${id}" not found.`);
		}

		return layer;
	}

	/**
	 * Searches the renderer's layer array for a layer by ID.
	 * @param {string} id - The ID of the layer you are trying to get.
	 * @returns {Layer} layer - The found layer.
	 */
	getLayer(id) {
		const layer = this.layers.find(
			(searchedLayer) => searchedLayer.id === id
		);

		if (layer) {
			return layer;
		} else {
			throw new Error(`Layer with id "${id}" not found.`);
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
		// Logic
		this.camera.__logic();

		// Render
		this.clearScreen();

		for (let layer of this.layers) {
			layer.__loop();
		}

		requestAnimationFrame(this.__render.bind(this));
	}
}

const rend = new Renderer();
const canvas = rend.canvas;
const ctx = rend.ctx;
const camera = rend.camera;

// Try exporting if we are in node. (used for development only)
try {
	module.exports = { rend, canvas, ctx, camera, Layer };
} catch {}
