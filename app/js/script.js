
function load() {
	if(mobileAndTabletcheck()||isIpadOS()){
		document.getElementById('dropBtn').removeAttribute('onmouseover');
	}

	establishSocketConnection();

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
		.then(() =>	{
			getServerData();
		})
		.catch(error => {
		  console.error('error:', error.message);
		});

	// add margin left to center play button
	const btn = document.getElementById('playBtn');
	const btnOffsetWidth = btn.offsetWidth;
	const leftWidth = getComputedStyle(document.getElementById('playBtn'), null).getPropertyValue('border-left-width');
	btn.style.marginLeft = (btnOffsetWidth - parseInt(leftWidth)) + "px";
}

function mobileAndTabletcheck() {
	let check = false;
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		check = true;
	}
	return check;
};

function isIpadOS() {
	let check = false;
	if(navigator.userAgent.match(/Intel Mac OS X/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
		check = true;
	}
	return check;
};

function establishSocketConnection() {
	const host = window.location.hostname;  
	const websocketUrl = `ws://${host}:4040`;
	const socket = new WebSocket(websocketUrl);

    socket.addEventListener('open', (event) => {
		console.log('socket connection opened');
	});
  
	socket.addEventListener('message', (event) => {
		const data = JSON.parse(event.data);
		update(data);
	});

	socket.addEventListener('close', (event) => {
		console.log('socket connection closed');
	});
}

function update(data) {
	document.getElementById('currentState').innerHTML = data["state"];
	document.getElementById('currentTrack').innerHTML = data["track"];
	const btn = document.getElementById('playBtn');
	// update play paulse button
	if (data["state"] == "stop") {
		btn.classList.remove("stop");
	} else {
		btn.classList.add("stop");
	}
	// update track
	if (data["track"] !== "") {
		document.getElementById('dropBtn').innerHTML = document.getElementById(data["track"]).innerHTML;
		document.getElementById('dropBtn').value = data["track"];
	}
}

function setNewState() {
	const currentState = document.getElementById('currentState').innerHTML;
	if (currentState == "stop") {
		newState = "play";
	} else {
		newState = "stop"
	}
	return newState;
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
			update(data);
		})
		.catch(error => {
		  console.error('error:', error.message);
		});
}

function togglePlay() {
	const currentTrack = document.getElementById('dropBtn').value;
	const newState = setNewState();
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

function trackSelect(option) {
	const currentState = document.getElementById('currentState').innerHTML;
	const newTrack = option.id;
	document.getElementById('dropBtn').value = newTrack;
	document.getElementById('dropBtn').innerHTML = option.innerHTML;
	if (currentState == "play") {
		const url = '/player/control';
		const data = {
			state: "play",
			track: newTrack
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