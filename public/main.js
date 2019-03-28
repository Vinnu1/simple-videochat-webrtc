var Peer = require('simple-peer')
var socket = io();
const video = document.querySelector('video')
let client = {}

// get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        socket.emit('NewClient')
        //CHANGE VIDEO RESOLUTION
        video.srcObject = stream
        //for our video volume is muted 
        //video.volume = 0
        video.play()

        socket.on("BackOffer", FrontAnswer) //recieved offer
        socket.on("BackAnswer", SignalAnswer) //recieved answer
        socket.on("SessionActive", SessionActive)
        socket.on('CreatePeer', MakePeer)

        function MakePeer() {
            console.log('MakePeer Run')
            client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function (data) {
                console.log('inside peer signal')
                if (!client.gotAnswer) {
                    console.log('sending offer')
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer //keep everything related to peer at one place
        }

        function SessionActive() {
            document.write('Session active. Please come back later.')
        }

        function FrontAnswer(offer) {
            console.log('Offer came, sending answer from new peer:', offer)
            //let peer = new Peer({ trickle: false, stream: stream })
            let peer = InitPeer('notInit')
            peer.on('signal', (data) => {
                socket.emit('Answer', data)
            })

            peer.signal(offer) //generate answer
        }

        function SignalAnswer(answer) {
            console.log('Answer came:', answer)
            console.log('My Client:', client)
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer) //connect answer and do nothing 
        }

        function InitPeer(type) {
            let peer = new Peer({ initiator: (type == 'init') ? true : false, trickle: false, stream: stream })
            peer.on('stream', function (stream) {
                CreateVideo(stream)
            })
            peer.on('close', function () {
                console.log('inside close') //THIS IS HERE - Not working in chrome
                //destroy video
                document.getElementById("peerVideo").remove();
                //peer clean up
                peer.destroy()
            })
            return peer
        }

        function CreateVideo(stream) {
            console.log('creating video')
            //let div = document.createElement('div')
            //let videoDiv = document.createElement('div')
            //videoDiv.setAttribute('class', "embed-responsive embed-responsive-21by9") //"col w-50 h-50"
            //div.setAttribute('class', "col-12 col-sm-6 h-50 d-flex flex-column") //"col w-50 h-50"
            let video = document.createElement('video')
            video.id = "peerVideo" //you maybe wondering why unique id, cause the we don't want a overload condition to kill video. Btw try peer disconnect. 
            //video.setAttribute('class', "embed-responsive-item")
            video.srcObject = stream
            video.class = "embed-responsive-item"
            //videoDiv.appendChild(video) 
            //div.appendChild(videoDiv)
            document.querySelector('#peerDiv').prepend(video)
            video.play()
        }


    })
    .catch((err) => {
        document.write(err)
    })

