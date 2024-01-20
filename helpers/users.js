var users = [];


//Join user to chat

function userJoin(id,username,roomID){
    const user = {id,username,roomID};

    users.push(user);

    return user;
}

function getCurrentUser(id){
    return users.find(user => user.id === id);
}

//User leaves the chat box
function  userLeaves(id){
    const index = users.findIndex(user=> user.id==id)

    if(index!=-1){
        return users.splice(index,1)[0];
    }
}

//get room users
function getRoomUsers(roomID){
    return users.filter(user=>user.roomID==roomID);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeaves,
    getRoomUsers
};