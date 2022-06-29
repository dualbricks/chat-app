const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {addUser, getUser, removeUser, getUsersInRoom}= require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname,'../public')))



io.on('connection', (socket)=> {

    console.log('New WebSocket connection')

    socket.on('join', (options, callback)=>{
        const {error, user} = addUser({id:socket.id, ...options})
        if(error) {
            return callback(error)
        }
        socket.join(user.roomName)
        socket.emit('message', generateMessage('System','Welcome!'))
        socket.broadcast.to(user.roomName).emit('message', generateMessage('System',`${user.displayName} has join the room.`))

        callback()
    })
    
    socket.on('sendMessage', (text, callback)=>{
        const user = getUser(socket.id)
        console.log(user)
        const filter = new Filter()
        if(filter.isProfane(text)) {
            return callback(generateMessage('Profanity is not allowed'))
        }
        io.to(user.roomName).emit('message', generateMessage(user.displayName,text))
        callback('Delivered!')
    })
    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.roomName).emit('locationMessage', generateMessage(user.displayName,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.roomName).emit('message', generateMessage('System',`${user.displayName} has left`))
        }
        callback()
    })
    

})


server.listen(port, ()=> {
    console.log('App is listening on port '+ port)
})