import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { OrbitControls } from "https://kerrishaus.com/assets/threejs/examples/jsm/controls/OrbitControls.js";

import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { Game  } from "../Game.js";
import { State } from "./State.js";

import * as Colors from "../Colors.js";
import { ControllableCamera } from "../ControllableCamera.js";
import { WorldObject } from "../WorldObject.js";

export class GameSetupState extends State
{
	init(lobby)
	{
		this.lobby = lobby;

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

		window.scene = new THREE.Scene();
		window.camera = new ControllableCamera();
		
		window.renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x256d8f);
		document.body.appendChild(renderer.domElement);

		window.controls = new OrbitControls(camera, renderer.domElement);
		controls.minPolarAngle = 0;
		controls.maxPolarAngle = 1.309;
		controls.minDistance = 10;
		controls.maxDistance = 30;
		controls.minTargetRadius = 0;
		controls.maxTargetRadius = 10;
		
		controls.target.set( 0, 0, 0 );
		camera.position.set( 0, 0, 0 );
		controls.update();

		window.htmlRenderer = new CSS2DRenderer();
		htmlRenderer.setSize(window.innerWidth, window.innerHeight);
		htmlRenderer.domElement.style.position = 'absolute';
		htmlRenderer.domElement.style.top = '0px';
		document.body.appendChild(htmlRenderer.domElement).style.pointerEvents = "none";

		let raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2, INTERSECTED = null;

		const clock = new THREE.Clock();

		window.addEventListener('resize', onWindowResize);

		document.addEventListener('keydown', onKeyDown);
		//document.addEventListener('keyup', onKeyUp);

		document.addEventListener('mousedown', onMouseDown);
		//document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mousemove', onPointerMove);

		console.log(this.lobby);

		console.warn("Creating a new game instance.");
		window.game = new Game(this.lobby);

		// make the object text face the camera
		$(controls).change((event) => {
			for (const worldObject of game.world.tiles)
				worldObject.text.rotation.z = controls.getAzimuthalAngle();
		});

		scene.add(game.world);

		$("#nextStateButton").click(function(event)
		{
			event.preventDefault();
			
			document.dispatchEvent(new CustomEvent("requestNextStage"));
		});

		function onMouseDown(event)
		{
			if (INTERSECTED == null)
				return;
				
			stateManager.forwardEvent(new CustomEvent("objectClick", { detail: { object: INTERSECTED } }));
		}

		function onKeyDown(event)
		{
			if (event.code == "Space")
			{
				$("#nextStateButton").click();
				return;
			}

			stateManager.duplicateEvent(event);
		}

		function onPointerMove(event)
		{
			pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
			pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
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
				// if the intersected object is not the old object,
				// and if the intersected object is an instanceof WorldObject
				if (INTERSECTED instanceof WorldObject ||
					INTERSECTED != intersects[0].object)
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
			
			controls.update();

			//camera.position.lerp(cameraPosition, 0.2);

			game.world.water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
			
			renderer.render(scene, camera);
			htmlRenderer.render(scene, camera);
		};

		animate();

		if (networked)
			network.socket.send(JSON.stringify({ command: "gameReady" }));
	}
}