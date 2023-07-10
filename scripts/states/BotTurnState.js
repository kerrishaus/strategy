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

        this.botId = clientId + 1;
    }
    
    init()
    {
        $("#playerName").html("Enemy AI");
        
        let enemyUnitPlaceCount = Math.round((game.world.tiles.length - game.world.ownedTerritories) / 3);
        $("#count").html(enemyUnitPlaceCount);
        
        console.log("Starting AI turn");
        
        const aiDelay = 400;
        
        setTimeout(func =>
        {
            console.log("select a thing");

            let placeTile = null;
            
            let placeIterations = 0;
            // TODO: improve this loop and don't use while true
            // tries to find a suitable location for the bot to drop their units
            while (true)
            {
                if (placeIterations > 10)
                {
                    console.warn("Failed to find suitable drop territory after 10 iterations, skipping stage.");
                    break;
                }
                
                const tileId = getRandomInt(game.world.tiles.length);
                
                const tile = game.world.tiles[tileId];
                
                // tile owned by the bot
                if (tile.userData.ownerId == this.botId)
                {
                    // tile not invadable or has less than 4 units
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
                    
                    game.nextStage();
                    
                    setTimeout(func =>
                    {
                        console.log("select attack 1");
                        
                        let attackingTerritory = null;
                        
                        // TODO: not good!!!
                        // find a territory owned by the bot to attack from
                        while (true)
                        {
                            const tileId = getRandomInt(game.world.tiles.length);
                            
                            const tile = game.world.tiles[tileId];
                
                            if (tile.userData.ownerId == this.botId)
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

                                let attackingPopulation = attackingTerritory.unitCount;
                                let defendingPopulation = defendingTerritory.unitCount;

                                console.log(`Attacking ${attackingTerritory.territoryId} (${attackingPopulation} troops) from ${defendingTerritory.territoryId} (${defendingPopulation} troops.)`);

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
                                    clientId: this.botId, // TODO: this is for local play to work. I need to find a way to always include this if there is no server to add it. I think this is fine here because the server overwrites this value when it is sent by any client
                                    defenderOwnerId: attackingTerritory.userData.ownerId,
                                    result: attackResult,
                                    attacker: attackingTerritory.territoryId,
                                    defender: defendingTerritory.territoryId,
                                    attackerPopulation: attackingPopulation,
                                    defenderPopulation: defendingPopulation
                                } }));
                                
                                setTimeout(func =>
                                {
                                    console.log("move");
                                    
                                    game.nextStage();
                                    
                                    let moveStart = null, moveEnd = null;
                                    
                                    let iterations = 0;
                                    // TODO: improve this loop and don't use while true
                                    // find a territory owned by the bot to move units out of
                                    while (true)
                                    {
                                        if (iterations > 20)
                                        {
                                            console.warn("Found no suitable movement targets after 20 iterations, skipping.");
                                            break;
                                        }
                                        
                                        // maybe make a copy of the tile array and shuffle it then iterate through the entire thing
                                        // instead of generating a random number and trying it for every iteration
                                        // that way we can check the entire board and not just 20 tiles and also
                                        // have it be random enough and not biased towards the front or the back of the board
                                        const tileId = getRandomInt(game.world.tiles.length);
                                        
                                        if (game.world.tiles[tileId].userData.ownerId == this.botId)
                                            if (moveStart === null)
                                            {
                                                // tries to move units out of territories that cannot currently be attacked
                                                if (game.world.tiles[tileId].invadeableNeighbors === null)
                                                    if (game.world.tiles[tileId].unitCount > 1)
                                                    {
                                                        moveStart = game.world.tiles[tileId];
                                                        iterations = 0; // restart and find the end
                                                    }
                                            }
                                            else
                                            {
                                                // tries to move units into territories that can be attacked and have less than 15 units
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
                                                
                                                game.nextStage();
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
