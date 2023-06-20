import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";

export class NetworkLobbyWaitingState extends State
{
	constructor(lobby)
	{
		super();

        this.lobby = lobby;

        console.log(`Waiting for ${this.lobby.ownerId}'s lobby ${this.lobby.lobbyId}. We are client ${clientId}`);
	}

	init()
	{
        console.log("Initialising NetworkLobbyFindState...");

		console.log("NetworkLobbyFindState is ready.");

        $("body").append(`<h1 id="lobbyWaitText">Waiting for game to start</h1>`);

        if (this.lobby.ownerId == clientId)
        {
            $("body").append(`<button id="startGame">start game</button>`);

            // TODO: don't send request if there are not enough players
            $("#startGame").click(function()
            {
                socket.send(JSON.stringify({ command: "startGame" }));
            });
        }

		$(document).on("startGame", { lobby: this.lobby }, (event) =>
		{
			this.stateMachine.changeState(new GameSetupState({ networked: true, lobby: event.data.lobby }));
		});

		// TODO: send this when click ready checkbox socket.send(JSON.stringify({ command: "lobbyReady" }));
	}

	cleanup()
	{
        console.log("Cleaning up NetworkLobbyFindState...");

		$("#lobbyWaitText, #startGame").remove();

		console.log("NetworkLobbyFindState cleaned up.");
	}
};