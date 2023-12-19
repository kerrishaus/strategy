import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";
import { MainMenuState  } from "./MainMenuState.js";

import { randomHex } from "../Colors.js";

export class LobbyWaitingState extends State
{
	init(lobby)
	{
		this.lobby = lobby;
	
		// FIXME: this is a hack
		// we have to manually create and set the ownedTerritories variable for the
		// first client that joins because it isn't handled by the joinClient function
		// and I don't want to worry about owned territory count on the server.
		this.lobby.clients[0].ownedTerritories = 0;
	
		$("#debug-lobbyId").text(this.lobby.id);
		$("#debug-lobbyOwnerId").text(this.lobby.ownerId);
		$("#debug-networked").text(this.lobby.networked);
	
		console.log(`Waiting for ${this.lobby.ownerId}'s lobby ${this.lobby.lobbyId}. We are client ${clientId}`, this.lobby);

		$("head").append(`<link rel='stylesheet' id="lobbyWaitingStyles" href='./styles/LobbyWaitingState.css' />`);

		let waitingContainer = $("<div id='waitingContainer' class='beforeGameMenuContainer'>").appendTo($("body"));

        waitingContainer.append(`<h1 id="lobbyWaitText">Waiting for game to start</h1>`);

		let clientListContainer   = $("<div id='clientList'>").appendTo(waitingContainer);
		let gameSettingsContainer = $("<div id='gameSettings'>").appendTo(waitingContainer);

        if (this.lobby.ownerId == clientId)
        {
			gameSettingsContainer.append(`<label>Width</label><input id="mapSizeX" value="5" inputmode="numeric" required />`);
			gameSettingsContainer.append(`<label>Height</label><input id="mapSizeY" value="5" inputmode="numeric" required />`);

			if (!this.lobby.networked)
			{
				$("<button id='addBot'>Add bot</button>").appendTo(clientListContainer)
					.click({ lobby: this.lobby }, this.addBot);
			}

            waitingContainer.append(`<button id="startGame">Start Game</button>`);

			waitingContainer.append(`<button id="back">Back to Main Menu</button>`);

			$("#startGame").click({ lobby: this.lobby }, (event) => 
			{
				if (event.data.lobby.clients.length > 1)
					if (event.data.lobby.networked)
						network.socket.send(JSON.stringify({ 
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

		// TODO: I think work needs to be done to allow this for a networked lobby,
		// because once you are in a lobby waiting state you're connected to the websocket server.
		// we will need to shutdown the connection to the websocket server for this event.
		if (!this.lobby.networked)
			$("#back").click(() => {
				stateManager.changeState(new MainMenuState());
			});

		$(document).on("startGame",   	   { lobby: this.lobby }, this.startGame);
		$(document).on("joinLobbyRequest", { lobby: this.lobby }, this.joinLobbyRequest);
		$(document).on("clientJoin",  	   { lobby: this.lobby }, this.clientJoin);
		$(document).on("clientLeave", 	   { lobby: this.lobby }, this.clientLeave);

		// TODO: send this when click ready checkbox network.socket.send(JSON.stringify({ command: "lobbyReady" }));
	}

	cleanup()
	{
		$("#waitingContainer, #lobbyWaitingStyles").remove();

		$(document).off("startGame",   		this.startGame);
		$(document).off("joinLobbyRequest", this.joinLobbyRequest);
		$(document).off("clientJoin",  		this.clientJoin);
		$(document).off("clientLeave", 		this.clientLeave);
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
			network.socket.send(JSON.stringify({ command: "joinLobbyAccept", requesterId: event.detail.requesterId, type: "player", name: "player", color: randomHex() }));
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

		//updateClientList(event.data.lobby);
	}

	clientLeave(event)
	{
		console.log(`Client ${event.detail.clientId} has left the lobby.`);

		event.data.lobby.clients.filter(client => client.id !== event.detail.clientId);

		console.log("New lobby client list: ", event.data.lobby.clients);

		//updateClientList(event.data.lobby);
	}

	addBot(event)
	{
		event.data.lobby.clients.push({
			id: event.data.lobby.clients.length + 1,
			type: "Bot",
			name: "Botholamue",
			ownedTerritories: 0,
			color: randomHex()
		});
	}

	updateClientList(lobby)
	{
		console.log("updating client list");

		for (let client of lobby.clients)
			$("#clientList").append("client");
	}
};