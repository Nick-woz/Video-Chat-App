// Adapted from https://github.com/shanet/WebRTC-Example

var localVid = $("#localVideo");
var remoteVid = $("#remoteVideo");
var btn1 = $("#btn-client1");
var btn2 = $("#btn-client2");
var theInput = $("#msgInput");
var callBtn = $("#btn-call");
var endCallBtn = $("btn-Endcall");
var theInput = $('#msgInput')
var sendBtn = $('#btn-send');
var msgDiv = $("#msgDiv");
var btnSound = document.getElementById("btnAudio1");
var btnSound2 = document.getElementById("btnAudio2");
var sound1 = document.getElementById("s1");
var sound2 = document.getElementById("s2");
var sound3 = document.getElementById("s3");
var drawBtn = $("#btn-draw");

var localStream;
var peerConnection;
var serverConnection;
var destination;


const peerConnectionConfig = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun.ekiga.net" },
        { urls: "stun:stun.fwdnet.net" },
        { urls: "stun:stun.ideasip.com" },
        { urls: "stun:stun.iptel.org" },
    ],
};

const MessageType = {
    SERVER_INFO: 0,
    CLIENT1: 1,
    CLIENT2: 2,
    CALL_REQUEST: 3,
};

btn1.on("click", () => {
    btnSound.play();
    getWebcam();
    btn2.prop("disabled", true);
    destination = "wss://" + location.host + "/client1";
    serverConnection = new WebSocket(destination);
    serverConnection.onmessage = handleMessage;
    
});

btn2.on("click", () => {
    btnSound.play();
    getWebcam();
    btn1.prop("disabled", true);
    destination = "wss://" + location.host + "/client2";
    serverConnection = new WebSocket(destination);
    serverConnection.onmessage = handleMessage;
});

callBtn.on("click", () => {
    btnSound2.play();
    start(true);
});


function getWebcam() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia({
                video: true,
                audio: true,
            },
            (stream) => {
                // success
                localStream = stream;
                localVid.prop("srcObject", stream);
            },
            (error) => {
                // error
                console.error(error);
            }
        );
    } else {
        alert("Your browser does not support getUserMedia API");
    }
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.ontrack = gotRemoteStream;
    peerConnection.addStream(localStream);

    if (isCaller) {
        peerConnection.createOffer().then(createdDescription).catch(errorHandler); // using chained Promises for async
    }
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        serverConnection.send(
            JSON.stringify({
                type: MessageType.CALL_REQUEST,
                ice: event.candidate,
                message: "Sending ICE candidate",
            })
        );
    }
}

function createdDescription(description) {
    console.log("got description");

    peerConnection
        .setLocalDescription(description)
        .then(() => {
            serverConnection.send(
                JSON.stringify({
                    type: MessageType.CALL_REQUEST,
                    sdp: peerConnection.localDescription,
                    message: "Requesting call",
                })
            );
        })
        .catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log("got remote stream");
    remoteVid.prop("srcObject", event.streams[0]);
    msgDiv.html("Connected to peer.");
}

function handleMessage(mEvent) {
    var msg = JSON.parse(mEvent.data);

    switch (msg.type) {
        case MessageType.SERVER_INFO:
            msgDiv.html(msg.message);
            break;

            // Message came from Client 1, Handle as Client2
        case MessageType.CLIENT1:
            msgDiv.html(msg.message);
            var mes = (msg.message).split(" ");
            var cX = mes[0];
            var cY = mes[1];
                        
           var c = document.getElementById("canvas");
           var ctx = c.getContext("2d");
           ctx.beginPath();
           
           ctx.lineTo(cX,cY);
           ctx.fillRect(cX, cY, 2, 2);
           ctx.stroke();
           
           break;

            // Message came from Client 2, Handle as Client1
        case MessageType.CLIENT2:
            msgDiv.html(msg.message);
            var mes = (msg.message).split(" ");
            var cX = mes[0];
            var cY = mes[1];
            ctx.beginPath();
            ctx.rect(cX, cY, 1, 1);
            ctx.stroke();
            break;

        case MessageType.CALL_REQUEST:
            if (!peerConnection) {
                msgDiv.html("Receiving Call!");
                start(false);
            }

            // Are we on the SDP stage or the ICE stage of the handshake?
            if (msg.sdp) {
                peerConnection
                    .setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => {
                        // Only create answers in response to offers
                        if (msg.sdp.type == "offer") {
                            peerConnection
                                .createAnswer()
                                .then(createdDescription)
                                .catch(errorHandler);
                        }
                    })
                    .catch(errorHandler);
            } else if (msg.ice) {
                peerConnection
                    .addIceCandidate(new RTCIceCandidate(msg.ice))
                    .catch(errorHandler);
            }
        default:
            break;
    }
}

