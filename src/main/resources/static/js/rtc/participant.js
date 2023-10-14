/*
 * Copyright 2023 SejonJang (wkdtpwhs@gmail.com)
 *
 * Licensed under the  GNU General Public License v3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

/**
 * Creates a video element for a new participant
 *
 * @param {String} name - the name of the new participant, to be used as tag
 *                        name of the video element.
 *                        The tag of the new element will be 'video<name>'
 * @return
 */

function updateGridLayout() {
	var participantsDiv = document.getElementById('participants');
	var totalParticipants = participantsDiv.childElementCount;

	// Remove all layout classes
	['one', 'two', 'three'].forEach(function(cls) {
		participantsDiv.classList.remove(cls);
	});

	// Assign the appropriate layout class
	if (totalParticipants === 1) {
		participantsDiv.classList.add('one');
	} else if (totalParticipants === 2) {
		participantsDiv.classList.add('two');
	} else if (totalParticipants === 3) {
		participantsDiv.classList.add('three');
	}
}

function Participant(name) {
	//console.log("참여자명 : "+name)

	this.name = name;
	var rtcPeer = null;
	var localStream = null; // 유저의 로컬 스트림

	var container = document.createElement('div');
	container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
	container.id = name;
	var span = document.createElement('span');
	var video = document.createElement('video');
	var audio  = document.createElement("audio");

	container.appendChild(video);
	container.appendChild(span);
	container.appendChild(audio);

	container.onclick = switchContainerClass;
	document.getElementById('participants').appendChild(container);
	updateGridLayout();

	span.appendChild(document.createTextNode(name));

	video.id = 'video-' + name;
	video.autoplay = true;
	video.controls = false;

	audio.autoplay = true;

	/** set user LocalStream */
	this.setLocalSteam = function(stream){
		this.localStream = stream;
	}

	/** return user localStream */
	this.getLocalStream = function(){
		return this.localStream;
	}

	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	this.getAudioElement = function() {
		return audio;
	}

	function switchContainerClass() {
		if (container.className === PARTICIPANT_CLASS) {
			var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
			elements.forEach(function(item) {
				item.className = PARTICIPANT_CLASS;
			});

			container.className = PARTICIPANT_MAIN_CLASS;
		} else {
			container.className = PARTICIPANT_CLASS;
		}
	}

	function isPresentMainParticipant() {
		return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0);
	}

	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")
		//console.log('Invoking SDP offer callback function');
		var msg =  { id : "receiveVideoFrom",
			sender : name,
			sdpOffer : offerSdp
		};
		sendMessageToServer(msg);
	}


	this.onIceCandidate = function (candidate, wp) {
		//console.log("Local candidate" + JSON.stringify(candidate));

		var message = {
			id: 'onIceCandidate',
			candidate: candidate,
			name: name
		};
		sendMessageToServer(message);
	}

	Object.defineProperty(this, 'rtcPeer', { writable: true});

	this.dispose = function() {
		//console.log('Disposing participant ' + this.name);
		this.rtcPeer.dispose();
		container.parentNode.removeChild(container);
	};
}

function toggleParticipantScreen(event) {
	const participant = event.currentTarget;
	if (participant.classList.contains('expanded')) {
		participant.classList.remove('expanded');
	} else {
		participant.classList.add('expanded');
	}
}

const participantList = document.querySelectorAll('.participant, .participant.main');
participantList.forEach(participant => {
	participant.addEventListener('click', toggleParticipantScreen);
});