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
    
    init(stateMachine)
    {
        this.stateMachine = stateMachine;

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

            this.startTerritory.unitCount -= amount;
            this.endTerritory.unitCount += amount;
            
            this.startTerritory.label.element.innerHTML = this.startTerritory.unitCount;
            this.endTerritory.label.element.innerHTML = this.endTerritory.unitCount;

            console.log(this.stateMachine);

            // change the state after the units have been moved,
            // as you can only move once during this turn.
            this.stateMachine.changeState(new BotTurnState());
        });
    }

    cleanup()
    {
        if (this.startTerritory !== null)
            this.clearStartPoint();

        if (this.endTerritory !== null)
            this.clearEndPoint();
    }

    pause()
    {
        
    }

    resume()
    {
        
    }

    onHover(object)
    {
        if (object.userData.team != 1)
            return;
        
        if (this.startTerritory === null ||
            (object !== this.startTerritory && this.endTerritory === null))
        {
            object.raise();
            object.material.color.setHex(Colors.ownedHoverColor);
        }
    }
    
    onStopHover(object)
    {
        if (object.userData.team != 1)
            return;
        
        if (this.startTerritory != object &&
            this.endTerritory != object)
        {
            object.lower();
            object.material.color.setHex(Colors.ownedColor);
        }
    }
    
    onMouseDown(event, object)
    {
        if (object.userData.team != 1)
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
        object.material.color.setHex(Colors.ownedSelectedColor);
        this.startTerritory = object;
    }
    
    clearStartPoint()
    {
        // not strictly necessary, just prevents weird shit
        if (this.endTerritory !== null)
            this.clearEndPoint();
        
        this.startTerritory.lower();
        this.startTerritory.material.color.setHex(Colors.ownedColor);
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
        object.material.color.setHex(Colors.ownedSelectedColor);
        object.createUnitMoveDialog(this.startTerritory.unitCount - 1);
        this.endTerritory = object;
    }
    
    clearEndPoint()
    {
        this.endTerritory.lower();
        this.endTerritory.material.color.setHex(Colors.ownedColor);
        this.endTerritory.destroyUnitMoveDialog();
        this.endTerritory = null;
    }
};