import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";
			
import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Game      } from "../Game.js";
import { State          } from "./State.js";
import { StateMachine   } from "./StateMachine.js";
import { MainMenuState  } from "./MainMenuState.js";
import { UnitDropState  } from "./UnitDropState.js";

export class GameSetupState extends State
{
	constructor(data)
	{
		super();

		this.networked = data.networked;
		this.lobby     = data.lobby;
	}

	init(stateMachine)
	{
		this.stateMachine = stateMachine;

		$(document).on("serverDisconnected", () =>
		{
			this.stateMachine.changeState(new MainMenuState());
		});

		$("body").append(
		`<div class='gameInterfaceContainer transition-quick'>
	        <div class='gameStatus moveableInterfaceElement' data-state='0'>
	            <div id='me'>
	                <div id='playerPortrait'></div>
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
	    </div>`
		);

		window.scene = new THREE.Scene();
		window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		const cameraPosition = new THREE.Vector3(5 + 0.3 * 5, 5 + 0.3 * 5, 14);

		window.renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x256d8f);
		document.body.appendChild(renderer.domElement);

		window.htmlRenderer = new CSS2DRenderer();
		htmlRenderer.setSize(window.innerWidth, window.innerHeight);
		htmlRenderer.domElement.style.position = 'absolute';
		htmlRenderer.domElement.style.top = '0px';
		document.body.appendChild(htmlRenderer.domElement).style.pointerEvents = "none";

		window.stateManager = new StateMachine(renderer, htmlRenderer);

		let raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2, INTERSECTED;

		const clock = new THREE.Clock();

		window.addEventListener('resize', onWindowResize);

		document.addEventListener('keydown', onKeyDown);
		//document.addEventListener('keyup', onKeyUp);

		document.addEventListener('mousedown', onMouseDown);
		//document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mousemove', onPointerMove);

		window.game = new Game(this.networked, this.lobby);

		scene.add(game.world);

		$("#nextStateButton").click(function(event)
		{
			event.preventDefault();
			
			document.dispatchEvent(new CustomEvent("clientNextStage"));
		});

		function onMouseDown(event)
		{
			if (INTERSECTED == null)
				return;
				
			stateManager.onMouseDown(event, INTERSECTED);
		}

		function onKeyDown(event)
		{
			stateManager.onKeyDown(event);
			
			if (event.code == "Space")
				$("#nextStateButton").click();
		}

		function onPointerMove(event)
		{
			pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}

		function onWindowResize()
		{
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
			htmlRenderer.setSize(window.innerWidth, window.innerHeight);
		}

		function animate()
		{
			requestAnimationFrame(animate);
			
			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(scene.children, true);

			if (intersects.length > 0)
			{
				if (INTERSECTED != intersects[0].object)
				{
					if (INTERSECTED) // the object is no longer hovered, and we're hovering over another object
					{
						stateManager.onStopHover(INTERSECTED);
						INTERSECTED = null;
					}

					if (intersects[0].object.userData.hasOwnProperty("canClick")) // the object is now hovered
					{
						INTERSECTED = intersects[0].object;
						stateManager.onHover(INTERSECTED);
					}
				}
			}
			else if (INTERSECTED !== null)// the object is no longer hovered, and no object is hovered
			{
				stateManager.onStopHover(INTERSECTED);
				INTERSECTED = null;
			}
			
			stateManager.update(clock.getElapsedTime());
			
			game.world.update(clock.getElapsedTime());
			
			camera.position.lerp(cameraPosition, 0.2);
			
			renderer.render(scene, camera);
			htmlRenderer.render(scene, camera);
		};

		animate();

		stateManager.pushState(new UnitDropState(Math.round(game.world.ownedTerritories / 3)));
	}
}