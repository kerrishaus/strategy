import { State } from "./State.js";

import { Network } from "../Network.js";
import { NetworkedLobbyFindState } from "./NetworkedLobbyFindState.js";
import { MainMenuState } from "./MainMenuState.js";

export class NetworkedLobbyPrepareState extends State
{
	constructor()
	{
		super();
	}

	init(stateMachine)
	{
        console.log("Initialising NetworkedLobbyPrepareState...");

		this.stateMachine = stateMachine;

		console.log("NetworkedLobbyPrepareState is ready.");
        
        window.network = new Network();

        $(document).on("serverConnected", () => {
            console.log("Server connection is ready, switching to lobby finder.");
            this.stateMachine.changeState(new NetworkedLobbyFindState());
        });

        $(document).on("serverConnectionFailed", () => {
            console.error("Failed to connect to server, going back to main menu.");
            this.stateMachine.changeState(new MainMenuState());
        });

        network.attemptConnection();
	}

	cleanup()
	{
        console.log("Cleaning up NetworkedLobbyPrepareState...");

		console.log("NetworkedLobbyPrepareState cleaned up.");
	}
};