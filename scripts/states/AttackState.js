import * as Colors from "../Colors.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import { State } from "./State.js";

import { WorldObject } from "../WorldObject.js";

export class AttackState extends State
{
    constructor()
    {
        super();

        this.attackOriginTerritory = null;
        this.attackTargetTerritory = null;
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
        if (this.attackTargetTerritory !== null)
            this.clearAttackTargetTerritory();
        
        if (this.attackOriginTerritory !== null)
            this.clearAttackOriginTerritory();

        $(this).off("objectHover",     this.onHover);
		$(this).off("objectHoverStop", this.onStopHover);
		$(this).off("objectClick",     this.onMouseDown);
        $(this).off("keydown",         this.onKeyDown);
    }

    onHover(event)
    {
        const object = event.detail.object;

        // first raise candidates for the attack origin
        if (this.attackOriginTerritory === null)
        {
            // not if we don't own the territory
            if (object.userData.ownerId != clientId)
                return;
                
            // it has to have invadeableNeighbors
            if (object.getInvadeableNeighbors().length <= 0)
                return;

            // it has to have more than 1 unit
            if (object.unitCount <= 1)
                return;

            object.raise();
            object.material.color.set(Colors.shade(game.clients.getById(object.userData.ownerId)?.color ?? Colors.unownedColor, -20));
        }
        // if we already have an origin, then we'll be selecting candidates for the target
        else if (this.attackTargetTerritory === null)
        {
            // not if we own the territory
            if (object.userData.ownerId == clientId)
                return;

            // has to be invadeable
            if (!object.userData.invadeable)
                return;

            object.raise();
            object.material.color.set(Colors.shade(game.clients.getById(object.userData.ownerId)?.color ?? Colors.unownedColor, -20));
        }
    }

    onStopHover(event)
    {
        const object = event.detail.object;

        if (object !== this.attackOriginTerritory &&
            object !== this.attackTargetTerritory)
        {
            object.lower();

            const objectOwnerColor = game.clients[object.userData.ownerId]?.color ?? Colors.unownedColor;
            
            if (object.userData.ownerId == clientId)
                object.material.color.set(objectOwnerColor);
            else
            {
                if (object.userData.invadeable)
                {
                    if (this.attackTargetTerritory !== null)
                        object.material.color.set(Colors.shade(objectOwnerColor, -40));
                    else
                        object.material.color.set(Colors.shade(objectOwnerColor, -20));
                }
                else
                    object.material.color.set(objectOwnerColor);
            }
        }
    }

    onMouseDown(event)
    {
        const object = event.detail.object;

        if (this.attackTargetTerritory === null && object.userData.ownerId == clientId)
            this.setAttackOriginTerritory(object);
        else if (this.attackTargetTerritory === null && object.userData.ownerId != clientId)
            this.setAttackTargetTerritory(object);
        else
        {
            console.log("Clearing selected territories.");
            this.clearAttackTargetTerritory();
            this.clearAttackOriginTerritory();
        }
    }

    onKeyDown(event)
    {
        if (event.code == "Escape")
        {
            if (this.attackTargetTerritory !== null)
                this.clearAttackTargetTerritory();
            else if (this.attackOriginTerritory !== null)
                this.clearAttackOriginTerritory();
        }
        else if (event.code == "Enter")
        {
            this.runAttack();
        }
    }

    update(deltaTime)
    {

    }

    setAttackOriginTerritory(object)
    {
        if (object.invadeableNeighbors.length <= 0)
        {
            console.warn("This tile cannot invade any of its neighbors.");
            return;
        }
        
        if (object.unitCount <= 1)
        {
            console.warn("This tile does not have enough units.");
            return;
        }

        if (this.attackOriginTerritory !== null)
            this.clearAttackOriginTerritory();
            
        object.raise();
        object.material.color.set(Colors.shade(game.clients.getById(object.userData.ownerId).color, -40));
        this.attackOriginTerritory = object;

        // highlight invadeable neighbors
        for (const tile of this.attackOriginTerritory.getInvadeableNeighbors())
        {
            console.log(`${object.territoryId} can invade ${tile}`);

            if (!(tile instanceof WorldObject))
                continue;

            tile.userData.invadeable = true;
            tile.material.color.set(Colors.shade(game.clients.getById(tile.userData.ownerId)?.color ?? Colors.unownedColor), -20);
        }
    }
    
