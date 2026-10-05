const fs = require('fs');
const dir = './assets';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

// A tiny 1x1 transparent PNG
const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
const buffer = Buffer.from(b64, 'base64');

fs.writeFileSync(dir + '/icon.png', buffer);
fs.writeFileSync(dir + '/splash.png', buffer);
fs.writeFileSync(dir + '/adaptive-icon.png', buffer);
console.log("Assets created!");
