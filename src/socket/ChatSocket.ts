import { io  } from "socket.io-client"

/*


io.on('connection', socket => {
    let users = {}
    //When new user Login
    socket.on('user', (data) => {
        console.log(`${data.username} Joind the chat`)

        //Udating his staius to 1 online in mongoDB
        mongoUser.updateOne({ email: `${data.email}` }, { $set: { status: 1 } }, (err, user) => {
            if (err) throw err
        })

        //finding Friends of the current User
        mongoUser.find({}, (err, user) => {
            var Friends = [];
            if (err) throw err
            for (let i = 0; i < user.length; i++) {
                // Friends=user[i].username
                if (user[i].username == data.username) {
                } else {
                    Friends.push(user[i])
                }
            }

            //Sending the welcome message and all users
            socket.emit('welcome', { data, Friends })
        })

        users[socket.id] = data.username;
        users['email'] = data.email
    })


    //Start chat with a specific user
    socket.on('startChat', (info) => {

        let reverse = [info[1], info[0]]

        let completeData = {
            users: info,
            chatting: ''
        }

        //Checking if they have any chat data saved
        chat.find({ $or: [{ users: info }, { users: reverse }] }, (err, res) => {
            if (err) throw err;
            if (res.length > 0) {
                //Yes they have chat data
                let room = res[0]._id;

                socket.join(room)

                let savedChat = res[0].chat
                //Sending chat history
                socket.emit('savedChat', savedChat)

                //SomeOne is typing

                socket.on('typing', (user) => {
                    socket.broadcast.to(room).emit('notifyTyping', user)
                })

                //Recieving the msg             
                socket.on('newMsg', (comingdata) => {
                    data = {
                        msg: comingdata.msg,
                        from: comingdata.user,
                        time: Date.now()

                    }

                    chat.updateOne({ $or: [{ users: info }, { users: reverse }] }, {
                        //Saving the chat to mongodb
                        $push: {
                            chat: data
                        }
                    }, (err, res) => {
                        if (err) throw err;

                        io.to(room).emit('newMsg', data)
                    })
                })
            } else {

                let newData = new chat(completeData);
                newData.save((err, cb) => {
                    if (err) throw err;
                    let room = cb._id
                    socket.join(room)

                    //Recieving the msg             
                    socket.on('newMsg', (comingdata) => {
                        data = {
                            msg: comingdata.msg,
                            from: comingdata.user,
                            time: Date.now()
                        }

                        //SomeOne is typing

                        socket.on('typing', (user) => {
                            socket.broadcast.to(room).emit('notifyTyping', user)
                        })


                        chat.updateOne({ $or: [{ users: info }, { users: reverse }] }, {
                            //Saving the chat to mongodb
                            $push: {
                                chat: data
                            }
                        }, (err, res) => {
                            if (err) throw err;

                            //Emitting the mesage to the client the msg
                            io.to(room).emit('newMsg', data)
                        })
                    })
                })
            }

        })
    })

    //When the user disconnects
    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} left the chat`)
        // socket.broadcast.emit('userLeft',`${users[socket.id]} has left the chat`)

        mongoUser.updateOne({ email: `${users.email}` }, { $set: { status: 0 } }, (err, user) => {
            if (err) throw err
        })
    })
})

*/