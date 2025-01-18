import { State } from "./State.js";

import { NetworkPrepareState } from "./NetworkPrepareState.js";

import { randomHex } from "../Colors.js";

import { LobbyWaitingState } from "./LobbyWaitingState.js";

export class MainMenuState extends State
{
	init()
	{
		if ("network" in window)
			// TODO: delete network object
			network.resetNetwork();

		window.clientId = 1;

        $("body").append(`<div id="mainMenu" class="beforeGameMenuContainer"">`);
        $("#mainMenu").append("<button id='singleplayer'>Singleplayer</button>");
		$("#mainMenu").append("<button id='multiplayer' >Multiplayer</button>");

		$("#singleplayer").click(() => {
			stateManager.changeState(new LobbyWaitingState({
				id: "local",
				clientId: clientId,
				ownerId: clientId,
				networked: false,
				clients: [
					{
						id: clientId,
						type: "player",
						name: "Local Player",
						ownedTerritories: 0,
						color: randomHex()
					}
				]
			})) 
		});

		$("#multiplayer").click(() => {
			stateManager.changeState(new NetworkPrepareState())
		});
	}

	cleanup()
	{
		$("#mainMenu").remove();
	}
};