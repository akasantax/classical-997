const express = require('express');
const app = express();
const fs = require('fs');
const {execSync} = require('child_process');
const config = require('./config.json');
const player = require('./player_routes.js');
const {vlcPlayer} = require('./vlc_player.js');

const PORT = config.PORT;
const args = process.argv.slice(2);

// log
if (args.includes('debug')) {
	let logStream  = fs.createWriteStream(__dirname + '/console.log', {flags: 'w'});
	console.log = function (message) {
		let str = typeof message === 'string' ? message : JSON.stringify(message);
		process.stdout.write(`${str}\n`);
		logStream.write(`${str}\n`);
	};
}

// autoplay
if (args.includes('autoplay')) {
	const playlist = JSON.parse(fs.readFileSync('./playlist.json'));
	let track = playlist[0].id;
	let data = `{"state":"play","track":"${track}"}`
	let jsonData = JSON.parse(data);
	console.log("[autoplay]");
	console.log(jsonData);
	fs.writeFileSync('./player-state.json', data);
	vlcPlayer(jsonData);
}
else{
	try { execSync('killall vlc'); } catch (error) {}
	let data = '{"state":"stop","track":""}';
	fs.writeFileSync('./player-state.json', data);
}

app.use(express.static('app'));
app.use('/player', player);

app.listen(process.env.port || PORT);

console.log(`Running at Port ${PORT}`);