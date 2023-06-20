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
			stateManager.changeState(new GameSetupState({ networked: true, lobby: event.data.lobby }));
		});

		// TODO: send this when click ready checkbox socket.send(JSON.stringify({ command: "lobbyReady" }));
	}

	cleanup()
	{
		$("#lobbyWaitText, #startGame").remove();
	}
};