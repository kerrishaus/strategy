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
        $(this).on("keydown",         this.onKeyDown);
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
        $(this).off("keydown",         this.onKeyDown);
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
            console.warn("Invalid object clicked during AttackState.");
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
            console.warn("This tile cannot invade any of its neighbors.");
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
            console.warn("This tile is not invadeable.");
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
        
        let attackingPopulation = this.selectedTerritory.unitCount;
        let defendingPopulation = this.attackTerritory.unitCount;

        console.log(`Attacking ${this.attackTerritory.territoryId} (${attackingPopulation} troops) from ${this.selectedTerritory.territoryId} (${defendingPopulation} troops.)`);

        while (defendingPopulation > 0 && attackingPopulation > 1)
        {
            const attackerRoll = getRandomInt(5) + 1; // 1-6
            const defenderRoll = getRandomInt(5) + 1; // 1-6
            
            if (attackerRoll > defenderRoll)
            {
                defendingPopulation = defendingPopulation - 1;
                console.log("Defenders lost a unit, now at: " + defendingPopulation + ".");
            }
            else
            {
                attackingPopulation = attackingPopulation - 1;
                console.log("Attackers lost a unit, now at: " + attackingPopulation + ".");
            }
        }
        
        console.log(`Final score: Attacker: ${attackingPopulation}, Defender: ${defendingPopulation}`);
        
        let attackResult;

        // if they both have units left, it's a draw
        if (attackingPopulation > 0 && defendingPopulation > 0)
        {
            console.log("match was a draw");

            attackResult = "draw";
        }
        else
        {
            // if the defender has units left, they won
            if (defendingPopulation > 0)
            {
                console.log("defenders won");

                attackResult = "lost";
            }
            
            // if the attacker has units left, they won
            if (attackingPopulation > 0)
            {
                console.log("attackers won");
                
                // when an attack is won, all but one attacking
                // units are moved to the newly conquered territory
                defendingPopulation = attackingPopulation - 1;
                attackingPopulation = 1;

                attackResult = "won";
            }
        }

        document.dispatchEvent(new CustomEvent("attack", { detail: {
            result: attackResult,
            attacker: this.selectedTerritory.territoryId,
            defender: this.attackTerritory.territoryId,
            attackerPopulation: attackingPopulation,
            defenderPopulation: defendingPopulation
        } }));
        
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
