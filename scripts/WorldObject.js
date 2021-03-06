import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";

import { CSS2DObject } from "https://kerrishaus.com/assets/threejs/examples/jsm/renderers/CSS2DRenderer.js";

export class WorldObject extends Mesh
{
    constructor(width, height, color)
    {
        const geometry = new BoxGeometry(width, height, 1);
        const material = new MeshBasicMaterial({ color: color });
        
        super(geometry, material);
        
        this.hovered = false;
        
        this.objectOwner = -1;
        this.unitCount = 1;
        
        const labelDiv = document.createElement("div");
        labelDiv.id = this.uuid;
        labelDiv.className = 'unitCount';
        labelDiv.textContent = this.unitCount;
        
        this.label = new CSS2DObject(labelDiv);
        this.label.color = "white";
        this.add(this.label);
        
        this.userData.canClick = true;
        
        this.targetPosition = new Vector3(0, 0, 0);
        
        this.dialog = null;
        this.world = null;
        this.invadeableNeighbors = new Array(4);
    }
    
    update(deltaTime)
    {
        this.position.lerp(this.targetPosition, 0.3);
    }
    
    getInvadeableNeighbors()
    {
        return this.invadeableNeighbors;
    }
    
    createUnitPlaceDialog(availableUnits)
    {
        if (this.availableUnits <= 0)
        {
            console.warn("No available units to place.");
            return
        }
        
        if (this.dialog)
            this.destroyUnitPlaceDialog();
        
        const dialog = document.createElement("div");
        dialog.id = 'unitPlaceDialog';
        
        const header = document.createElement("h1");
        header.innerHTML = "Place how many units?";
        dialog.append(header);
        
        const inputGroup = document.createElement("div");
        dialog.append(inputGroup);
        
        const input = document.createElement("input");
        input.id = 'dropUnitAmount';
        input.type = 'range'
        input.min = 1;
        input.max = availableUnits;
        input.value = availableUnits;
        input.addEventListener("input", function(event)
        {
            document.getElementById("dropUnitAmountPreview").innerHTML = this.value;
        });
        inputGroup.append(input);
        
        const inputCounter = document.createElement("span");
        inputCounter.textContent = availableUnits;
        inputCounter.id = 'dropUnitAmountPreview'
        inputGroup.append(inputCounter);
        
        const button = document.createElement("button");
        button.id = 'dropUnitButton';
        button.textContent = "Place";
        dialog.append(button);
        
        this.dialog = new CSS2DObject(dialog);
        this.add(this.dialog);
    }
    
    destroyUnitPlaceDialog()
    {
        this.remove(this.dialog);
        delete this.dialog;
        this.dialog = null;
    }
    
    createUnitMoveDialog(units)
    {
        if (this.dialog)
            this.destroyUnitMoveDialog();
            
        console.log(units);
        
        const dialog = document.createElement("div");
        dialog.id = 'unitMoveDialog';
        
        const header = document.createElement("h1");
        header.innerHTML = "Move how many units?";
        dialog.append(header);
        
        const inputGroup = document.createElement("div");
        dialog.append(inputGroup);
        
        const input = document.createElement("input");
        input.id = 'moveUnitAmount';
        input.type = 'range'
        input.min = 1;
        input.max = units;
        input.value = units;
        input.addEventListener("input", function(event)
        {
            document.getElementById("moveUnitAmountPreview").innerHTML = this.value;
        });
        inputGroup.append(input);
        
        const inputCounter = document.createElement("span");
        inputCounter.textContent = units;
        inputCounter.id = 'moveUnitAmountPreview'
        inputGroup.append(inputCounter);
        
        const button = document.createElement("button");
        button.id = 'moveUnitButton';
        button.textContent = "Place";
        dialog.append(button);
        
        this.dialog = new CSS2DObject(dialog);
        this.add(this.dialog);
    }
    
    destroyUnitMoveDialog()
    {
        this.remove(this.dialog);
        delete this.dialog;
        this.dialog = null;
    }
    
    /*
    onHover()
    {
        this.raise();
    }
    
    onStopHover()
    {
        this.lower();
    }
    */
    
    raise()
    {
        this.targetPosition.z = 0.4;
    }
    
    lower()
    {
        this.targetPosition.z = 0;
    }
    
    addUnits(amount = 1)
    {
        this.unitCount += amount;
        $("#" + this.uuid).html(this.unitCount);
    }
    
    removeUnits(amount = 1)
    {
        this.unitCount -= amount;
        $("#" + this.uuid).html(this.unitCount);
    }
};