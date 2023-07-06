import { Group, PlaneGeometry, MeshBasicMaterial, FrontSide, Mesh } from "https://kerrishaus.com/assets/threejs/build/three.module.js";
			
import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import * as Colors from "./Colors.js";

import { WorldObject } from "./WorldObject.js";

export class GameWorld extends Group
{
    constructor()
    {
        super();

        // a list of 
        //this.territoryOwnership = new Array(clientCount);
        
        //this.loadWorld(this.generateWorld(clientCount));
        
        //this.calculateInvadeableTerritories();

        this.width = 0;
        this.height = 0;
    }
    
    update(deltaTime)
    {
        for (const tile of this.children)
            if (tile instanceof WorldObject)
                tile.update(deltaTime);
    }
    
    add(object)
    {
        object.world = this;
        super.add(object);
    }

    generateWorld(width, height)
    {
        this.width  = width;
        this.height = height;

        const tiles = new Array(width * height);

        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                const arrayPosition = x + y * width;

                const object = new WorldObject(2, 2, Colors.unownedColor, arrayPosition);

                object.targetPosition.x = x + 1.0 * x;
                object.targetPosition.y = y + 1.0 * y;
                object.targetPosition.z = 0;
                
                tiles[arrayPosition] = object;
            }
        }

        return { width: width, height: height, tiles: tiles };
    }

    distributeTerritories(clients)
    {
        console.log(`Distributing ${this.tiles.length} territories to ${clients.length} clients.`);

        const territories = new Array(this.tiles.length);

        const territoryOwnerCount = new Array(clients.length);

        for (const tile in this.tiles)
        {
            // getRandomInt returns between 0 and client length, which is okay *i think*
            const owner = clients[getRandomInt(clients.length)];

            if (territoryOwnerCount[owner] > 4)
                continue;

            territoryOwnerCount[owner]++;

            territories[tile] = owner;
        }

        return territories;
    }

    applyTerritories(territories)
    {
        console.log("Applying territories to world", territories);

        for (const territory in territories)
        {
            //this.tiles[territory].label.element.innerHTML = territories[territory];

            // TODO: I don't know if the assignment below is necessary, but it was causing
            // some problems because it was setting the territoryId to a string.
            // I've commented it out and everything seems to be working fine without it.
            //this.tiles[territory].territoryId             = territory;
            this.tiles[territory].userData.ownerId        = territories[territory];
            this.tiles[territory].label.element.innerHTML = this.tiles[territory].unitCount;

            if (this.tiles[territory].userData.ownerId == clientId)
                this.tiles[territory].material.color.setHex(Colors.ownedColor);
            else
                this.tiles[territory].material.color.setHex(Colors.enemyColor);
        }

        this.territories = territories;
    }

    loadWorld(world)
    {
        for (const object of world.tiles)
            this.add(object);
        
        this.tiles = world.tiles;

        const floorGeometry = new PlaneGeometry(world.width + world.width * 1.3 + 3, world.height + world.height * 1.3 + 3);
        const floorMaterial = new MeshBasicMaterial({color: 0x256d8f, side: FrontSide });
        const floor = new Mesh(floorGeometry, floorMaterial);
        floor.position.x = world.width / 2 + 1.1 * world.width / 2 - 0.7;
        floor.position.y = world.height / 2 + 1.1 * world.height / 2 - 0.7;
        this.add(floor);
    }
    
    calculateInvadeableTerritories()
    {
        console.log("Calculating invadeable territories");

        for (const tile of this.tiles)
        {
            const id = tile.territoryId;

            // TODO: I'm not sure why we have to reset this, I figured we would just be
            // able to access the first four elements and overwrite them but apparently
            // if they're null we can't assign them??
            tile.invadeableNeighbors = new Array(4);

            if (id - 1 >= 0)
                if (Math.trunc((id - 1) / this.width) == Math.trunc(id / this.width))
                    tile.invadeableNeighbors[0] = this.tiles[id - 1].userData.ownerId != tile.userData.ownerId ? this.tiles[id - 1] : null;

            if (id + 1 < this.tiles.length)
                if (Math.trunc((id + 1) / this.width) == Math.trunc(id / this.width))
                    tile.invadeableNeighbors[1] = this.tiles[id + 1].userData.ownerId != tile.userData.ownerId ? this.tiles[id + 1] : null;
                
            if (id - this.width >= 0)
                tile.invadeableNeighbors[2]     = this.tiles[id - this.width].userData.ownerId != tile.userData.ownerId ? this.tiles[id - this.width] : null;
            else
                tile.invadeableNeighbors[2]     = null
                
            if (id + this.width < this.tiles.length)
                tile.invadeableNeighbors[3]     = this.tiles[id + this.width].userData.ownerId != tile.userData.ownerId ? this.tiles[id + this.width] : null;
            else
                tile.invadeableNeighbors[3]     = null
                
            if (tile.invadeableNeighbors[0] === null &&
                tile.invadeableNeighbors[1] === null &&
                tile.invadeableNeighbors[2] === null &&
                tile.invadeableNeighbors[3] === null)
                {
                    tile.invadeableNeighbors = null;
                    console.log(id + " has no invadeable neighbors.");
                }
            else
                console.log(`${id} can invade ${tile.invadeableNeighbors[0]}, ${tile.invadeableNeighbors[1]}, ${tile.invadeableNeighbors[2]}, and ${tile.invadeableNeighbors[3]}.`);
        }
    }
};