    clearAttackOriginTerritory()
    {
        if (this.attackOriginTerritory === null)
        {
            console.error("selectedTerritory is null in clearAttackOriginTerritory()");
            return;
        }

        if (this.attackTargetTerritory !== null)
            this.clearAttackTargetTerritory();
            
        for (const tile of this.attackOriginTerritory.getInvadeableNeighbors())
        {
            if (!(tile instanceof WorldObject))
                continue;

            tile.userData.invadeable = false;
            tile.material.color.set(game.clients.getById(tile.userData.ownerId)?.color ?? Colors.unownedColor);
        }

        this.attackOriginTerritory.lower();
        this.attackOriginTerritory.material.color.set(game.clients.getById(this.attackOriginTerritory.userData.ownerId).color);
        this.attackOriginTerritory = null;
    }
    
    setAttackTargetTerritory(object)
    {
        if (this.attackOriginTerritory === null)
        {
            console.error("selectedTerritory must be set before attackTerritory can be set.");
            return;
        }

        if (object == this.attackOriginTerritory)
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
        object.material.color.set(Colors.enemySelectedColor);
        this.attackTargetTerritory = object;
        
        for (const tile of this.attackOriginTerritory.getInvadeableNeighbors())
        {
            if (!(tile instanceof WorldObject))
                continue;
                
            if (tile === this.attackTargetTerritory)
                continue;
                
            tile.userData.invadeable = true;
            tile.material.color.set(Colors.enemyInvadeablePausedColor);
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
        
        $("#attackerCount").html(this.attackOriginTerritory.unitCount);
        $("#defenderCount").html(this.attackTargetTerritory.unitCount);
        $(".gameInterfaceContainer").attr("data-visibility", "hidden");
    }
    
    clearAttackTargetTerritory()
    {
        if (this.attackTargetTerritory === null)
        {
            console.error("attackTerritory is null in clearAttackTargetTerritory()");
            return;
        }
        
        this.attackTargetTerritory.lower();
        // TODO: we should probably make a function,
        // that sets the color to match the current owner
        this.attackTargetTerritory.material.color.set(game.clients.getById(this.attackTargetTerritory.userData.ownerId)?.color ?? Colors.unownedColor);
        this.attackTargetTerritory = null;
        
        for (const tile of this.attackOriginTerritory.getInvadeableNeighbors())
        {
            if (!(tile instanceof WorldObject))
                continue;
                
            if (tile === this.attackTargetTerritory)
                continue;

            console.log("tile is invadable");

            tile.userData.invadeable = true;
            tile.material.color.set(Colors.shade(game.clients.getById(tile.userData.ownerId)?.color ?? Colors.unownedColor, -20));
        }
        
        $("#attackPlannerCancelButton").off();
        $("#attackPlannerGoButton").off();
        
        $(".gameInterfaceContainer").attr("data-visibility", null);
    }
    
    runAttack()
    {
        if (this.attackOriginTerritory === null)
        {
            console.error("selectedTerritory is null in runAttack()");
            return;
        }
        
        if (this.attackTargetTerritory === null)
        {
            console.error("attackTerritory is null in runAttack()");
            return;
        }
        
        let attackingPopulation = this.attackOriginTerritory.unitCount;
        let defendingPopulation = this.attackTargetTerritory.unitCount;

        console.log(`Attacking ${this.attackTargetTerritory.territoryId} (${attackingPopulation} troops) from ${this.attackOriginTerritory.territoryId} (${defendingPopulation} troops.)`);

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
            clientId: clientId, // TODO: this is for local play to work. I need to find a way to always include this if there is no server to add it. I think this is fine here because the server overwrites this value when it is sent by any client
            defenderOwnerId: this.attackTargetTerritory.userData.ownerId,
            result: attackResult,
            attacker: this.attackOriginTerritory.territoryId,
            defender: this.attackTargetTerritory.territoryId,
            attackerPopulation: attackingPopulation,
            defenderPopulation: defendingPopulation
        } }));

        this.finaliseAttack();
    }
    
    finaliseAttack()
    {
        this.clearAttackTargetTerritory();

        // if we can still attack other territories from this territory, highlight them
        // otherwise, clear this territory
        if (this.attackOriginTerritory.invadeableNeighbors.length > 0)
        {
            for (const tile of this.attackOriginTerritory.getInvadeableNeighbors())
            {
                if (!(tile instanceof WorldObject))
                    continue;
                
                tile.userData.invadeable = false;
                tile.material.color.set(Colors.enemyColor);
            }
        }
        else
            this.clearAttackOriginTerritory();
    }
};
