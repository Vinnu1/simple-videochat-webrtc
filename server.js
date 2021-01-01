const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

app.use(express.static(__dirname + "/public"))
let clients = 0

io.on('connection', function (socket) {
    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')
        clients++;
    })
    socket.on('Offer', Offer)
    socket.on('Answer', Answer)
    socket.on('disconnect', DeletePeer)
})

function DeletePeer() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("DeletePeer")
        clients--
    }
}

function Offer(offer) {
    this.broadcast.emit("Offer", offer)
}

function Answer(data) {
    this.broadcast.emit("Answer", data)
}

http.listen(port, () => console.log(`Active on ${port} port`))



