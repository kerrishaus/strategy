import { Group, PlaneGeometry, MeshBasicMaterial, FrontSide, Mesh, Box3, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";
			
import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import * as Colors from "./Colors.js";

import { WorldObject } from "./WorldObject.js";

export class GameWorld extends Group
{
    constructor()
    {
        super();

        this.width = 0;
        this.height = 0;

        this.ownedTerritories = 0;
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

    // each client does this work on their own before
    // territory information is sent
    generateTerrain(width, height)
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

                // this is just kinda cool will probably remove later
                setTimeout(() =>
                {
                    object.targetPosition.x = x + 1.0 * x;
                    object.targetPosition.y = y + 1.0 * y;
                    object.targetPosition.z = 0;
                }, 0 + (20 * arrayPosition));
                
                tiles[arrayPosition] = object;
            }
        }

        // TODO: this can probably be calculated when the object is created, but I'm too
        // tired to figure out the math for stuff like that right now, and this is better
        // than recalculating all of it every time the ownership of territories is changed
        for (let tile of tiles)
        {
            const id = tile.territoryId;

            tile.userData.neighbors = {
                leftNeighbor:   null,
                rightNeighbor:  null,
                topNeighbor:    null,
                bottomNeighbor: null,
            };

            // left
            // make sure the id doesn't go below zero so we don't access the array out of bounds
            if (id - 1 >= 0)
                // make sure both territories are on the same row
                if (Math.trunc((id - 1) / width) == Math.trunc(id / width))
                    tile.userData.neighbors.leftNeighbor = tiles[id - 1];

            // right
            if (id + 1 < tiles.length)
                if (Math.trunc((id + 1) / width) == Math.trunc(id / width))
                    tile.userData.neighbors.rightNeighbor = tiles[id + 1];
                
            // top
            if (id - width >= 0)
                tile.userData.neighbors.topNeighbor = tiles[id - width];
                
            // bottom
            if (id + width < tiles.length)
                tile.userData.neighbors.bottomNeighbor = tiles[id + width];
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
            this.tiles[territory].userData.ownerId        = territories[territory];
            this.tiles[territory].label.element.innerHTML = this.tiles[territory].unitCount;

            if (this.tiles[territory].userData.ownerId == clientId)
            {
                this.tiles[territory].material.color.setHex(Colors.ownedColor);
                this.ownedTerritories += 1;
            }
            else
                this.tiles[territory].material.color.setHex(Colors.enemyColor);
        }

        this.territories = territories;
    }

    loadWorld(world)
    {
        const box = new Box3();
        box.makeEmpty();

        for (const object of world.tiles)
        {
            this.add(object);
            box.expandByObject(object); // this doesn't seem to be working
        }
        
        // TODO: what is this doing?
        this.tiles = world.tiles;

        const floorGeometry = new PlaneGeometry(world.width + world.width * 1.3 + 3, world.height + world.height * 1.3 + 3);
        const floorMaterial = new MeshBasicMaterial({color: 0x256d8f, side: FrontSide });
        const floor = new Mesh(floorGeometry, floorMaterial);
        floor.position.x = world.width / 2 + 1.1 * world.width / 2 - 0.7;
        floor.position.y = world.height / 2 + 1.1 * world.height / 2 - 0.7;
        this.add(floor);

        const size = new Vector3();
		const center = new Vector3();

        box.getSize(size);
        box.getCenter(center);

        console.log(box, size, center);

        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = 12 * Math.max(fitHeightDistance, fitWidthDistance);

        window.cameraPosition.x = center.x;
        window.cameraPosition.y = center.y;
        window.cameraPosition.z = distance;
        
        window.cameraPosition.x = ((this.width / 2) * 2) - 1;
        window.cameraPosition.y = ((this.height / 2) * 2) - 1;
    }
    
    calculateInvadeableTerritories()
    {
        console.log("Calculating invadeable territories");

        for (const tile of this.tiles)
        {
            tile.invadeableNeighbors = [];

            for (const [which, neighbor] of Object.entries(tile.userData.neighbors))
            {
                if (neighbor === null)
                    continue;

                if (neighbor.userData.ownerId != tile.userData.ownerId)
                    tile.invadeableNeighbors.push(neighbor);
            }
        }
    }

    getTerritoriesOwnedBy(_clientId)
    {
        const invadeableTiles = [];

        for (const tile of this.tiles)
            if (tile.userData.ownerId == _clientId)
                invadeableTiles.push(tile);

        return invadeableTiles;
    }

    getTerritoriesInvadeableBy(_clientId)
    {
        const ownedTerritories = this.getTerritoriesOwnedBy(_clientId);

        for (const tile of ownedTerritories)
        {
        }
    }

    getTerritoriesNotOwnedBy(_clientId)
    {
        let invadeableTiles = [];

        for (const tile of this.tiles)
            if (tile.userData.ownerId != _clientId)
                invadeableTiles.push(tile);

        return invadeableTiles;
    }
};