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
        $("#mainMenu").append("<input id='lobbyCode' placeholder='lobby code' /><button id='play'>play</button><button id='create'>create</button>");

        $("#play").click(() =>
        {
			$("#lobbyCode, #play, #create").attr("disabled", true);
			
			const lobbyId = $("#lobbyCode").val();
		
			const response = JSON.stringify({ command: "joinLobby", lobbyId: lobbyId });

			socket.send(response);
        });

        $("#create").click(() =>
        {
			$("#lobbyCode, #play, #create").attr("disabled", true);
			
			const lobbyId = $("#lobbyCode").val();
		
			const response = JSON.stringify({ command: "createLobby", lobbyId: lobbyId });

			socket.send(response);
        });

		$(document).on("joinedLobby", (event) =>
		{
			stateManager.changeState(new NetworkLobbyWaitingState(event.detail));
		});

		$(document).on("invalidLobbyId", () =>
		{
			console.error("LobbyId is invalid.");

			$("#lobbyCode, #play, #create").attr("disabled", null);
		});
	}

	cleanup()
	{
		$("#mainMenu").remove();
	}
};