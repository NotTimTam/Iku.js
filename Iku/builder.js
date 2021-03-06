"use strict";
console.log("builder.js loaded...");

const fs = require("fs-extra");
const path = require("path");

/*
Builds your game.
*/

function __walk(dir) {
	var results = [];
	var list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(__walk(file));
		} else {
			/* Is a file */
			results.push(file);
		}
	});
	return results;
}

class Builder {
	constructor() {
		console.log(
			"builder.js initialized... Run (builder).build() to build your game"
		);
	}

	/**
	 * Builds the game with your settings and code.
	 * @param {object} settings - The settings used to create the game.
	 * @param {string} outputDirectory - The folder to dump the *"Iku.js Export"* folder into.
	 */
	build(settings, outputDirectory = "./") {
		console.log("[builder.js]   0% - Building");
		if (!settings) {
			throw new Error("No settings given to build function.");
		}

		const DIR = `${outputDirectory}/Iku.js Export/`;

		// Create directory.
		console.log("[builder.js]   2% - Creating directory");
		fs.mkdirSync(DIR, { recursive: true });

		// Copy all the code files.
		console.log("[builder.js]  15% - Generating JS files (1/3)");
		fs.copyFile(__dirname + "/math.js", DIR + "/math.js", (err) => {
			if (err) {
				console.warn(err);
			}
		});
		console.log("[builder.js]  20% - Generating JS files (2/3)");
		fs.copyFile(__dirname + "/render.js", DIR + "/render.js", (err) => {
			if (err) {
				console.warn(err);
			}
		});
		console.log("[builder.js]  25% - Generating JS files (3/3)");
		fs.copyFile(__dirname + "/game.js", DIR + "/game.js", (err) => {
			if (err) {
				console.warn(err);
			}
		});

		// Copy all the users code files.
		console.log("[builder.js]  30% - Copying user code files");
		let customCodeImports = "";
		if (settings.files) {
			fs.copySync(settings.files, DIR + "/" + settings.files);

			// Create HTML import tags for all the files.
			__walk(settings.files).forEach((filepath) => {
				customCodeImports += `<script src="${filepath}"></script>`;
			});

			// for (let filePath of settings.code) {
			// 	customCodeImports += `<script src="./${filePath}"></script>`;
			// 	fs.copyFile("./" + filePath, DIR + "/" + filePath, (err) => {
			// 		if (err) {
			// 			console.warn(err);
			// 		}
			// 	});
			// }
		}

		// Write the html file.
		console.log("[builder.js]  95% - Generating HTML");
		const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${settings.name ? settings.name : "Unnamed Game"}</title>

            ${
				settings.pixelPerfect
					? `<style> canvas { image-rendering: pixelated; image-rendering: crisp-edges; } </style>`
					: ""
			}
        </head>
        <body>
			<script src="./math.js"></script>
			<script src="./render.js"></script>
            <script src="./game.js"></script>
            ${customCodeImports}
        </body>
        </html>`;

		console.log("[builder.js] 100% - Saving HTML");
		fs.writeFileSync(DIR + "/index.html", html, {
			encoding: "utf8",
			flag: "w",
		});
	}
}

module.exports = new Builder();
