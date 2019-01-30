var Peer = require('simple-peer')
var socket = io();
//let peer

const video = document.querySelector('video')

// get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {

        let initFlag = false;
        let done = false;

        //if initiator url is detected
        if (location.hash === "#init") {
            initFlag = true;
        }
        else {
            socket.emit('NotInit')
        }

        let peer = new Peer({ initiator: initFlag, trickle: false, stream: stream })



        peer.on('signal', function (data) {
            console.log('peer signal:', data) //send offer

            if (done) { //do nothing if offer or answer is sent
                return
            }
            if (initFlag) {
                socket.emit('FrontOffer', data); //send offer if init

            }
            else {
                socket.emit('FrontAnswer', data); //send answer if not init

            }
            done = true;
        })

        socket.on("BackOffer", BackOffer); //recieved offer

        socket.on("BackAnswer", BackAnswer); //recieved answer

        function BackOffer(data) {
            console.log('Signal came:', data)
            peer.signal(data) //generate answer
        }

        function BackAnswer(data) {
            console.log('Signal came:', data)
            peer.signal(data) //connect answer and do nothing 

        }

        peer.on('stream', function (stream) {
            // got remote video stream
            video.srcObject = stream
            video.play()
        })

    })

