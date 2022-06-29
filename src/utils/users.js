const users = []

const addUser = ({id, displayName, roomName}) =>{
    // clean the data
    displayName = displayName.trim().toLowerCase()
    roomName = roomName.trim().toLowerCase()

    //validate the data
    if(!displayName || !roomName) {
        return {
            error: "Display name and room are required"
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.roomName === roomName && user.displayName === displayName
    })

    if(existingUser) {
        return {
            error: "Username is in use"
        }
    }
    
    //store user
    const user = {id, displayName, roomName}
    users.push(user)
    return {user}

}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}

const getUsersInRoom = (roomName)=>{
    return users.filter((user)=> user.roomName === roomName)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}