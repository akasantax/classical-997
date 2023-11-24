function setPlaybutton() {
	const currentState = document.getElementById('currentState').innerHTML;
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
	const currentTrack = document.getElementById('dropBtn').value;
	const newState = setPlaybutton();
	const url = '/player/control';
	const data = {
		state: newState,
		track: currentTrack
	};
	const jsonString = JSON.stringify(data);
	fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=UTF-8'},
		body: jsonString
	})
		.then(response => {
		  if(!response.ok) {
			throw new Error(`requeset failed with status: ${response.status}`);
		  }
		  return response.json();
		})
		.then(data => {
		  getServerData();
		})
		.catch(error => {
		  console.error('error:', error.message);
		});
}

function load() {
	const url = '/player/playlist';
	fetch(url)
		.then(response => {
		  if(!response.ok) {
				throw new Error(`requeset failed with status: ${response.status}`);
		  }
		  return response.json();
		})
		.then(data => {
			const dropBtn = document.getElementById('dropBtn');
			const element = document.getElementById('dropdown-content');
			const track = data;
			dropBtn.innerHTML = track[0].title;
			dropBtn.value = track[0].id;
			for (let i = 0; i < track.length; i++) {
				element.innerHTML = element.innerHTML +
					'<a href="javascript:void(0);" id="' + track[i].id + '" onclick="trackSelect(this)">' + track[i].title + '</a>';
			}
		})
		.catch(error => {
		  console.error('error:', error.message);
		});

	// get player data from server
	loadPlayerData();

	// add margin left to center play button
	const btn = document.getElementById('playBtn');
	const btnOffsetWidth = btn.offsetWidth;
	const leftWidth = getComputedStyle(document.getElementById('playBtn'), null).getPropertyValue('border-left-width');
	btn.style.marginLeft = (btnOffsetWidth - parseInt(leftWidth)) + "px";
}

function loadPlayerData() {
	const url = '/player/state';
	fetch(url)
		.then(response => {
		  if(!response.ok) {
				throw new Error(`requeset failed with status: ${response.status}`);
		  }
		  return response.json();
		})
		.then(data => {
			document.getElementById('currentState').innerHTML = data["state"];
			document.getElementById('currentTrack').innerHTML = data["track"];
			// play paulse button
			const btn = document.getElementById('playBtn');
			if (data["state"] == "stop") {
				btn.classList.remove("stop");
			} else {
				btn.classList.add("stop");
			}
			// track selection
			if (data["track"] !== "") {
				document.getElementById('dropBtn').innerHTML = document.getElementById(data["track"]).innerHTML;
			}
		})
		.catch(error => {
		  console.error('error:', error.message);
		});
}

function getServerData() {
	const url = '/player/state';
	fetch(url)
		.then(response => {
			if(!response.ok) {
				throw new Error(`requeset failed with status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			document.getElementById('currentState').innerHTML = data["state"];
			document.getElementById('currentTrack').innerHTML = data["track"];
		})
		.catch(error => {
		  console.error('error:', error.message);
		});
}

function trackSelect(option) {
	const currentState = document.getElementById('currentState').innerHTML;
	const currentTrack = option.id;
	document.getElementById('dropBtn').value = currentTrack;
	document.getElementById('dropBtn').innerHTML = option.innerHTML;
	if (currentState == "play") {
		const url = '/player/control';
		const data = {
			state: "play",
			track: currentTrack
		};
		const jsonString = JSON.stringify(data)
		fetch(url, {
			method: 'POST',
			headers: {'Content-Type': 'application/json;charset=UTF-8'},
			body: jsonString
		})
			.then(response => {
				if(!response.ok) {
				throw new Error(`requeset failed with status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				getServerData();
			})
			.catch(error => {
				console.error('error:', error.message);
			});
	}
	hide();
}

function reveal() {
	const dropdownContent = document.getElementById('dropdown-content');
	dropdownContent.classList.add("dropdown-content");
	dropdownContent.classList.remove("hidden");
}

function hide() {
	const dropdownContent = document.getElementById('dropdown-content');
	if (dropdownContent.classList.contains("hidden")) {
		reveal()
	} else {
		dropdownContent.classList.remove("dropdown-content");
		dropdownContent.classList.add("hidden");
	}
}