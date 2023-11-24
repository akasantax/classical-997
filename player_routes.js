const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const config = require('./config.json');
const {vlcPlayer} = require('./vlc_player.js');

const WEBSOCKET_PORT = config.WEBSOCKET_PORT;

const wss = new WebSocket.Server({ port:WEBSOCKET_PORT });

router.get('/playlist', function(req, res) {
	res.sendFile(path.join(__dirname + '/playlist.json'));
});

router.get('/state', function(req, res) {
	res.sendFile(path.join(__dirname + '/player-state.json'));
});

router.post('/control', function(req, res) {
	let data = '';

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end', function() {
		res.end(data);
		let clients = wss.clients
		clients.forEach(client => {
			client.send(data)
		})
		console.log("----------------------------------------------------------------------------");
		console.log(data);
		fs.writeFileSync('./player-state.json', data);
		let jsonData = JSON.parse(data);
		vlcPlayer(jsonData);
	});
});


module.exports = router;