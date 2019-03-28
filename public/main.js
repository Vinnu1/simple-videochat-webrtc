var Peer = require('simple-peer')
var socket = io();
const video = document.querySelector('video')
let client = {}

// get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        socket.emit('NewClient')
        video.srcObject = stream
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
            let video = document.createElement('video')
            video.id = "peerVideo"
            video.srcObject = stream
            video.class = "embed-responsive-item"
            document.querySelector('#peerDiv').prepend(video)
            video.play()
        }


    })
    .catch((err) => {
        document.write(err)
    })

