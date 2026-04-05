const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = 0;
let count = 0;


function logToFile(data) {
	fs.appendFileSync("connections.log", JSON.stringify(data) + "\n");
}

io.on("connection", (socket) => {

    const ip =
	socket.handshake.headers["x-forwarded-for"]?.split(",")[0] ||
	socket.handshake.address ||
	socket.handshake.headers["user-agent"];

    players++;
    console.log("Player connected:", players);

    socket.on("clickp", () => {
        count++;
	io.emit("update", count); // broadcast to all players
    });

    
    socket.on("clickn", () => {
        count--;
	io.emit("update", count); // broadcast to all players
    });

    socket.on("chat message", (data) => {
     io.emit("chat message", data);


    });

	const logEntry = {
	   time: new Date().toISOString(),
	   event: "connect",
	   socketId: socket.id,
	   ip: ip
	};

	console.log("Client data:", ip);	

	logToFile(logEntry);	

    socket.on("disconnect", () => {
        logToFile({
	    time: new Date().toISOString(),
	    event: "disonnect",
	    socketId: socket.id
	});

	players--;
    });
});

http.listen(3000, () => {
    console.log("Running on http://localhost:3000");
});
