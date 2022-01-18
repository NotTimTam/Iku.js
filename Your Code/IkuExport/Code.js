try {
	const { rend, ctx } = require("../Iku/render");
	const { Primitive } = require("../Iku/game");
} catch {}

const tP = new Primitive();

tP.x = 0;
tP.y = 0;
tP.xDir = 20;
tP.yDir = 21;

let loopF = function () {
	// console.log(this);

	ctx.beginPath();

	ctx.fillStyle = "tomato";
	ctx.fillRect(this.x, this.y, 100, 100);

	ctx.closePath();

	this.x += this.xDir;
	this.y += this.yDir;

	if (this.x > ctx.canvas.width - 100 || this.x < 0) {
		this.xDir *= -1;
	}
	if (this.y > ctx.canvas.height - 100 || this.y < 0) {
		this.yDir *= -1;
	}

	return this;
};

tP.loop = loopF;

rend.createLayer("tempLayer").addPrimitive(tP);
