const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const router = express.Router()
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"))

router.get("/", function (request, response) {
    response.sendFile('./public/index.html', { root: __dirname });
});

let offer
// let answers

io.on('connection', function (socket) {
    socket.on('FrontOffer', StoreOffer);
    socket.on('FrontAnswer', SendAnswer)
    socket.on('NotInit', SendOffer)
})

function StoreOffer(data) { //set the init offer
    console.log('connection came:', data)
    offer = data

}

function SendOffer() {
    this.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}



app.use('/', router)

http.listen(port, () => console.log('Active on 3000 port.'));