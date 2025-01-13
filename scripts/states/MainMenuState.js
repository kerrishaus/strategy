import { State } from "./State.js";

import { NetworkPrepareState } from "./NetworkPrepareState.js";

import { randomHex } from "../Colors.js";

import { LobbyWaitingState } from "./LobbyWaitingState.js";

export class MainMenuState extends State
{
	init()
	{
        $("body").append(`<div id="mainMenu" class="beforeGameMenuContainer"">`);
        $("#mainMenu").append("<button id='singleplayer'>Singleplayer</button>");
		$("#mainMenu").append("<button id='multiplayer' >Multiplayer</button>");

		$("#singleplayer").click(() => {
			window.clientId = 1;
			$("#debug-clientId").text(clientId);

			stateManager.changeState(new LobbyWaitingState({
				id: "local",
				clientId: clientId,
				ownerId: clientId,
				networked: false,
				clients: [
					{
						id: clientId,
						type: "player",
						name: "Player",
						ownedTerritories: 0,
						color: randomHex()
					}
				]
			})) 
		});

		$("#multiplayer").click(() => {
			stateManager.changeState(new NetworkPrepareState())
		});

		// TODO: setting the clientId should be a function that also updates the debug text etc.
		window.clientId = -1;
	}

	cleanup()
	{
		$("#mainMenu").remove();
	}
};