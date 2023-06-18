import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";

export class NetworkedLobbyFindState extends State
{
	constructor()
	{
		super();
	}

	init(stateMachine)
	{
        console.log("Initialising NetworkedLobbyFindState...");

		this.stateMachine = stateMachine;

		console.log("NetworkedLobbyFindState is ready.");

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

		$(document).on("joinedLobby", () =>
		{
			this.stateMachine.changeState(new GameSetupState(true));
		});

		$(document).on("invalidLobbyId", () =>
		{
			console.error("LobbyId is invalid.");

			$("#lobbyCode, #play, #create").attr("disabled", null);
		});
	}

	cleanup()
	{
        console.log("Cleaning up NetworkedLobbyFindState...");

		$("#mainMenu").remove();

		console.log("NetworkedLobbyFindState cleaned up.");
	}
};