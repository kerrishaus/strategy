import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

export class ControllableCamera extends THREE.PerspectiveCamera
{
    constructor()
    {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }
}