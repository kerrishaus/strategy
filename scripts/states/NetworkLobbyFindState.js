import { State } from "./State.js";

import { NetworkLobbyWaitingState } from "./NetworkLobbyWaitingState.js";

export class NetworkLobbyFindState extends State
{
	constructor()
	{
		super();
	}

	init()
	{
        $("body").append(`<div id="mainMenu">`);
        $("#mainMenu").append("<input id='lobbyCode' placeholder='lobby code' /><button id='join'>join</button><button id='create'>create</button>");

		// TODO: set a timeout so that after a few seconds if the request is not accepted we can try again
        $("#join").click(() =>
        {
			this.disableButtons();
			
			const lobbyId = $("#lobbyCode").val();
		
			const response = JSON.stringify({ command: "joinLobbyRequest", lobbyId: lobbyId });

			socket.send(response);

			console.log("Requested to join lobby " + lobbyId);
        });

        $("#create").click(() =>
        {
			this.disableButtons();
			
			const lobbyId = $("#lobbyCode").val();
		
			const response = JSON.stringify({ command: "createLobby", lobbyId: lobbyId });

			socket.send(response);
        });

		$(document).on("joinLobbyAccept", this.joinLobbyAccept);
		$(document).on("joinLobbyDeny",   this.joinLobbyDeny);
		$(document).on("invalidLobbyId",  this.invalidLobbyId);
	}

	cleanup()
	{
		$("#mainMenu").remove();

		$(document).off("joinLobbyAccept", this.joinLobbyAccept);
		$(document).off("joinLobbyDeny",   this.joinLobbyDeny);
		$(document).off("invalidLobbyId",  this.invalidLobbyId);
	}

	disableButtons()
	{
		$("#lobbyCode, #join, #create").attr("disabled", true);
	}

	enableButtons()
	{
		$("#lobbyCode, #join, #create").attr("disabled", null);
	}

	joinLobbyAccept(event)
	{
		stateManager.changeState(new NetworkLobbyWaitingState(event.detail));
	}

	joinLobbyDeny()
	{
		console.error("Our request to join the lobby was denied.");

		this.enableButtons();
	};

	invalidLobbyId()
	{
		console.error("LobbyId is invalid.");

		this.enableButtons();
	}
};