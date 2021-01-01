let Peer = require('simple-peer')
let io = require('socket.io-client');
let socket = io()
const video = document.getElementById('video')
let client = {}
//get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('NewClient')
        video.srcObject = stream
        video.play()

        //used to initialize a peer
        function InitPeer(type) {
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
            peer.on('stream', function (stream) {
                CreateVideo(stream)
            })
            peer.on('close', function () {
                document.getElementById("peerVideo").remove();
                peer.destroy()
            })
            peer.on('data', function (data) {
                let decodedData = new TextDecoder('utf-8').decode(data)
                let peervideo = document.getElementById('peerVideo')
                peervideo.style.filter = decodedData
            })
            return peer
        } 

        function CreateVideo(stream) {
            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.setAttribute('class', 'embed-responsive-item')
            document.getElementById('peerDiv').appendChild(video)
            video.play()

            video.addEventListener('click', () => {
                if (video.volume != 0)
                    video.volume = 0
                else
                    video.volume = 1
            })
        }     

        socket.on('Offer', (offer)=>{  //for peer of type not init
            let peer = InitPeer('notInit')
            peer.on('signal', (data) => {
                socket.emit('Answer', data)
            })
            peer.signal(offer)
            client.peer = peer
        })

        socket.on('Answer', (answer) => {
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        })

        socket.on('SessionActive', () => {
            document.write('Session Active. Please come back later')
        })
        socket.on('CreatePeer', ()=>{ //for peer of type init
             client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function (data) {
                if (!client.gotAnswer) {
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
         })

        socket.on('DeletePeer', ()=>{
             if (client.peer) {
                client.peer.destroy()
            }
        })
    })
    .catch(err => document.write(err))
