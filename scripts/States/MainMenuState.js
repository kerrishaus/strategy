import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";
import { NetworkLobbyFindState } from "./NetworkLobbyFindState.js";
import { NetworkLobbyPrepareState } from "./NetworkPrepareState.js";

export class MainMenuState extends State
{
	constructor()
	{
		super();
	}

	init(stateMachine)
	{
        console.log("Initialising MainMenuState...");

		this.stateMachine = stateMachine;

		console.log("MainMenuState is ready.");

        $("head").append(`<link rel='stylesheet' id="mainMenuStyles" href='./assets/styles/mainMenu.css' />`);

        $("body").append(`<div id="mainMenu">`);
        $("#mainMenu").append("<button id='playLocal'>play locally</button><button id='playNetworked'>play networked</button>");

		$("#playLocal")[0].onclick = () => { this.stateMachine.changeState(new GameSetupState(false)) };
		$("#playNetworked")[0].onclick = () => { this.stateMachine.changeState(new NetworkLobbyPrepareState()) };
	}

	cleanup()
	{
        console.log("Cleaning up MainMenuState...");

		$("#mainMenu").remove();
		$("#mainMenuStyles").remove();

		console.log("MainMenuState cleaned up.");
	}
};