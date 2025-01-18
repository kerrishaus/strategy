import { State } from "./State.js";

import { LobbyWaitingState } from "./LobbyWaitingState.js";
import { MainMenuState } from "./MainMenuState.js";

import { randomHex } from "../Colors.js";

export class NetworkLobbyFindState extends State
{
	init()
	{
        let lobbyFindMenu = $(`<div id="lobbyFindMenu" class="beforeGameMenuContainer">`).appendTo($("body"));

        lobbyFindMenu.append("<input id='lobbyCode' placeholder='Enter lobby code' />");

		// TODO: set a timeout so that after a few seconds if the request is not accepted we can try again
		$("<button id='join'>Join</button>")
			.appendTo(lobbyFindMenu)
			.click(() =>
			{
				$("#lobbyCode, #join, #create").attr("disabled", true);
				
				const lobbyId = $("#lobbyCode").val();
			
				network.socket.send(JSON.stringify({
					command: "joinLobbyRequest", 
					lobbyId: lobbyId
				}));

				console.log("Requested to join lobby " + lobbyId);
			});

		$("<button id='create'>Create</button>")
			.appendTo(lobbyFindMenu)
        	.click(() =>
			{
				$("#lobbyCode, #join, #create").attr("disabled", true);
				
				const lobbyId = $("#lobbyCode").val();
			
				// TODO: I'd like to not specify client attributes here, but it has to be done
				// because this is where the first client connects.
				const response = JSON.stringify({ 
					command: "createLobby",
					lobbyId: lobbyId,
					type: "player",
					name: window.clientName,
					color: randomHex(),
				});

				network.socket.send(response);
			});

		$(`<button id="back">Back to Main Menu</button>`)
			.appendTo(lobbyFindMenu)
			.click(() => {
				// TODO: this will cause a problem in multiplayer. there is no handling for disconnecting from the lobby/websocket server
				stateManager.changeState(new MainMenuState());
			});

		$(document).on("joinLobbyAccept", this.joinLobbyAccept);
		$(document).on("joinLobbyDeny",   this.joinLobbyDeny);
		$(document).on("invalidLobbyId",  this.invalidLobbyId);
	}

	cleanup()
	{
		$("#lobbyFindMenu").remove();

		$(document).off("joinLobbyAccept", this.joinLobbyAccept);
		$(document).off("joinLobbyDeny",   this.joinLobbyDeny);
		$(document).off("invalidLobbyId",  this.invalidLobbyId);
	}

	joinLobbyAccept(event)
	{
		stateManager.changeState(new LobbyWaitingState(event.detail));
	}

	joinLobbyDeny()
	{
		alert("Join request denied.");

		console.error("Our request to join the lobby was denied.");

		$("#lobbyCode, #join, #create").attr("disabled", null);
	};

	invalidLobbyId()
	{
		alert("Lobby ID is invalid.");

		console.error("LobbyId is invalid.");

		$("#lobbyCode, #join, #create").attr("disabled", null);
	}
};