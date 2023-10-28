import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";

import { randomHex } from "../Colors.js";

export class LobbyWaitingState extends State
{
	constructor(lobby)
	{
		super();

        this.lobby = lobby;

        console.log(`Waiting for ${this.lobby.ownerId}'s lobby ${this.lobby.lobbyId}. We are client ${clientId}`, this.lobby);
	}

	init()
	{
		let waitingContainer = $("<div id='waitingContainer' class='beforeGameMenuContainer'>").appendTo($("body"));

        waitingContainer.append(`<h1 id="lobbyWaitText">Waiting for game to start</h1>`);

		let clientListContainer   = $("<div id='clientList'>").appendTo(waitingContainer);
		let gameSettingsContainer = $("<div id='gameSettings'>").appendTo(waitingContainer);

        if (this.lobby.ownerId == clientId)
        {
			gameSettingsContainer.append(`<input id="mapSizeX" value="5" inputmode="numeric" required />`);
			gameSettingsContainer.append(`<input id="mapSizeY" value="5" inputmode="numeric" required />`);

			//clientListContainer.append("<button id='addBot'>Add bot</button>");

            waitingContainer.append(`<button id="startGame">start game</button>`);

			$("#startGame").click({ lobby: this.lobby }, (event) => 
			{
				if (event.data.lobby.clients.length > 1)
					if (event.data.lobby.networked)
						socket.send(JSON.stringify({ 
							command: "startGame", 
							width: parseInt($("#mapSizeX").val()),
							height: parseInt($("#mapSizeY").val()) 
						}));
					else
						document.dispatchEvent(new CustomEvent("startGame", { detail: { 
							width: parseInt($("#mapSizeX").val()),
							height: parseInt($("#mapSizeY").val()) 
						} }));
				else
					console.warn("Skipping start game button press because there are not enough clients.");
			});
        }

		// this is a lobby client join, not when a client joins mid game
		$(document).on("startGame",   	   { lobby: this.lobby }, this.startGame);
		$(document).on("joinLobbyRequest", { lobby: this.lobby }, this.joinLobbyRequest);
		$(document).on("clientJoin",  	   { lobby: this.lobby }, this.clientJoin);
		$(document).on("clientLeave", 	   { lobby: this.lobby }, this.clientLeave);

		// TODO: send this when click ready checkbox socket.send(JSON.stringify({ command: "lobbyReady" }));
	}

	cleanup()
	{
		$("#waitingContainer").remove();

		$(document).off("startGame",   		 this.startGame);
		$(document).off("joinLobbyRequest",  this.joinLobbyRequest);
		$(document).off("clientJoin",  		 this.clientJoin);
		$(document).off("clientLeave", 		 this.clientLeave);
	}

	startGame(event)
	{
		const lobby = event.data.lobby;

		lobby.width = event.detail.width;
		lobby.height = event.detail.height;

		stateManager.changeState(new GameSetupState(lobby));
	}

	joinLobbyRequest(event)
	{
		if (event.data.lobby.ownerId == clientId)
		{
			console.log("sending joinLobbyAccept for client " + event.detail.requesterId);
			socket.send(JSON.stringify({ command: "joinLobbyAccept", requesterId: event.detail.requesterId, type: "player", name: "player", color: randomHex() }));
		}
	}

	clientJoin(event)
	{
		console.log(`Client ${event.detail.clientId} has joined the lobby.`);

		console.log(event.detail);

		event.data.lobby.clients.push({
			id: event.detail.clientId,
			type: event.detail.type,
			name: event.detail.name,
			ownedTerritories: 0,
			color: event.detail.color
		});

		console.log("New client list: ", event.data.lobby.clients);
	}

	clientLeave(event)
	{
		console.log(`Client ${event.detail.clientId} has left the lobby.`);

		event.data.lobby.clients.filter(client => client.id !== event.detail.clientId);

		console.log("New lobby client list: ", event.data.lobby.clients);
	}
};