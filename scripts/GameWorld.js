import { Group, PlaneGeometry, MeshBasicMaterial, FrontSide, Mesh } from "https://kerrishaus.com/assets/threejs/build/three.module.js";
			
import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

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
    }
    
    update(deltaTime)
    {
        for (const tile of this.tiles)
            tile.update(deltaTime);
    }
    
    add(object)
    {
        object.world = this;
        super.add(object);
    }

    generateWorld(width, height, clientCount)
    {
        const tiles = new Array(this.width * this.height);

        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const arrayPosition = x + y * this.width;
                
                const object = new WorldObject(2, 2, "#000000");
                
                object.targetPosition.x = x + 1.0 * x;
                object.targetPosition.y = y + 1.0 * y;
                object.targetPosition.z = 0;
                
                object.userData.territoryId = arrayPosition;
                
                /*
                object.userData.owner = ;
                object.unitCount = getRandomInt(4) + 1;
                object.label.element.innerHTML = object.unitCount;
                */
                
                tiles[arrayPosition] = object;
            }
        }

        return tiles;
    }

    loadWorld(world)
    {
        for (const object of world)
            this.add(object);
        
        this.tiles = world;

        this.calculateInvadeableTerritories();

        const floorGeometry = new PlaneGeometry(width + width * 1.3 + 3, height + height * 1.3 + 3);
        const floorMaterial = new MeshBasicMaterial({color: 0x256d8f, side: FrontSide });
        const floor = new Mesh(floorGeometry, floorMaterial);
        floor.position.x = width / 2 + 1.1 * width / 2 - 0.7;
        floor.position.y = height / 2 + 1.1 * height / 2 - 0.7;
        this.add(floor);
    }
    
    calculateInvadeableTerritories()
    {
        // TODO: if the tile is invadeable, set its color to red

        // calculate invadeable neighbors
        for (const tile of this.tiles)
        {
            const id = tile.userData.territoryId;
            
            delete tile.invadeableNeighbors;
            tile.invadeableNeighbors = new Array(4);
            
            if (id - 1 >= 0)
                if (Math.trunc((id - 1) / this.width) == Math.trunc(id / this.width))
                    tile.invadeableNeighbors[0] = this.tiles[id - 1].userData.team != tile.userData.team ? this.tiles[id - 1] : null;
                
            if (id + 1 < this.tiles.length)
                if (Math.trunc((id + 1) / this.width) == Math.trunc(id / this.width))
                    tile.invadeableNeighbors[1] = this.tiles[id + 1].userData.team != tile.userData.team ? this.tiles[id + 1] : null;
                
            if (id - this.width >= 0)
                tile.invadeableNeighbors[2]     = this.tiles[id - this.width].userData.team != tile.userData.team ? this.tiles[id - this.width] : null;
            else
                tile.invadeableNeighbors[2]     = null
                
            if (id + this.width < this.tiles.length)
                tile.invadeableNeighbors[3]     = this.tiles[id + this.width].userData.team != tile.userData.team ? this.tiles[id + this.width] : null;
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
        }
    }
};