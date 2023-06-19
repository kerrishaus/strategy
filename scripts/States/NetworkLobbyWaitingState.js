import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";

export class NetworkLobbyWaitingState extends State
{
	constructor(lobbyInfo)
	{
		super();

        this.ownerId = lobbyInfo.owner;
        this.lobbyId = lobbyInfo.lobbyId;

        console.log(`Waiting for ${this.ownerId}'s lobby ${this.lobbyId}. We are client ${window.network.clientId}`);
	}

	init(stateMachine)
	{
        console.log("Initialising NetworkLobbyFindState...");

		this.stateMachine = stateMachine;

		console.log("NetworkLobbyFindState is ready.");

        $("body").append(`<h1 id="lobbyWaitText">Waiting for game to start</h1>`);

        if (this.ownerId == network.clientId)
        {
            $("body").append(`<button id="startGame">start game</button>`);

            // TODO: don't send request if there are not enough players
            $("#startGame").click(function()
            {
                socket.send(JSON.stringify({ command: "startGame" }));
            });
        }

		$(document).on("startGame", { ownerId: this.ownerId }, (event) =>
		{
			this.stateMachine.changeState(new GameSetupState({ networked: true, ownerId: event.data.ownerId }));
		});
	}

	cleanup()
	{
        console.log("Cleaning up NetworkLobbyFindState...");

		$("#lobbyWaitText, #startGame").remove();

		console.log("NetworkLobbyFindState cleaned up.");
	}
};