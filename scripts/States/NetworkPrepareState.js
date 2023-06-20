import { State } from "./State.js";

import { Network } from "../Network.js";
import { NetworkLobbyFindState } from "./NetworkLobbyFindState.js";
import { MainMenuState } from "./MainMenuState.js";

export class NetworkLobbyPrepareState extends State
{
	constructor()
	{
		super();
	}

	init()
	{
        window.network = new Network();

        $(document).on("networkClientReady", () => {
            console.log("Server connection is ready, switching to lobby finder.");
            stateManager.changeState(new NetworkLobbyFindState());
        });

        $(document).on("serverConnectionFailed", () => {
            console.error("Failed to connect to server, going back to main menu.");
            stateManager.changeState(new MainMenuState());
        });

        network.attemptConnection();
	}
};