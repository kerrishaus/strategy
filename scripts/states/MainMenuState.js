import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";
import { NetworkPrepareState } from "./NetworkPrepareState.js";

import { randomHex } from "../Colors.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

export class MainMenuState extends State
{
	constructor()
	{
		super();
	}

	init()
	{
        $("head").append(`<link rel='stylesheet' id="mainMenuStyles" href='./assets/styles/mainMenu.css' />`);

        $("body").append(`<div id="mainMenu">`);
        $("#mainMenu").append("<button id='playLocal'>play locally</button><button id='playNetworked'>play networked</button>");

		$("#playLocal")[0].onclick = () => {
			stateManager.changeState(new GameSetupState({
				networked: false,
				 lobby: { 
					width: 5 + getRandomInt(5),
					height: 5 + getRandomInt(5),
					clientId: clientId,
					ownerId: clientId,
					clients: [
						{
							id: clientId,
							type: "player",
							name: "Player",
							ownedTerritories: 0,
							color: randomHex()
						},
						{
							id: clientId + 2,
							type: "bot",
							name: "Bot",
							ownedTerritories: 0,
							color: randomHex()
						},
						{
							id: clientId + 4,
							type: "bot",
							name: "Bot",
							ownedTerritories: 0,
							color: randomHex()
						},
						{
							id: clientId + 6,
							type: "bot",
							name: "Bot",
							ownedTerritories: 0,
							color: randomHex()
						}
					]
				}
			})) 
		};

		$("#playNetworked")[0].onclick = () => {
			stateManager.changeState(new NetworkPrepareState())
		};
	}

	cleanup()
	{
		$("#mainMenu").remove();
		$("#mainMenuStyles").remove();
	}
};