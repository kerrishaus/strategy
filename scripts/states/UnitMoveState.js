import * as Colors from "../Colors.js";

import { State } from "./State.js";
import { BotTurnState } from "./BotTurnState.js";

export class UnitMoveState extends State
{
    constructor()
    {
        super();

        this.startTerritory = null;
        this.endTerritory = null;
    }
    
    init()
    {
        $(htmlRenderer.domElement).on("click", "#moveUnitButton", callback =>
        {
            if (this.startTerritory === null)
            {
                console.error("startTerritory is null.");
                return;
            }
            
            if (this.endTerritory === null)
            {
                console.error("endTerritory is null.");
                return;
            }
            
            const amount = parseInt($("#moveUnitAmount").val());
            
            if (amount <= 0)
            {
                console.error("0 units chosen.");
                return;
            }
            
            // 1 unit must stay behind to maintain ownership of territory
            if (amount > this.startTerritory.unitCount - 1)
            {
                console.error("Requested to move too many units.");
                return;
            }

            document.dispatchEvent(new CustomEvent("moveUnits", { detail: {
                origin: this.startTerritory.territoryId,
                destination: this.endTerritory.territoryId,
                amount: amount,
                originPopulation: this.startTerritory.unitCount - amount,
                destinationPopulation: this.endTerritory.unitCount + amount
            } }));

            // TODO: nextStageButton.click()

            this.clearStartPoint();
            this.clearEndPoint();
        });

        $(this).on("objectHover",     this.onHover);
		$(this).on("objectHoverStop", this.onStopHover);
		$(this).on("objectClick",     this.onMouseDown);
        $(this).on("keydown",         this.onKeyDown);
    }

    cleanup()
    {
        if (this.startTerritory !== null)
            this.clearStartPoint();

        if (this.endTerritory !== null)
            this.clearEndPoint();

        $(this).off("objectHover",     this.onHover);
        $(this).off("objectHoverStop", this.onStopHover);
        $(this).off("objectClick",     this.onMouseDown);
        $(this).off("keydown",         this.onKeyDown);
    }

    pause()
    {
        
    }

    resume()
    {
        
    }

    onHover(event)
    {
        const object = event.detail.object;

        if (object.userData.ownerId != clientId)
            return;
        
        if (this.startTerritory === null ||
            (object !== this.startTerritory && this.endTerritory === null))
        {
            object.raise();
            object.material.color.set(Colors.shade(game.clients[object.userData.ownerId]?.color ?? Colors.unownedColor, -20));
        }
    }
    
    onStopHover(event)
    {
        const object = event.detail.object;

        if (object.userData.ownerId != clientId)
            return;
        
        if (this.startTerritory != object &&
            this.endTerritory != object)
        {
            object.lower();
            object.material.color.set(game.clients[object.userData.ownerId]?.color ?? Colors.unownedColor);
        }
    }
    
    onMouseDown(event)
    {
        const object = event.detail.object;

        if (object.userData.ownerId != clientId)
            return;
        
        if (this.startTerritory === null)
            this.setStartPoint(object);
        else if (this.endTerritory === null)
            this.setEndPoint(object);
    }

    onKeyDown(event)
    {
        if (event.code == "Escape")
            if (this.endTerritory !== null)
                this.clearEndPoint();
            else if (this.startTerritory !== null)
                this.clearStartPoint();
    }
    
    update(deltaTime)
    {
        
    }
    
    setStartPoint(object)
    {
        if (object.unitCount <= 1)
        {
            console.warn("This territory does not have enough units.");
            return;
        }
        
        object.raise();
        object.material.color.set(Colors.shade(game.clients[object.userData.ownerId]?.color ?? Colors.unownedColor, -40));
        this.startTerritory = object;
    }
    
    clearStartPoint()
    {
        // not strictly necessary, just prevents weird shit
        if (this.endTerritory !== null)
            this.clearEndPoint();
        
        this.startTerritory.lower();
        this.startTerritory.material.color.set(game.clients[this.startTerritory.userData.ownerId]?.color ?? Colors.unownedColor);
        this.startTerritory = null;
    }
    
    setEndPoint(object)
    {
        if (this.startTerritory === null)
        {
            console.error("startTerritory is null.");
            return;
        }
        
        if (this.endTerritory !== null)
            this.clearEndPoint();
        
        object.raise();
        object.material.color.set(Colors.shade(game.clients[object.userData.ownerId]?.color ?? Colors.unownedColor, -40));
        object.createUnitMoveDialog(this.startTerritory.unitCount - 1);
        this.endTerritory = object;
    }
    
    clearEndPoint()
    {
        if (this.endTerritory === null)
            return;

        this.endTerritory.lower();
        this.endTerritory.material.color.set(game.clients[this.endTerritory.userData.ownerId].color);
        this.endTerritory.destroyUnitMoveDialog();
        this.endTerritory = null;
    }
};