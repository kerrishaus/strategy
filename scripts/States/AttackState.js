import * as Colors from "../Colors.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import { State } from "./State.js";

import { WorldObject } from "../WorldObject.js";

export class AttackState extends State
{
    constructor()
    {
        super();

        this.selectedTerritory = null;
        this.attackTerritory = null;
    }

    init()
    {
        $(this).on("objectHover",     this.onHover);
		$(this).on("objectHoverStop", this.onStopHover);
		$(this).on("objectClick",     this.onMouseDown);
    }

    cleanup()
    {
        if (this.attackTerritory !== null)
            this.clearDefendingTerritory();
        
        if (this.selectedTerritory !== null)
            this.clearAttackingTerritory();

        $(this).off("objectHover",     this.onHover);
		$(this).off("objectHoverStop", this.onStopHover);
		$(this).off("objectClick",     this.onMouseDown);
    }

    onHover(event)
    {
        const object = event.detail.object;

        if (this.selectedTerritory === null)
        {
            if (object.userData.ownerId != clientId)
                return;
                
            if (object.invadeableNeighbors === null)
                return;

            object.raise();
            object.material.color.setHex(Colors.ownedHoverColor);
        }

        if (this.attackTerritory === null)
        {
            if (object.userData.ownerId == clientId)
                return;

            if (!object.userData.invadeable)
                return;

            object.raise();
            object.material.color.setHex(Colors.enemyInvadeableHoverColor);
        }
    }

    onStopHover(event)
    {
        const object = event.detail.object;

        if (object !== this.selectedTerritory &&
            object !== this.attackTerritory)
            {
                object.lower();
                
                if (object.userData.ownerId == clientId)
                    object.material.color.setHex(Colors.ownedColor);
                else
                    if (object.userData.invadeable)
                        if (this.attackTerritory !== null)
                            object.material.color.setHex(Colors.enemyInvadeablePausedColor);
                        else
                            object.material.color.setHex(Colors.enemyInvadeableColor);
                    else
                        object.material.color.setHex(Colors.enemyColor);
            }
    }

    onMouseDown(event)
    {
        const object = event.detail.object;

        if (this.attackTerritory === null && object.userData.ownerId == clientId)
            this.setAttackingTerritory(object);
        else if (this.attackTerritory === null && object.userData.ownerId != clientId)
            this.setDefendingTerritory(object);
        else
            console.error("Invalid object clicked during AttackState.");
    }

    onKeyDown(event)
    {
        if (event.code == "Escape")
        {
            if (this.attackTerritory !== null)
                this.clearDefendingTerritory();
            else if (this.selectedTerritory !== null)
                this.clearAttackingTerritory();
        }
        else if (event.code == "Enter")
        {
            this.runAttack();
        }
    }

    update(deltaTime)
    {

    }

    setAttackingTerritory(object)
    {
        if (object.invadeableNeighbors === null)
        {
            console.error("This tile cannot invade any of its neighbors.");
            return;
        }
        
        if (this.selectedTerritory !== null)
            this.clearAttackingTerritory();
            
        object.raise();
        object.material.color.setHex(Colors.ownedSelectedColor);
        this.selectedTerritory = object;

        if (this.selectedTerritory.invadeableNeighbors !== null)
            for (const tile of this.selectedTerritory.getInvadeableNeighbors())
            {
                console.log(`${object.territoryId} can invade ${tile}`);

                if (!(tile instanceof WorldObject))
                    continue;

                tile.userData.invadeable = true;
                tile.material.color.setHex(Colors.enemyInvadeableColor);
            }
    }
    
    clearAttackingTerritory()
    {
        if (this.selectedTerritory === null)
        {
            console.error("selectedTerritory is null in clearAttackingTerritory()");
            return;
        }

        if (this.attackTerritory !== null)
            this.clearDefendingTerritory();
            
        if (this.selectedTerritory.invadeableNeighbors !== null)
            for (const tile of this.selectedTerritory.getInvadeableNeighbors())
            {
                if (!(tile instanceof WorldObject))
                    continue;

                tile.userData.invadeable = false;
                tile.material.color.setHex(Colors.enemyColor);
            }

        this.selectedTerritory.lower();
        this.selectedTerritory.material.color.setHex(Colors.ownedColor);
        this.selectedTerritory = null;
    }
    
    setDefendingTerritory(object)
    {
        if (this.selectedTerritory === null)
        {
            console.error("selectedTerritory must be set before attackTerritory can be set.");
            return;
        }

        if (object == this.selectedTerritory)
        {
            console.error("attackTerritory cannot be selectedTerritory.");
            return;
        }
        
        if (!object.userData.invadeable)
        {
            console.error("This tile is not invadeable.");
            return;
        }
        
        object.raise();
        object.material.color.setHex(Colors.enemySelectedColor);
        this.attackTerritory = object;
        
        for (const tile of this.selectedTerritory.getInvadeableNeighbors())
        {
            if (!(tile instanceof WorldObject))
                continue;
                
            if (tile === this.attackTerritory)
                continue;
                
            tile.userData.invadeable = true;
            tile.material.color.setHex(Colors.enemyInvadeablePausedColor);
        }
        
        $("#attackPlannerCancelButton").click(function(event)
        {
            $(".gameInterfaceContainer").attr("data-visibility", null);
        });
        
        $("#attackPlannerGoButton").click(callback =>
        {
            console.log("Running attack");
            this.runAttack();
        });
        
        $("#attackerCount").html(this.selectedTerritory.unitCount);
        $("#defenderCount").html(this.attackTerritory.unitCount);
        $(".gameInterfaceContainer").attr("data-visibility", "hidden");
    }
    
