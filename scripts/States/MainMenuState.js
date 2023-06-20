import { State } from "./State.js";

import { GameSetupState } from "./GameSetupState.js";
import { NetworkLobbyPrepareState } from "./NetworkLobbyPrepareState.js";

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

		$("#playLocal")[0].onclick = () => { stateManager.changeState(new GameSetupState({ networked: false, lobby: { clientId: clientId } })) };
		$("#playNetworked")[0].onclick = () => { stateManager.changeState(new NetworkLobbyPrepareState()) };
	}

	cleanup()
	{
		$("#mainMenu").remove();
		$("#mainMenuStyles").remove();
	}
};