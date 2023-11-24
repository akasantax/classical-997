const {execSync, spawn} = require('child_process');
const config = require('./config.json');

const NETWORK_CACHING = config.MUTE_START;

function mute() {
	try { execSync('amixer -D pulse set Master mute'); } catch (error) {}
}

function unmute() {
	try { execSync('amixer -D pulse set Master unmute'); } catch (error) {}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function vlcPlayer(json) {
	let state = json["state"];
	let track = json["track"];

	mute();
	try { execSync('killall vlc'); } catch (error) {}

	if (state == "play") {
		let vlcProcess = spawn('vlc', ['--intf', 'dummy', `--network-caching=${NETWORK_CACHING}`, `./playlist/${track}.xspf`]);

		vlcProcess.stdout.on('data', (data) => {
			console.log(`${data}`);
		});

		vlcProcess.stderr.on('data', (data) => {
			console.log(`${data}`);
		});
	}

	// added delay for vlc to buffer audio stream
	await sleep(NETWORK_CACHING);
	unmute();
	
	return;
}

module.exports = {vlcPlayer};