    clearDefendingTerritory()
    {
        if (this.attackTerritory === null)
        {
            console.error("attackTerritory is null in clearDefendingTerritory()");
            return;
        }
        
        this.attackTerritory.lower();
        this.attackTerritory.material.color.setHex(Colors.enemyInvadeableColor);
        this.attackTerritory = null;
        
        for (const tile of this.selectedTerritory.getInvadeableNeighbors())
        {
            if (!(tile instanceof WorldObject))
                continue;
                
            if (tile === this.attackTerritory)
                continue;

            console.log("tile is invadable");

            tile.userData.invadeable = true;
            tile.material.color.setHex(Colors.enemyInvadeableColor);
        }
        
        $("#attackPlannerCancelButton").off();
        $("#attackPlannerGoButton").off();
        
        $(".gameInterfaceContainer").attr("data-visibility", null);
    }
    
    runAttack()
    {
        console.log("What are you doing stepbro");
        
        if (this.selectedTerritory === null)
        {
            console.error("selectedTerritory is null in runAttack()");
            return;
        }
        
        if (this.attackTerritory === null)
        {
            console.error("attackTerritory is null in runAttack()");
            return;
        }
        
        console.log("Attacking!!!");
        
        while (this.attackTerritory.unitCount > 0 && this.selectedTerritory.unitCount > 1)
        {
            const attackerRoll = getRandomInt(5) + 1; // 1-6
            const defenderRoll = getRandomInt(5) + 1; // 1-6
            
            if (attackerRoll > defenderRoll)
            {
                this.attackTerritory.unitCount -= 1;
                console.log("Defenders lost a unit, now at: " + this.attackTerritory.unitCount + ".");
            }
            else
            {
                this.selectedTerritory.unitCount -= 1;
                console.log("Attackers lost a unit, now at: " + this.selectedTerritory.unitCount + ".");
            }
                
            this.selectedTerritory.label.element.innerHTML = this.selectedTerritory.unitCount;
            this.attackTerritory.label.element.innerHTML = this.attackTerritory.unitCount;
        }
        
        console.log(`Final score: Attacker: ${this.selectedTerritory.unitCount}, Defender: ${this.attackTerritory.unitCount}`);
        
        if (this.attackTerritory.unitCount > 0 && this.selectedTerritory.unitCount > 0)
        {
            console.log("match was a draw");
        }
        else
        {
            if (this.attackTerritory.unitCount > 0)
            {
                console.log("defenders won");
            }
            
            if (this.selectedTerritory.unitCount > 0)
            {
                console.log("attackers won");
                
                this.attackTerritory.userData.ownerId = clientId;
                this.attackTerritory.material.color.setHex(Colors.ownedColor);
                this.attackTerritory.unitCount = this.selectedTerritory.unitCount - 1;
                this.selectedTerritory.unitCount = 1;
                
                this.selectedTerritory.label.element.innerHTML = this.selectedTerritory.unitCount;
                this.attackTerritory.label.element.innerHTML = this.attackTerritory.unitCount;
                
                game.world.ownedTerritories += 1;
                
                console.log(`New unit allocation: Attacker: ${this.selectedTerritory.unitCount}, Defender: ${this.attackTerritory.unitCount}`);
            }
        }
        
        this.finaliseAttack();
    }
    
    finaliseAttack()
    {
        if (game.world.ownedTerritories == game.world.tiles.length)
        {
            $("#gameWin").attr("data-visibility", "shown");
            
            $("#replayGame").click(function(event)
            {
                location.reload();
            });
            
            return;
        }
        else
            console.log(`Owned Territories: ${game.world.ownedTerritories} out of ${game.world.tiles.length}`);
        
        if (this.attackTerritory === null)
        {
            console.error("attackTerritory is null in finaliseAttack()");
            return;
        }
        
        if (this.selectedTerritory === null)
        {
            console.error("selectedTerritory is null in finaliseAttack()");
            return;
        }
        
        for (const tile of this.selectedTerritory.getInvadeableNeighbors())
        {
            if (!(tile instanceof WorldObject))
                continue;
            
            tile.userData.invadeable = false;
            tile.material.color.setHex(Colors.enemyColor);
        }
        
        if (this.attackTerritory.userData.ownerId == clientId)
            this.attackTerritory.material.color.setHex(Colors.ownedColor);
        else
            this.attackTerritory.material.color.setHex(Colors.enemyColor);
            
        this.attackTerritory.lower();
        this.attackTerritory = null;
        
        this.selectedTerritory.lower();
        this.selectedTerritory.material.color.setHex(Colors.ownedColor);
        this.selectedTerritory = null;
        
        // TODO: use the official methods to clear attacker and defender
        
        game.world.calculateInvadeableTerritories();
        
        // TODO: remove these when the above todo is implemented
        $("#attackPlannerCancelButton").off();
        $("#attackPlannerGoButton").off();
        
        $(".gameInterfaceContainer").attr("data-visibility", null);
    }
};
