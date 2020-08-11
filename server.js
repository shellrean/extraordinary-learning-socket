const express = require('express')
const bodyParser = require('body-parser')
const http = require('http');
const axios = require('axios')

const app = express();

app.use(bodyParser.json());

let io = require('socket.io').listen(app.listen(3000));

io.sockets.on('connection', function(socket) {
	socket.on('getin', function(payload) {

		socket.user = payload.user
		socket.channel = payload.channel
		socket.token = payload.token
		io.emit('is_online_'+socket.channel, payload.user);
	})

	socket.on('change_message', function(payload) {

	})

	socket.on('comment', function(payload) {
		io.emit('comment_'+socket.channel, payload.comment)
	})

	socket.on('disconnect', function(username) {
		io.emit('is_offline_'+socket.channel, socket.user);
		axios.post(`http://localhost:8000/api/v1/channels/0/user`, {}, {
			headers: {
				'Accept': 'application/json',
				'Authorization': `Bearer ${socket.token}` 
			}
		}).then((res) => {
			console.log(`statusCode: ${res.data.message}`)
		})
		.catch((err) => {
			console.log(err.response.data)
		})
	})

	socket.on('exit', function(payload) {
		io.emit('is_offline_'+socket.channel, socket.user);
		axios.post(`http://localhost:8000/api/v1/channels/0/user`, {}, {
			headers: {
				'Accept': 'application/json',
				'Authorization': `Bearer ${socket.token}` 
			}
		}).then((res) => {
			console.log(`statusCode: ${res.data.message}`)
		})
		.catch((err) => {
			console.log(err.response.data)
		})
	})
})
console.log('Server run on port 3000')