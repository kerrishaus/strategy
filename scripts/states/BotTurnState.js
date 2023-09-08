import { State } from "./State.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import *  as Colors from "../Colors.js";

import { shuffleArray }  from "../Utility.js";

import { WorldObject } from "../WorldObject.js";

export class BotTurnState extends State
{
    constructor()
    {
        super();

        this.botId = clientId + 1;

        this.delay = 0;
    }
    
    init()
    {
        this.enemyUnitPlaceCount = Math.round(game.world.getTerritoriesOwnedBy(this.botId).length / 3);

        console.log("Starting AI turn with " + this.enemyUnitPlaceCount + " units.");

        $("#playerName").html("Enemy AI");
        $("#count").html(this.enemyUnitPlaceCount);
        
        this.dropUnits();
        setTimeout(() => { game.nextStage() }, this.addToDelay());
        this.attack();
        setTimeout(() => { game.nextStage() }, this.addToDelay());
        this.moveUnits();
        setTimeout(() => { game.nextStage() }, this.addToDelay());
    }

    getRandomDelay()
    {
        // TODO: kinda hacky, since getRandomInt does not support a lower threshold
        // I want a random number anywhere between 400 and 1000
        return 400 + getRandomInt(500);
    }

    addToDelay()
    {
        return this.delay += this.getRandomDelay();
    }

    dropUnits()
    {
        // TODO: rename this to unitDropTile
        let placeTile = null;

        setTimeout(func =>
        {
            console.log("Searching for suitable tile to drop units...");

            let ownedTerritories = game.world.getTerritoriesOwnedBy(this.botId);
            shuffleArray(ownedTerritories);
            
            // if the int is greater than 5, the bot will place their units
            // on the tile with the least amount of units
            if (getRandomInt(10) > 5)
            {
                console.log("Drop mode: replenish lowest");

                let highestTile = null;
                let highestTileUnitCount = -1;

                for (const tile of ownedTerritories)
                {
                    if (tile.unitCount > highestTileUnitCount)
                    {
                        highestTile = tile;
                        highestTileUnitCount = tile.unitCount;
                    }
                }

                placeTile = highestTile;
            }
            else
            {
                console.log("Drop mode: random");
                placeTile = ownedTerritories[0];
            }

            placeTile.raise();
            placeTile.material.color.setHex(Colors.enemySelectedColor);

            console.log(`Selected tile ${placeTile.territoryId} for unit drop.`, placeTile);
        }, this.addToDelay());

        setTimeout(func =>
        {
            console.log("Dropping units.");
            
            document.dispatchEvent(new CustomEvent("dropUnits", { detail: {
                clientId: this.botId, // TODO: this is for local play to work. I need to find a way to always include this if there is no server to add it. I think this is fine here because the server overwrites this value when it is sent by any client
                territoryId: placeTile.territoryId,
                amount: this.enemyUnitPlaceCount,
                population: placeTile.unitCount + this.enemyUnitPlaceCount,
                unitsRemaining: 0
            } }));
        }, this.addToDelay());
    }

    attack()
    {
        let attackingTerritory = null;

        setTimeout(func =>
        {
            console.log("Selecting territory to attack from...");
            
            let ownedTerritories = game.world.getTerritoriesOwnedBy(this.botId);
            shuffleArray(ownedTerritories);

            // have to make sure the tile has more than 2 fellas in it
            for (const tile of ownedTerritories)
                if (tile.unitCount >= 2)
                {
                    attackingTerritory = tile;
                    console.log(`Selected territory ${attackingTerritory.territoryId} to attack from.`);
                    break;
                }
                else
                    console.log(tile.unitCount);

            if (attackingTerritory === null)
            {
                console.warn("Failed to find suitable territory to attack from.");
                return;
            }

            attackingTerritory.raise();
            attackingTerritory.material.color.setHex(Colors.enemySelectedColor);

            let unownedTerritories = game.world.getTerritoriesNotOwnedBy(this.botId);
            shuffleArray(unownedTerritories);

            for (const tile of unownedTerritories)
            {
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
        }, this.addToDelay());

        let defendingTerritory = null;

        setTimeout(func =>
        {
            if (attackingTerritory === null)
            {
                console.warn("attackingTerritory is null, skipping attack.");
                return;
            }

            console.log(`Searching for invadeable neighbors in tile ${attackingTerritory.territoryId}...`);

            for (const tile of attackingTerritory.getInvadeableNeighbors())
            {
                if (tile instanceof WorldObject)
                {
                    console.log(tile);
                    tile.raise();
                    tile.material.color.setHex(Colors.ownedSelectedColor);
                    defendingTerritory = tile;
                    break;
                }
                // if somehow something other than a tile or null gets
                // put into the invadeable neighbors array
                else if (tile !== null)
                    console.warn(tile);
            }
        }, this.addToDelay());

        setTimeout(func =>
        {
            if (attackingTerritory === null || defendingTerritory === null)
            {
                console.warn("attackingTerritory or defendingTerritory is null, skipping attack.");
                return;
            }

            let attackingPopulation = attackingTerritory.unitCount;
            let defendingPopulation = defendingTerritory.unitCount;

            console.log(`Attacking ${defendingTerritory.territoryId} (${defendingPopulation} troops) from ${attackingTerritory.territoryId} (${attackingPopulation} troops).`);

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
        }, this.addToDelay());
    }

    moveUnits()
    {
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
                    if (game.world.tiles[tileId].invadeableNeighbors.length > 0)
                        if (game.world.tiles[tileId].unitCount > 1)
                        {
                            moveStart = game.world.tiles[tileId];
                            iterations = 0; // restart and find the end
                        }
                }
                else
                {
                    // tries to move units into territories that can be attacked and have less than 15 units
                    if (game.world.tiles[tileId].invadeableNeighbors.length > 0)
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
        }, this.addToDelay());
            
        setTimeout(func =>
        {
            if (moveStart !== null && moveEnd !== null)
            {
                moveEnd.raise();
                moveEnd.material.color.setHex(Colors.enemySelectedColor);
            }
            else
                console.log("skipping move 2");
        }, this.addToDelay());
            
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
        }, this.addToDelay());
    }
}
