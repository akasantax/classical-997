const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const fs = require('fs');
const {execSync, spawn} = require('child_process');
const config = require('./config.json');

const PORT = config.PORT;
const MUTESTART = config.MUTE_START;

function vlcPlayer(json) {
	let state = json["state"];
	let track = json["track"];

	mute();
	try { execSync('killall vlc'); } catch (error) {}

	if (state == "play") {
		let vlcProcess = spawn('vlc', ['--intf', 'dummy', '--network-caching=1500', `./playlist/${track}.xspf`]);

		vlcProcess.stdout.on('data', (data) => {
			console.log(`${data}`);
		});

		vlcProcess.stderr.on('data', (data) => {
			console.log(`${data}`);
		});
	}

	// added delay for vlc to buffer audio stream
	setTimeout(function() {
		unmute();
	}, MUTESTART);
	
	return;
}

function mute() {
	try { execSync('mixer -D pulse sset Master mute'); } catch (error) {}
}

function unmute() {
	try { execSync('amixer -D pulse sset Master unmute'); } catch (error) {}
}

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/index.html'));
});

router.get('/favicon.ico', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/favicon.ico'));
});

router.get('/js/script.js', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/js/script.js'));
});

router.get('/css/style.css', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/css/style.css'));
});

router.get('/css/normalize.css', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/css/normalize.css'));
});

router.get('/player/playlist', function(req, res) {
	res.sendFile(path.join(__dirname + '/playlist.json'));
});

router.get('/player/state', function(req, res) {
	res.sendFile(path.join(__dirname + '/player-state.json'));
});

router.post('/player/control', function(req, res) {
	console.log("----------------------------------------------------------------------------");
	let data = '';

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end', function() {
		res.end(data);
		console.log(data);
		fs.writeFile('./player-state.json', data, err => {
			if (err) { console.log(err) }
		})
		let jsonData = JSON.parse(data);
		vlcPlayer(jsonData);
	});
});

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
	let str = `{"state":"play","track":"${track}"}`
	let jsonData = JSON.parse(str);
	setTimeout(function() {
		console.log("[autoplay]");
		console.log(jsonData);
	}, 10);
	fs.writeFileSync('./player-state.json', str);
	vlcPlayer(jsonData);
}
else{
	let str = '{"state":"stop","track":""}';
	fs.writeFileSync('./player-state.json', str)
}

try { execSync('killall vlc'); } catch (error) {}

app.use('/', router);
app.listen(process.env.port || PORT);

console.log(`Running at Port ${PORT}`);