function errorHandler(error) {
    console.error(error);
}

//From https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Using_Pointer_Events
function startup() {
    sound3.play();
    var el = document.getElementsByTagName("canvas")[0];
    el.addEventListener("pointerdown", handleStart, false);
    el.addEventListener("pointerup", handleEnd, false);
    el.addEventListener("pointercancel", handleCancel, false);
    el.addEventListener("pointermove", handleMove, false);
    var canvas = document.getElementById('canvas');
    var ctx    = canvas.getContext('2d');
    var video  = document.getElementById('remoteVideo');

video.addEventListener('play', function () {
    var $this = this; //cache
    (function loop() {
        if (!$this.paused && !$this.ended) {
            ctx.drawImage($this, 0, 0);
            setTimeout(loop, 1000 / 30); // drawing at 30fps
        }
    })();
}, 0);
  }
  var ongoingTouches = new Array(); 

function handleStart(evt) {
  
  var el = document.getElementsByTagName("canvas")[0];
  var ctx = el.getContext("2d");
        
  
  ongoingTouches.push(copyTouch(evt));
  var color = colorForTouch(evt);
  ctx.beginPath();
  ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
  ctx.arc(evt.clientX, evt.clientY, 4, 0, 2 * Math.PI, false);  // a circle at the start
  ctx.fillStyle = color;
  ctx.fill();
} 

function handleMove(evt) {
  var el = document.getElementsByTagName("canvas")[0];
  var ctx = el.getContext("2d");
  var color = colorForTouch(evt);
  var idx = ongoingTouchIndexById(evt.pointerId);

  
  if (idx >= 0) {
    ctx.beginPath();
    
    ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
    var cX = ongoingTouches[idx].pageX;
    var cY = ongoingTouches[idx].pageY;
    if (destination != undefined) {
        serverConnection.send(JSON.stringify({
                                 type: MessageType.CLIENT1,
                                 message: cX + " " + cY,
        }));
                          
    }
    
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();

    ongoingTouches.splice(idx, 1, copyTouch(evt));  // swap in the new touch record
    
  }
} 

function handleEnd(evt) {
  
  var el = document.getElementsByTagName("canvas")[0];
  var ctx = el.getContext("2d");
  var color = colorForTouch(evt);
  var idx = ongoingTouchIndexById(evt.pointerId);

  if (idx >= 0) {
    ctx.lineWidth = 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.fillRect(evt.clientX - 4, evt.clientY - 4, 8, 8);  // and a square at the end
    ongoingTouches.splice(idx, 1);  // remove it; we're done
  }
} 

function handleCancel(evt) {
  
  var idx = ongoingTouchIndexById(evt.pointerId);
  ongoingTouches.splice(idx, 1);  // remove it; we're done
} 

function colorForTouch(touch) {
  var r = touch.pointerId % 16;
  var g = Math.floor(touch.pointerId / 3) % 16;
  var b = Math.floor(touch.pointerId / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;
 
  return color;
} 

function copyTouch(touch) {
  return { identifier: touch.pointerId, pageX: touch.clientX, pageY: touch.clientY };
} 

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    
    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
} 

function log(msg) {
  var p = document.getElementById('log');
  p.innerHTML = msg + "\n" + p.innerHTML;
}
function clearCanvas(){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function makeNoise(){
    var n = getRandomArbitrary(1,10);

    if(n<5){
        sound1.play();
    }
    else{
        sound2.play();
    }
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = document.getElementById("duck-img");
    ctx.drawImage(img, 150, 250, canvas.width/2, canvas.height/2);
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
 