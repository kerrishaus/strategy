import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";
import { MainMenuState  } from "./MainMenuState.js";

import { randomHex } from "../Colors.js";

import * as PageUtility from "../PageUtility.js";

export class LobbyWaitingState extends State
{
	init(lobby)
	{
		this.lobby = lobby;
		
		// FIXME: this is a hack
		// we have to manually create and set the ownedTerritories variable for the
		// first client that joins because it isn't handled by the joinClient function
		// and I don't want to worry about owned territory count on the server.
		// TODO: i think this can be removed. it is added in mainmenustate and in clientjoinevent
		this.lobby.clients[0].ownedTerritories = 0;
		
		$("#debug-lobbyId").text(this.lobby.id);
		$("#debug-lobbyOwnerId").text(this.lobby.ownerId);
		$("#debug-networked").text(this.lobby.networked);
		
		console.log(`Waiting in ${this.lobby.ownerId}'s lobby ${this.lobby.lobbyId}. We are client ${clientId}`, this.lobby);
		
		PageUtility.addStyle("LobbyWaitingState");

		let waitingContainer = $(`<div id="waitingContainer" class="beforeGameMenuContainer">`).appendTo($("body"));
		waitingContainer.append(`<h1 id="lobbyWaitText">Waiting for game to start</h1>`);

		let clientListContainer   = $(`<div>Clients:<div id="clientList"></div></div>`).appendTo(waitingContainer);
		let gameSettingsContainer = $(`<div id="gameSettings">`).appendTo(waitingContainer);

		gameSettingsContainer.append(`<label>Width</label><input class="game-setting" id="mapSizeX" value="5" inputmode="numeric" required />`);
		gameSettingsContainer.append(`<label>Height</label><input class="game-setting" id="mapSizeY" value="5" inputmode="numeric" required />`);
		
		if (!this.lobby.networked)
		{
			$(`<button class="game-setting" id="addBot">Add bot</button>`)
				.appendTo(clientListContainer)
				.click(() => { this.addBot(); });
		}

		waitingContainer.append(`<button class="game-setting" id="startGame">Start Game</button>`);

		$("#startGame").click({ lobby: this.lobby }, (event) => 
		{
			console.log("Requesting game start.");

			if (event.data.lobby.clients.length < 1)
			{
				console.warn("Skipping start game button press because there are not enough clients.");
				return false;
			}

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
		});

		$(`<button id="back">Back to Main Menu</button>`)
			.appendTo(waitingContainer)
			.click(() => {
				// TODO: this will cause a problem in multiplayer. there is no handling for disconnecting from the lobby/websocket server
				stateManager.changeState(new MainMenuState());
			});

		// all game controls and their events exist on every client's side
		// just disable them for everybody but the host.
		// server will verify commands
		if (this.lobby.ownerId != clientId)
			$(".game-setting").attr("disabled", true);

		this.updateClientList(this.lobby);

		$(document).on("startGame",   	   (event) => { this.startGame(event); });
		$(document).on("joinLobbyRequest", (event) => { this.joinLobbyRequest(event); });
		$(document).on("clientJoin",  	   (event) => { this.clientJoin(event); });
		$(document).on("clientLeave", 	   (event) => { this.clientLeave(event); });

		// TODO: send this when click ready checkbox network.socket.send(JSON.stringify({ command: "lobbyReady" }));
	}

	cleanup()
	{
		$("#waitingContainer").remove();

		PageUtility.removeStyle("LobbyWaitingState");

		$(document).off("startGame");
		$(document).off("joinLobbyRequest");
		$(document).off("clientJoin");
		$(document).off("clientLeave");
	}

	startGame(event)
	{
		this.lobby.width = event.detail.width;
		this.lobby.height = event.detail.height;

		stateManager.changeState(new GameSetupState(this.lobby));
	}

	joinLobbyRequest(event)
	{
		// automatically accept any client's request to join for now.
		if (this.lobby.ownerId == clientId)
		{
			console.log(`Sending joinLobbyAccept for client ${event.detail.requesterId}`);

			network.socket.send(JSON.stringify({ 
				command: "joinLobbyAccept",
				requesterId: event.detail.requesterId,
				type: "player",
				name: "player",
				color: randomHex()
			}));
		}
	}

	clientJoin(event)
	{
		console.log(`Client ${event.detail.clientId} has joined the lobby.`, event);

		this.lobby.clients.push({
			id: event.detail.clientId,
			type: event.detail.type,
			name: event.detail.name,
			ownedTerritories: 0,
			color: event.detail.color
		});

		this.updateClientList();
	}

	clientLeave(event)
	{
		console.log(`Client ${event.detail.clientId} has left the lobby.`, event);

		this.lobby.clients.filter(client => client.id !== event.detail.clientId);

		this.updateClientList();
	}

	addBot()
	{
		this.lobby.clients.push({
			id: this.lobby.clients.length + 1,
			type: "Bot",
			name: "Botholamue",
			ownedTerritories: 0,
			color: randomHex()
		});

		console.log("Added bot to lobby.", this.lobby);

		this.updateClientList();
	}

	updateClientList()
	{
		console.log("Updating client list", this.lobby.clients);

		$("#clientList").empty();

		for (let client of this.lobby.clients)
			$("#clientList").append(`<div>${client.id}: ${client.name}</div>`);

		$("#debug-clientCount").text(this.lobby.clients.length);
	}
};