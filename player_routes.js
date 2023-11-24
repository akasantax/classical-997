const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const {vlcPlayer} = require('./vlc_player.js');

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
		console.log("----------------------------------------------------------------------------");
		console.log(data);
		fs.writeFileSync('./player-state.json', data);
		let jsonData = JSON.parse(data);
		vlcPlayer(jsonData);
	});
});

module.exports = router;