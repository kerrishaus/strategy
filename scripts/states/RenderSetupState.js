import { State } from "./State.js";

import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";
import { CSS2DRenderer } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

import { ControllableCamera } from "../ControllableCamera.js";
import { MainMenuState } from "./MainMenuState.js";

export class RenderSetupState extends State
{
	constructor()
	{
		super();
	}

	init()
	{
        window.scene = new THREE.Scene();
        window.camera = new ControllableCamera();

        let spheres = [];

        function createSphere()
        {
            const geometry = new THREE.SphereGeometry(0.1, 32, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const sphere   = new THREE.Mesh(geometry, material);

            sphere.position.x = -100 + Math.random() * 200;
            sphere.position.y = -100 + Math.random() * 200;
            sphere.position.z = Math.random() * 75;

            spheres.push(sphere);
            scene.add(sphere);
        }

        for (let i = 0; i < 300; i++)
            createSphere();

        window.cameraPosition = new THREE.Vector3(0, 0, 0);
        window.cameraRotation = new THREE.Quaternion();
        window.cameraRotation.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), -3.14159);
        window.camera.rotation.setFromQuaternion(window.cameraRotation);

        window.renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);
        document.body.appendChild(renderer.domElement);

        window.htmlRenderer = new CSS2DRenderer();
        htmlRenderer.setSize(window.innerWidth, window.innerHeight);
        htmlRenderer.domElement.style.position = 'absolute';
        htmlRenderer.domElement.style.top = '0px';
        document.body.appendChild(htmlRenderer.domElement).style.pointerEvents = "none";

        window.raycaster = new THREE.Raycaster();
        window.pointer = new THREE.Vector2;
        window.INTERSECTED = null;

        window.clock = new THREE.Clock();

        window.addEventListener('resize', onWindowResize);

        document.addEventListener('keydown', onKeyDown);
        //document.addEventListener('keyup', onKeyUp);

        document.addEventListener('mousedown', onMouseDown);
        //document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onPointerMove);

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

        function initialAnimation()
        {
            requestAnimationFrame(window.animationFunction);

            for (let sphere of spheres)
            {
                sphere.position.z -= 0.05 * Math.random();

                if (sphere.position.z < 0)
                {
                    spheres.splice(spheres.indexOf(sphere), 1);
                    scene.remove(sphere);
                    sphere.remove();
                    createSphere();
                }
            }

            stateManager.update(clock.getElapsedTime());
            
            renderer.render(scene, camera);
            htmlRenderer.render(scene, camera);
        };

        window.animationFunction = initialAnimation;

        initialAnimation();

        stateManager.pushState(new MainMenuState());

        setTimeout(() => {
            $("#loadingCover").fadeOut(1000, function() {
                $(this).remove(); 
                $("#loadingStyles").remove(); 
            });
        }, 1000);
	}
}