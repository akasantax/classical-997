const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const fs = require('fs');
const {exec, spawn} = require('child_process');
const config = require('./config.json');

const PORT = config.PORT;
const MUTESTART = config.MUTE_START;

function subTerminal(json) {
	var state = json["state"];
	var track = json["track"];

	mute();
	exec('killall vlc');

	setTimeout(function() {
		if (state == "play") {
			var vlcProcess = spawn('vlc', ['--intf', 'dummy', '--network-caching=1500', `./playlist/${track}.xspf`]);

			vlcProcess.stdout.on('data', (data) => {
				process.stdout.write(`${data}`);
			});

			vlcProcess.stderr.on('data', (data) => {
				process.stdout.write(`${data}`);
			});
		}

		// added delay for vlc to buffer audio stream
		setTimeout(function() {
			unmute();
		}, MUTESTART);

	}, 100);
	
	return;
}

function mute() {
	exec('amixer -D pulse sset Master mute', (err, stdout, stderr) => {});
}

function unmute() {
	exec('amixer -D pulse sset Master unmute', (err, stdout, stderr) => {});
}

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/index.html'));
});

router.get('/img/favicon.ico', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/img/favicon.ico'));
});

router.get('/js/script.js', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/js/script.js'));
});

router.get('/data/media-source.json', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/data/media-source.json'));
});

router.get('/data/player-state.json', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/data/player-state.json'));
});

router.get('/css/style.css', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/css/style.css'));
});

router.get('/css/normalize.css', function(req, res) {
	res.sendFile(path.join(__dirname + '/app/css/normalize.css'));
});

router.post('/', function(req, res) {
	process.stdout.write("----------------------------------------------------------------------------");
	var data = '';

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end', function() {
		res.end(data);
		console.log("\n", JSON.parse(data))
		fs.writeFile('./app/data/player-state.json', data, err => {
			if (err) { console.log(err) }
		})
		//const unquoted = data.replace(/"([^"]+)":/g, '$1:');
		subTerminal(JSON.parse(data));
	});
});

const args = process.argv.slice(2);
// log
if (args.includes('debug')) {
	var logFs = require('fs');
	var util = require('util');
	var logFile = logFs.createWriteStream(__dirname + '/console.log', {flags: 'w'});

	process.stdout.write = function(d) {
		logFile.write(util.format(d));
	};
}

// autoplay
if (args.includes('autoplay')) {
	const mediaSource = JSON.parse(fs.readFileSync('./app/data/media-source.json'));
	var track = mediaSource[0].id;
	var str = `{"state":"play","track":"${track}"}`
	var data = JSON.parse(str);
	setTimeout(function() {
		console.log("[autoplay]");
		console.log(data);
	}, 10);
	fs.writeFileSync('./app/data/player-state.json', str);
	subTerminal(data);
}
else{
	var str = '{"state":"stop","track":""}';
	fs.writeFileSync('./app/data/player-state.json', str)
}

exec('killall vlc');

app.use('/', router);
app.listen(process.env.port || PORT);

console.log(`Running at Port ${PORT}`);
