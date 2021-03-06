const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')
const $locationButton = document.querySelector('#send-location')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// Options
const{displayName, roomName} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//auto scrolling

const autoscroll = () =>{

    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessagesHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container 
    const containerHeight = $messages.scrollHeight

    // distance scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessagesHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


//socket listeners

socket.on('locationMessage', ({text, createdAt, displayName})=>{
    const html = Mustache.render(locationTemplate, {
        displayName,
        url: text,
        createdAt: moment(createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})


socket.on('message', ({text, createdAt, displayName})=>{

    const html = Mustache.render(messageTemplate, {
        displayName,
        message: text,
        createdAt: moment(createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    //disable
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    if(message == '') {
        $messageFormButton.removeAttribute('disabled')
        return
    }
    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click', ()=>{
    $locationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('Gelocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude:position.coords.longitude
        }, (message)=>{
            $locationButton.removeAttribute('disabled')
            console.log("Location shared", message)
        })
    })
})

socket.emit('join', {displayName, roomName}, (error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})