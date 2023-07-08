import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";

export class NetworkLobbyWaitingState extends State
{
	constructor(lobby)
	{
		super();

        this.lobby = lobby;

//		this.lobby.clients = [ this.lobby.ownerId ];

		console.log(`Client list of lobby we just joined: ${this.lobby.clients}`);

        console.log(`Waiting for ${this.lobby.ownerId}'s lobby ${this.lobby.lobbyId}. We are client ${clientId}`);
	}

	init()
	{
        $("body").append(`<h1 id="lobbyWaitText">Waiting for game to start</h1>`);

        if (this.lobby.ownerId == clientId)
        {
            $("body").append(`<button id="startGame">start game</button>`);

			$("#startGame").click({ lobby: this.lobby }, (event) => 
			{
				if (event.data.lobby.clients.length > 1)
					socket.send(JSON.stringify({ command: "startGame" }));
				else
					console.warn("Skipping start game button press because there are not enough clients.");
			});
        }

		// this is a lobby client join, not when a client joins mid game
		$(document).on("startGame",   { lobby: this.lobby }, this.startGame);
		$(document).on("clientJoin",  { lobby: this.lobby }, this.clientJoin);
		$(document).on("clientLeave", { lobby: this.lobby }, this.clientLeave);

		// TODO: send this when click ready checkbox socket.send(JSON.stringify({ command: "lobbyReady" }));
	}

	cleanup()
	{
		$("#lobbyWaitText, #startGame").remove();

		$(document).off("startGame",   this.startGame);
		$(document).off("clientJoin",  this.clientJoin);
		$(document).off("clientLeave", this.clientLeave);
	}

	startGame(event)
	{
		const lobby2 = event.data.lobby;

		lobby2.width = event.detail.width;
		lobby2.height = event.detail.height;

		stateManager.changeState(new GameSetupState({ networked: true, lobby: lobby2 }));
	}

	clientJoin(event)
	{
		console.log(`Client ${event.detail.clientId} has joined the lobby.`);

		event.data.lobby.clients.push(event.detail.clientId);

		console.log("New client list: ", event.data.lobby.clients);
	}

	clientLeave(event)
	{
		console.log(`Client ${event.detail.clientId} has left the lobby.`);

		event.data.lobby.clients.filter(clientId => clientId !== event.detail.clientId);

		console.log("New lobby client list: ", event.data.lobby.clients);
	}
};