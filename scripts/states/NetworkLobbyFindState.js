import { State } from "./State.js";

import { LobbyWaitingState } from "./LobbyWaitingState.js";

import { randomHex } from "../Colors.js";

export class NetworkLobbyFindState extends State
{
	init()
	{
        let lobbyFindMenu = $(`<div id="lobbyFindMenu" class="beforeGameMenuContainer">`).appendTo($("body"));

        lobbyFindMenu.append("<input id='lobbyCode' placeholder='Enter lobby code' />");
		lobbyFindMenu.append("<button id='join'>Join</button>");
		lobbyFindMenu.append("<button id='create'>Create</button>");

		// TODO: set a timeout so that after a few seconds if the request is not accepted we can try again
        $("#join").click(() =>
        {
			$("#lobbyCode, #join, #create").attr("disabled", true);
			
			const lobbyId = $("#lobbyCode").val();
		
			const response = JSON.stringify({ command: "joinLobbyRequest", lobbyId: lobbyId });

			network.socket.send(response);

			console.log("Requested to join lobby " + lobbyId);
        });

        $("#create").click(() =>
        {
			$("#lobbyCode, #join, #create").attr("disabled", true);
			
			const lobbyId = $("#lobbyCode").val();
		
			// TODO: I'd like to not specify client attributes here, but it has to be done
			// because this is where the first client connects.
			const response = JSON.stringify({ 
				command: "createLobby",
				lobbyId: lobbyId,
				type: "player",
				name: "player",
				color: randomHex(),
			});

			network.socket.send(response);
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
		console.error("Our request to join the lobby was denied.");

		$("#lobbyCode, #join, #create").attr("disabled", null);
	};

	invalidLobbyId()
	{
		console.error("LobbyId is invalid.");

		$("#lobbyCode, #join, #create").attr("disabled", null);
	}
};