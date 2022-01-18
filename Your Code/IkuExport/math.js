"use strict";
console.log("math.js loaded...");

/*
Math objects and methods.
*/

// CARTESIAN COORDINATES
/**
 * Represents a 2-dimensional position.
 */
class Cartesian2 {
	/**
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

/**
 * Represents a 3-dimensional position.
 */
class Cartesian3 {
	/**
	 * @param {number} x - The x-coordinate of the object.
	 * @param {number} y - The y-coordinate of the object.
	 * @param {number} z - The z-coordinate of the object.
	 */
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

// ANGLES
/**
 * Represents an angle in degrees.
 */
class Angle {
	/**
	 * @param {number} value - The represented angle in degrees.
	 */
	constructor(value) {
		this.value = value;
	}

	/**
	 * Returns the radian value of this angle.
	 */
	getInRads() {
		return math.rad(this.value);
	}
}

// VECTORS
/**
 * Represents a 2-dimensional vector, with both direction (angle) and magnitude. (velocity) (oh yeah)
 */
class Vector2 {
	/**
	 * @param {Angle} angle - The angle, in degrees of the vector.
	 * @param {number} velocity - The velocity (in arbitrary units) of the vector.
	 */
	constructor(angle, velocity) {
		this.angle;

		if (typeof angle === "object") {
			this.angle = angle.get(false);
		} else {
			this.angle = angle;
		}

		this.velocity = velocity;
	}

	get pos() {
		return math.cartesian2(this);
	}
}

// BOUNDING BOXES
/**
 * Represents a 2-dimensional, axis-aligned bounding box.
 */
class BoundingBox2D {
	/**
	 * @param {Cartesian2} position - The 2D cartesian coordinates of the bounding box.
	 * @param {number} width - The width of the bounding box.
	 * @param {number} height - The height of the bounding box.
	 */
	constructor(position, width, height) {
		this.x = position.x;
		this.y = position.y;
		this.width = width;
		this.height = height;
	}
}

/**
 * Represents a 3-dimensional, axis-aligned bounding box.
 */
class BoundingBox3D {
	/**
	 * @param {Cartesian3} position - The 3D cartesian coordinates of the bounding box.
	 * @param {number} width - The width of the bounding box.
	 * @param {number} height - The height of the bounding box.
	 * @param {number} depth - The depth of the bounding box.
	 */
	constructor(position, width, height, depth) {
		this.x = position.x;
		this.y = position.y;
		this.y = position.z;

		this.width = width;
		this.height = height;
		this.depth = depth;
	}
}

// MAIN OBJECT
/**
 * Extends mathematical functionality of JS for Game Development.
 *
 * Includes many math functions not included in the built in Math library,
 * as well as some physics/game-dev functions.
 */
class math {
	constructor() {}

	/**
	 * Based on distance from [0, 0]
	 * @param {Cartesian2} position - The 2D positional data to be converted into a vector.
	 * @returns {Vector2} - Returns the {Vector2} calculation.
	 */
	static vector2(position) {
		const vect = new Vector2(
			this.deg(Math.atan2(position.y, position.x)),
			Math.sqrt(position.x ** 2 + position.y ** 2)
		);

		return vect;
	}

	/**
	 * Based on distance from [0, 0]
	 * @param {Vector2} vector - The 2d vector data to be converted into coordinates.
	 * @returns {Cartesian2} - Returns the {Cartesian2} calculation.
	 */
	static cartesian2(vector) {
		const cart = new Cartesian2(
			vector.velocity * Math.cos(this.rad(vector.angle)),
			vector.velocity * Math.sin(this.rad(vector.angle))
		);
		return cart;
	}

	/**
	 * Converts an angle from radians to degrees.
	 * @param {number} radian - The radian value of an angle.
	 * @returns {number} Angle, converted to degrees.
	 */
	static deg(radian) {
		return radian * (180 / Math.PI);
	}

	/**
	 * Converts an angle from degrees to radians.
	 * @param {number} degree - The degree value of an angle.
	 * @returns {number} Angle, converted to radians.
	 */
	static rad(degree) {
		return degree * (Math.PI / 180);
	}

	/**
	 * @param {number} min - The minimum value.
	 * @param {number} max - The maximum value.
	 * @returns {number} - a random integer between two values.
	 */
	static range(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Returns the factorial of a number.
	 * @param {number} n - The number to return the factorial of.
	 * @returns {number} The calculated factorial of n.
	 */
	static fact(n) {
		if (n === 0 || n === 1) return 1;

		for (let i = n - 1; i >= 1; i--) {
			n *= i;
		}

		return n;
	}

	/**
	 * Checks 2D axis-aligned bounding boxes coordinates against eachother.
	 * @param {BoundingBox2D} bbox1 - The first bounding box to check against.
	 * @param {BoundingBox2D} bbox2 - The second bounding box to check against.
	 * @returns A boolean. (true) means the bounding boxes overlap.
	 */
	static aabb2D(bbox1, bbox2) {
		if (
			bbox1.x < bbox2.x + bbox2.width &&
			bbox1.x + bbox1.width > bbox2.x &&
			bbox1.y < bbox2.y + bbox2.height &&
			bbox1.y + bbox1.height > bbox2.y
		) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Checks 3D axis-aligned bounding boxes coordinates against eachother.
	 * @param {BoundingBox3D} bbox1 - The first bounding box to check against.
	 * @param {BoundingBox3D} bbox2 - The second bounding box to check against.
	 * @returns A boolean. (true) means the bounding boxes overlap.
	 */
	static aabb3D(bbox1, bbox2) {
		if (
			bbox1.x < bbox2.x + bbox2.width &&
			bbox1.x + bbox1.width > bbox2.x &&
			bbox1.y < bbox2.y + bbox2.height &&
			bbox1.y + bbox1.height > bbox2.y &&
			bbox1.z < bbox2.z + bbox2.depth &&
			bbox1.z + bbox1.depth > bbox2.z
		) {
			return true;
		} else {
			return false;
		}
	}
}

// Try exporting if we are in node. (used for development only)
try {
	module.exports = {
		Cartesian2,
		Cartesian3,
		Angle,
		Vector2,
		BoundingBox2D,
		BoundingBox3D,
		math,
	};
} catch {
}
