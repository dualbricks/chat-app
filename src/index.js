const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname,'../public')))



io.on('connection', (socket)=> {

    console.log('New WebSocket connection')
    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.emit('message', 'A new user has joined')


    socket.on('sendMessage', (text, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(text)) {
            return callback(generateMessage('Profanity is not allowed'))
        }
        io.emit('message', generateMessage(text))
        callback('Delivered!')
    })
    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMessage', generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Delivered!')
    })

    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A user has left'))
    })
    

})


server.listen(port, ()=> {
    console.log('App is listening on port '+ port)
})