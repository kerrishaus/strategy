import { Game  } from "../Game.js";
import { State } from "./State.js";

import * as Colors from "../Colors.js";

export class GameSetupState extends State
{
	constructor(lobby)
	{
		super();

		this.lobby = lobby;
	}

	init()
	{
		$("body").append(
		`<div class='gameInterfaceContainer transition-quick'>
	        <div class='gameStatus moveableInterfaceElement' data-state='0'>
	            <div id='me'>
	                <!--<div id='playerPortrait'></div>-->
	            </div>
	            <div id='roundStatus'>
	                <div>
	                    <span id='flag'></span>
	                    <span id='playerName'>Super Idiot</span>
	                    <span id='tags'>&#10004;</span>
	                </div>
	                <div id='roundType'>
	                    <div class='roundSpace'>Place</div>
	                    <div class='roundSpace'>Attack</div>
	                    <div class='roundSpace'>Move</div>
	                </div>
                    <button id='nextStateButton' class='moveableInterfaceElement'>
                        next state
                    </button>
	            </div>
	            <div id='counter'>
	                <div id='statue'>
	                    
	                </div>
	                <div id='count'>
	                    
	                </div>
	            </div>
	        </div>
            <div class='attackPlanner'>
                <div class='cancelButton moveableInterfaceElement'>
                    <button id='attackPlannerCancelButton'>cancel</button>
                </div>
                <div class='attacker moveableInterfaceElement'>
                    <h1>Attacking</h1>
                    <!--<div style='width: 400px;height: 500px;background-color:red;border-radius:10px;'>-->
                    <div class=''>
                        <span id='attackerCount'></span>
                    </div>
                </div>
                <div>
                    <h1>vs</h1>
                </div>
                <div class='defender moveableInterfaceElement'>
                    <h1>Defending</h1>
                    <!--<div style='width: 400px;height: 500px;background-color:blue;border-radius:10px;'>-->
                    <div class=''>
                        <span id='defenderCount'></span>
                    </div>
                </div>
                <div class='attackGoButton moveableInterfaceElement'>
                    <button id='attackPlannerGoButton'>Go!</button>
                </div>
            </div>
            <div id='gameWin'>
                <h1>You are victorious!</h1>
                <button id='replayGame'>Replay</button>
            </div>
			<div id='gameLose'>
                <h1>You have been defeated!</h1>
                <button id='replayGame'>Replay</button>
            </div>
			<!--
			<div id="networkControls">
				<div id="networkOnline">
					<h1>You are connected to the network.</h1>
				</div>
				<div id="networkStatus">
					<h1>The network is online.</h1>
				</div>
			</div>
			-->
	    </div>
		`);

		console.warn("Creating a new game instance with lobby", this.lobby);
		window.game = new Game(this.lobby);
		scene.add(game.world);

		$("#nextStateButton").click(function(event)
		{
			event.preventDefault();
			
			document.dispatchEvent(new CustomEvent("requestNextStage"));
		});

		function gameAnimate()
        {
            requestAnimationFrame(window.animationFunction);
            
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0)
            {
                if (INTERSECTED != intersects[0].object)
                {
                    if (INTERSECTED) // the object is no longer hovered, and we're hovering over another object
                    {
                        stateManager.forwardEvent(new CustomEvent("objectHoverStop", { detail: { object: INTERSECTED } }));
                        INTERSECTED = null;
                    }

                    if (intersects[0].object.userData.hasOwnProperty("canClick")) // the object is now hovered
                    {
                        INTERSECTED = intersects[0].object;
                        stateManager.forwardEvent(new CustomEvent("objectHover", { detail: { object: INTERSECTED } }));

                        $("#debug-lastHover").text(INTERSECTED.territoryId);
                        $("#debug-lastHoverOwner").text(INTERSECTED.userData.ownerId);
                        $("#debug-lastHoverOwnerColor").text(game.clients.getById(INTERSECTED.userData.ownerId)?.color ?? Colors.unownedColor);
                    }
                }
            }
            else if (INTERSECTED !== null)// the object is no longer hovered, and no object is hovered
            {
                stateManager.forwardEvent(new CustomEvent("objectHoverStop", { detail: { object: INTERSECTED } }));
                INTERSECTED = null;
            }
            
            stateManager.update(clock.getElapsedTime());
            
            game.world.update(clock.getElapsedTime());
            
            camera.position.lerp(cameraPosition, 0.01);
            camera.quaternion.slerp(cameraRotation, 0.01);
            
            renderer.render(scene, camera);
            htmlRenderer.render(scene, camera);
        };

		window.animationFunction = gameAnimate;

		if (networked)
			socket.send(JSON.stringify({ command: "gameReady" }));
	}
}