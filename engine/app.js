
const engine = require('./src/engine.js');

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
    process.stdout.write(JSON.stringify(engine(data), null, ' '));
});