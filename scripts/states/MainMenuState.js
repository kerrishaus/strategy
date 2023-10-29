import { State } from "./State.js";

import { NetworkPrepareState } from "./NetworkPrepareState.js";

import { randomHex } from "../Colors.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";
import { LobbyWaitingState } from "./LobbyWaitingState.js";

export class MainMenuState extends State
{
	constructor()
	{
		super();
	}

	init()
	{
        $("body").append(`<div id="mainMenu" class="beforeGameMenuContainer"">`);
        $("#mainMenu").append("<button id='singleplayer'>Singleplayer</button>");
		$("#mainMenu").append("<button id='multiplayer' >Multiplayer</button>");

		$("#singleplayer").click(() => {
			window.clientId = 1;
			$("#debug-clientId").text(clientId);

			stateManager.changeState(new LobbyWaitingState({
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
	}

	cleanup()
	{
		$("#mainMenu").remove();
	}
};