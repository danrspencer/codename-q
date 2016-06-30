
const engine = require('./src/engine.js');

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
    let result = engine(data);
});