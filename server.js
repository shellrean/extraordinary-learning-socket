const express = require('express')
const bodyParser = require('body-parser')
const http = require('http');
const axios = require('axios')

const app = express();

app.use(bodyParser.json());

let io = require('socket.io').listen(app.listen(3000));

io.sockets.on('connection', function(socket) {
	/**
	  * Get current user list in room
	  *
	  * @emit monit
	  */
	socket.on('monitor', function(payload) {
		let socs = io.sockets.connected;
		io.of('/').in(payload.channel).clients((error, clients) => {
			if (error) throw error;
			let client_rooms = Object.values(clients);

			io.in(socket.channel).emit('monit', Object.values(socs).filter(item => item.channel != null && client_rooms.indexOf(item.id) != -1).map(item => item.user))
		});
	})

	/**
	 * Assign user to room
	 *
	 * @emit is_online
	 */
	socket.on('getin', function(payload) {
		socket.user = payload.user
		socket.channel = payload.channel
		socket.token = payload.token

		socket.join(socket.channel)
		// console.log((typeof socket.user != 'undefined' ? socket.user.email : 'Anonymous')+' Join to '+socket.channel)
		io.in(socket.channel).emit(`is_online`, payload.user);
	})

	/**
	 * Assign comment user to room
	 *
	 * @emit comment
	 */
	socket.on('comment', function(payload) {
		io.in(socket.channel).emit('comment',payload.comment)
	})

	/**
	 * Close classroom live
	 *
	 * @emmit close
	 */
	 socket.on('close_classroom', function() {
	 	io.in(socket.channel).emit('close_classroom')
	 })

	/**
	 * Disconnect user to room
	 *
	 * @emit is_offline
	 */
	socket.on('disconnect', function(username) {
		io.in(socket.channel).emit('is_offline', socket.user);
		socket.leave(socket.channel);
	})

	/**
	 * Exit user to room
	 *
	 * @emit is_offline
	 */
	socket.on('exit', function(payload) {
		// console.log((typeof socket.user != 'undefined' ? socket.user.email : 'Anonymous')+' leave from '+socket.channel)
		io.in(socket.channel).emit('is_offline', socket.user);
		socket.leave(socket.channel);
	})
})

console.log('Server run on port 3000')