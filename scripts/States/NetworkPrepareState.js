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

	init(stateMachine)
	{
        console.log("Initialising NetworkLobbyPrepareState...");

		this.stateMachine = stateMachine;

		console.log("NetworkLobbyPrepareState is ready.");
        
        window.network = new Network();

        $(document).on("networkClientReady", () => {
            console.log("Server connection is ready, switching to lobby finder.");
			console.log(network.clientId);
            this.stateMachine.changeState(new NetworkLobbyFindState());
        });

        $(document).on("serverConnectionFailed", () => {
            console.error("Failed to connect to server, going back to main menu.");
            this.stateMachine.changeState(new MainMenuState());
        });

        network.attemptConnection();
	}

	cleanup()
	{
        console.log("Cleaning up NetworkLobbyPrepareState...");

		console.log("NetworkLobbyPrepareState cleaned up.");
	}
};