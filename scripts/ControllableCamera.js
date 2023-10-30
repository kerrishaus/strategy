import * as THREE from "https://kerrishaus.com/assets/threejs/build/three.module.js";

export class ControllableCamera extends THREE.PerspectiveCamera
{
    constructor()
    {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.element = null;
    }

    attach(element)
    {
        this.element = element;

        this.element.addEventListener("keydown",    this.onKeyDown);
        this.element.addEventListener("keyup",      this.onKeyUp);
        this.element.addEventListener("mousedown",  this.onMouseDown);
        this.element.addEventListener("mouseup",    this.onMouseUp);
        this.element.addEventListener("mousemove",  this.onMouseMove);
        this.element.addEventListener("mousewheel", this.onMouseWheel);
    }

    detatch(element)
    {

    }

    onKeyDown(event)
    {

    }

    onKeyUp(event)
    {

    }

    onMouseUp(event)
    {
        
    }
    
    onMouseDown(event)
    {
        
    }
    
    onMouseMove(event)
    {
        
    }

    onMouseWheel(event)
    {

    }
}