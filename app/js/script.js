function setPlaybutton() {
	var currentState = document.getElementById('currentState').innerHTML;
	const btn = document.getElementById('playBtn');
	if (currentState == "stop") {
		newState = "play";
		btn.classList.add("stop");
	} else {
		newState = "stop"
		btn.classList.remove("stop");
	}

	return newState;
}

function playStop() {
	var currentTrack = document.getElementById('dropbtn').value;
	var newState = setPlaybutton();

	var data = {
		state: newState,
		track: currentTrack
	};
	data = JSON.stringify(data)

	var xhr = new XMLHttpRequest();
	var method = 'POST';
	var url = '/player/control';
	xhr.open(method, url, true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			setTimeout(function() {
				getServerData();
			}, 100);
		}
	};
	xhr.send(data);
}

function load() {
	// get media source
	var xhr = new XMLHttpRequest();
	var method = 'GET';
	url = '/player/playlist';
	xhr.open(method, url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var track = JSON.parse(xhr.responseText);
			document.getElementById('dropbtn').innerHTML = track[0].title;
			document.getElementById('dropbtn').value = track[0].id;
			var element = document.getElementById('dropdown-content');
			for (var i = 0; i < track.length; i++) {
				element.innerHTML = element.innerHTML +
					'<a href="javascript:void(0);" id="' + track[i].id + '" onclick="trackSelect(this)">' + track[i].title + '</a>';
			}
		}
	};
	xhr.send();

	// get player data from server
	loadPlayerData();

	// add margin left to center play button
	var btn = document.getElementById('playBtn');
	var btnOffsetWidth = btn.offsetWidth;
	var leftWidth = getComputedStyle(document.getElementById('playBtn'), null).getPropertyValue('border-left-width');
	btn.style.marginLeft = (btnOffsetWidth - parseInt(leftWidth)) + "px";
}

function loadPlayerData() {
	var currentState = document.getElementById('currentState');
	var currentTrack = document.getElementById('currentTrack');
	var xhr = new XMLHttpRequest()
	var method = 'GET',
		url = '/player/state';
	xhr.open(method, url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status == 200) {
			var json = JSON.parse(this.responseText);
			console.log(json);
			currentState.innerHTML = json["state"];
			currentTrack.innerHTML = json["track"];

			// button
			const btn = document.getElementById('playBtn');
			if (json["state"] == "stop") {
				btn.classList.remove("stop");
			} else {
				btn.classList.add("stop");
			}

			// selection
			if (json["track"] !== "") {
				document.getElementById('dropbtn').innerHTML = document.getElementById(json["track"]).innerHTML;
			}
		}
	}
	xhr.send();
}

function getServerData() {
	var currentState = document.getElementById('currentState');
	var currentTrack = document.getElementById('currentTrack');
	var xhr = new XMLHttpRequest()
	var method = 'GET',
		url = '/player/state';
	xhr.open(method, url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			json = JSON.parse(this.response);
			console.log(json);
			currentState.innerHTML = json["state"];
			currentTrack.innerHTML = json["track"];
		}
	}
	xhr.send();
}

function trackSelect(option) {
	var currentState = document.getElementById('currentState').innerHTML;
	var currentTrack = option.id;
	document.getElementById('dropbtn').value = currentTrack;
	document.getElementById('dropbtn').innerHTML = option.innerHTML;
	if (currentState == "play") {
		var data = {
			state: "play",
			track: currentTrack
		};
		data = JSON.stringify(data)
		var xhr = new XMLHttpRequest();
		var method = 'POST';
		var url = '/player/control';
		xhr.open(method, url, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status == 200) {
				setTimeout(function() {
					getServerData();
				}, 100);
			}
		};
		xhr.send(data);
	}
	hide();
}

function reveal() {
	var dropdownContent = document.getElementById('dropdown-content');
	dropdownContent.classList.add("dropdown-content");
	dropdownContent.classList.remove("hidden");
}

function hide() {
	var dropdownContent = document.getElementById('dropdown-content');
	if (dropdownContent.classList.contains("hidden")) {
		reveal()
	} else {
		dropdownContent.classList.remove("dropdown-content");
		dropdownContent.classList.add("hidden");
	}
}