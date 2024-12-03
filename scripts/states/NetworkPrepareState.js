import { State } from "./State.js";

import { Network } from "../Network.js";
import { NetworkLobbyFindState } from "./NetworkLobbyFindState.js";
import { MainMenuState } from "./MainMenuState.js";

export class NetworkPrepareState extends State
{
	init()
	{
		$("head").append("<link rel='stylesheet' id='networkPrepareStyles' href='./styles/NetworkPrepareState.css' />");

	        $("body").prepend(
	           `<div id="networkPrepare">
		    	<progress></progress>
		    	<h1 id="progressText">Establishing connection...</h1>
	            </div>`
	        );
		
	        window.network = new Network();
	
	        // TODO: rename networkClientReady to networkConnectionSuccess
	        $(document).on("networkClientReady", () => {
	            console.log("Server connection is ready, switching to lobby finder.");
	            stateManager.changeState(new NetworkLobbyFindState());
	        });
	
	        $(document).on("networkConnectionFailed", () => {
	            console.error("Failed to connect to server, going back to main menu.");
	            stateManager.changeState(new MainMenuState());
	        });

		$(document).on("serverSocketError", () => {
			$("#progressText").text(`Attempt ${network.connectionRetryCount} of ${network.connectionRetryLimit} failed.`);
	        });
	
	        network.attemptConnection();
	}

	cleanup()
	{
		$("#networkPrepare").remove(); 
		$("#networkPrepareStyles").remove();
	}
};
