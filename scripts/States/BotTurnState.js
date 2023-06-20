import { State } from "./State.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import *  as Colors from "../Colors.js";

import { WorldObject } from "../WorldObject.js";
import { UnitDropState } from "./UnitDropState.js";

export class BotTurnState extends State
{
    constructor()
    {
        super();
    }
    
    init()
    {
        stateManager.setInterfaceState("botTurnState");
        
        $("#playerName").html("Enemy AI");    
        $("#nextStateButton").attr("data-visibility", "hidden");
        
        let enemyUnitPlaceCount = Math.round((game.world.tiles.length - game.world.ownedTerritories) / 3);
        $("#count").html(enemyUnitPlaceCount);
        
        console.log("Starting AI turn");
        
        const aiDelay = 400;
        
        setTimeout(func =>
        {
            console.log("select a thing");

            let placeTile = null;
            
            let placeIterations = 0;
            while (true)
            {
                if (placeIterations > 10)
                {
                    console.warn("Failed to find suitable place territory after 10 iterations, skipping.");
                    break;
                }
                
                const tileId = getRandomInt(game.world.tiles.length);
                
                const tile = game.world.tiles[tileId];
                
                if (tile.userData.team != 1)
                {
                    if (tile.invadeableNeighbors !== null || tile.unitCount <= 4)
                    {
                        tile.raise();
                        tile.material.color.setHex(Colors.enemySelectedColor);
                        placeTile = tile;
                        break;
                    }
                }
                
                placeIterations++;
            }
            
            setTimeout(func =>
            {
                console.log("add the units");
                
                placeTile.addUnits(enemyUnitPlaceCount);
                $("#count").html(0);
                
                setTimeout(func =>
                {
                    console.log("change to attack");
                    
                    placeTile.lower();
                    placeTile.material.color.setHex(Colors.enemyColor);
                    placeTile = null;
                    
                    changeRoundIndicator(4);
                    
                    setTimeout(func =>
                    {
                        console.log("select attack 1");
                        
                        let attackingTerritory = null;
                        
                        while (true)
                        {
                            const tileId = getRandomInt(game.world.tiles.length);
                            
                            const tile = game.world.tiles[tileId];
                
                            if (tile.userData.team != 1)
                            {
                                if (tile.invadeableNeighbors !== null && tile.unitCount > 2)
                                {
                                    tile.raise();
                                    tile.material.color.setHex(Colors.enemySelectedColor);
                                    attackingTerritory = tile;
                                    break;
                                }
                            }
                        }
                        
                        setTimeout(func =>
                        {
                            let defendingTerritory = null;
                            
                            for (const tile2 of attackingTerritory.getInvadeableNeighbors())
                            {
                                if (tile2 instanceof WorldObject)
                                {
                                    console.log(tile2);
                                    tile2.raise();
                                    tile2.material.color.setHex(Colors.ownedSelectedColor);
                                    defendingTerritory = tile2;
                                    break;
                                }
                                else if (tile2 !== null)
                                    console.warn(tile2);
                            }

                            setTimeout(func =>
                            {
                                console.log("attack");

                                while (defendingTerritory.unitCount > 0 && attackingTerritory.unitCount > 1)
                                {
                                    const attackerRoll = getRandomInt(5) + 1; // 1-6
                                    const defenderRoll = getRandomInt(5) + 1; // 1-6

                                    if (attackerRoll > defenderRoll)
                                    {
                                        defendingTerritory.unitCount -= 1;
                                        console.log("Defenders lost a unit, now at: " + defendingTerritory.unitCount + ".");
                                    }
                                    else
                                    {
                                        attackingTerritory.unitCount -= 1;
                                        console.log("Attackers lost a unit, now at: " + attackingTerritory.unitCount + ".");
                                    }

                                    attackingTerritory.label.element.innerHTML = attackingTerritory.unitCount;
                                    defendingTerritory.label.element.innerHTML = defendingTerritory.unitCount;
                                }
                                
                                console.log(`Final score: Attacker: ${attackingTerritory.unitCount}, Defender: ${defendingTerritory.unitCount}`);
                                
                                // FIXME: this is some kind of logic bug.
                                // in the end, it results in the same outcome, so i'm not going to fix it
                                // but i'm sure it could do with some love
                                if (defendingTerritory.unitCount > 0 && attackingTerritory.unitCount > 0)
                                {
                                    console.log("match was a draw");
                                    
                                    defendingTerritory.lower();
                                    defendingTerritory.material.color.setHex(Colors.ownedColor);
                                    
                                    attackingTerritory.lower();
                                    attackingTerritory.material.color.setHex(Colors.enemyColor);
                                }
                                else
                                {
                                    if (defendingTerritory.unitCount > 0)
                                    {
                                        console.log("defenders won");
                                        
                                        defendingTerritory.lower();
                                        defendingTerritory.material.color.setHex(Colors.ownedColor);
                                        
                                        attackingTerritory.lower();
                                        attackingTerritory.material.color.setHex(Colors.enemyColor);
                                    }

                                    if (attackingTerritory.unitCount > 0)
                                    {
                                        console.log("attackers won");

                                        defendingTerritory.userData.team = 2;
                                        defendingTerritory.unitCount = attackingTerritory.unitCount - 1;
                                        defendingTerritory.unitCount = 1;
                                        defendingTerritory.lower();
                                        defendingTerritory.material.color.setHex(Colors.enemyColor);

                                        attackingTerritory.label.element.innerHTML = attackingTerritory.unitCount;
                                        defendingTerritory.label.element.innerHTML = defendingTerritory.unitCount;

                                        attackingTerritory.lower();
                                        attackingTerritory.material.color.setHex(Colors.enemyColor);

                                        game.world.ownedTerritories -= 1;

                                        console.log(`New unit allocation: Attacker: ${attackingTerritory.unitCount}, Defender: ${defendingTerritory.unitCount}`);
                                    }
                                    
                                    game.world.calculateInvadeableTerritories();
                                }
                                
                                setTimeout(func =>
                                {
                                    console.log("move");
                                    
                                    stateMachine.setInterfaceState("moveUnitState");
                                    stateMachine.stateName = "botTurnState";
                                    
                                    let moveStart = null, moveEnd = null;
                                    
                                    let iterations = 0;
                                    while (true)
                                    {
                                        if (iterations > 20)
                                        {
                                            console.warn("Found no suitable movement targets after 20 iterations, skipping.");
                                            break;
                                        }
                                        
                                        const tileId = getRandomInt(game.world.tiles.length);
                                        
                                        if (game.world.tiles[tileId].userData.team == 2)
                                            if (moveStart === null)
                                            {
                                                if (game.world.tiles[tileId].invadeableNeighbors === null)
                                                    if (game.world.tiles[tileId].unitCount > 1)
                                                    {
                                                        moveStart = game.world.tiles[tileId];
                                                        iterations = 0; // restart and find the end
                                                    }
                                            }
                                            else
                                            {
                                                if (game.world.tiles[tileId].invadeableNeighbors !== null)
                                                    if (game.world.tiles[tileId].unitCount < 15)
                                                    {
                                                        moveEnd = game.world.tiles[tileId];
                                                        break;
                                                    }
                                            }
                                                
                                        iterations++;
                                    }
                                    
                                    setTimeout(func =>
                                    {
                                        if (moveStart !== null && moveEnd !== null)
                                        {
                                            moveStart.raise();
                                            moveStart.material.color.setHex(Colors.enemySelectedColor);
                                        }
                                        
                                        setTimeout(func =>
                                        {
                                            if (moveStart !== null && moveEnd !== null)
                                            {
                                                moveEnd.raise();
                                                moveEnd.material.color.setHex(Colors.enemySelectedColor);
                                            }
                                            else
                                                console.log("skipping move 2");
                                            
                                            setTimeout(func =>
                                            {
                                                console.log("move");
                                                
                                                if (moveStart !== null && moveEnd !== null)
                                                {
                                                    moveEnd.addUnits(moveEnd.unitCount - 1);
                                                    moveStart.addUnits(-(moveEnd.unitCount - 1));
                                                    
                                                    moveStart.lower();
                                                    moveStart.material.color.setHex(Colors.enemyColor);
                                                    
                                                    moveEnd.lower();
                                                    moveEnd.material.color.setHex(Colors.enemyColor);
                                                }
                                                
                                                $("#playerName").html("Super Idiot");
                                                $("#nextStateButton").attr("data-visibility", null);
                                                stateManager.changeState(new UnitDropState(Math.round(game.world.ownedTerritories / 3)));
                                            }, aiDelay);
                                        }, aiDelay);
                                    }, aiDelay);
                                }, aiDelay);
                            }, aiDelay);
                        }, aiDelay);
                    }, aiDelay);
                }, aiDelay);
            }, aiDelay);
        }, aiDelay);
        
        // while
        // select random enemy territory
        // if territory doesn't have invadeable neighrbors
        //  set move start point
     
        // while
        // select random enemy territory
        // if enemy territory has invadeable neighbors
        //  set end point
        //  move units
    }
}
