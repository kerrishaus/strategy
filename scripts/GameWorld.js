import { Group, PlaneGeometry, MeshBasicMaterial, FrontSide, Mesh, Box3, Vector3 } from "https://kerrishaus.com/assets/threejs/build/three.module.js";
			
import * as Colors from "./Colors.js";

import { WorldObject } from "./WorldObject.js";

import { shuffleArray } from "./Utility.js";

let depth = -20;

export class GameWorld extends Group
{
    constructor()
    {
        super();

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

    // each client does this work on their own before
    // territory information is sent
    generateTerrain(width, height)
    {
        this.width  = width;
        this.height = height;

        // used to make the squares kind of spread out from the center of the map
        const mapMidPoint = new Vector3(this.width, this.height, depth * 2);

        const tiles = new Array(this.width * this.height);

        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                const arrayPosition = x + y * this.width;

                const object = new WorldObject(2, 2, Colors.unownedColor, arrayPosition, mapMidPoint);

                // this is just kinda cool will probably remove later
                setTimeout(() =>
                {
                    object.targetPosition.x = x + 1.0 * x;
                    object.targetPosition.y = y + 1.0 * y;
                    object.targetPosition.z = depth * 2;
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
                if (Math.trunc((id - 1) / this.width) == Math.trunc(id / this.width))
                    tile.userData.neighbors.leftNeighbor = tiles[id - 1];

            // right
            if (id + 1 < tiles.length)
                if (Math.trunc((id + 1) / this.width) == Math.trunc(id / this.width))
                    tile.userData.neighbors.rightNeighbor = tiles[id + 1];
                
            // top
            if (id - this.width >= 0)
                tile.userData.neighbors.topNeighbor = tiles[id - this.width];
                
            // bottom
            if (id + this.width < tiles.length)
                tile.userData.neighbors.bottomNeighbor = tiles[id + this.width];
        }

        return { width: this.width, height: this.height, tiles: tiles };
    }

    // FIXME: game distributes properly to clients - 1
    distributeTerritories(clients)
    {
        console.log(`Distributing ${this.tiles.length} territories to ${clients.length()} clients.`);

        const territories = new Array(this.tiles.length);

        for (const tile in this.tiles)
        {
            // getRandomInt returns between 0 and client length, which is okay *i think*
            // TODO: clients are now stored with their ID as the index in the array,
            // this might not work with non-consecutive client IDs! D:

            // TODO: this needs to be improved, it doesn't give every client enough territory
            const  owner = clients.getRandom();

            // only assign clients some of the board, i don't know how to explain the math oof
            if (owner.ownedTerritories <= ((this.tiles.length / clients.length()) / 2))
            {
                owner.ownedTerritories++;
                territories[tile] = owner.id;

                continue;
            }

            // unowned territories
            territories[tile] = 0;
        }

        shuffleArray(territories)

        return territories;
    }

    applyTerritories(territories, clients)
    {
        console.log("Applying territories to world", territories);

        for (const territory in territories)
        {
            this.tiles[territory].userData.ownerId = territories[territory];

            if (this.tiles[territory].userData.ownerId > 0)
                this.tiles[territory].addUnits(1);

            this.tiles[territory].label.element.innerHTML = this.tiles[territory].unitCount;

            this.tiles[territory].material.color.set(clients.getById(territories[territory])?.color ?? Colors.unownedColor);
        }
    }

    loadWorld(terrain)
    {
        const box = new Box3();
        box.makeEmpty();

        for (const object of terrain.tiles)
        {
            this.add(object);
            box.expandByObject(object); // this doesn't seem to be working
        }
        
        // TODO: what is this doing?
        this.tiles = terrain.tiles;

        const floorGeometry = new PlaneGeometry(terrain.width + terrain.width * 1.3 + 3, terrain.height + terrain.height * 1.3 + 3);
        const floorMaterial = new MeshBasicMaterial({color: 0x256d8f, side: FrontSide });
        const floor = new Mesh(floorGeometry, floorMaterial);
        floor.position.x = terrain.width / 2 + 1.1 * terrain.width / 2 - 0.7;
        floor.position.y = terrain.height / 2 + 1.1 * terrain.height / 2 - 0.7;
        floor.position.z = depth * 2;
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
        window.cameraPosition.z = depth;

        console.log("distance: " + distance);
        
        window.cameraPosition.x = ((this.width / 2) * 2) - 1;
        window.cameraPosition.y = ((this.height / 2) * 2) - 1;

        window.cameraRotation.setFromAxisAngle(new Vector3(0, 0, 0), 0);
    }
    
    calculateInvadeableTerritories()
    {
        console.log("Calculating invadeable territories");

        for (const tile of this.tiles)
        {
            tile.invadeableNeighbors = [];

            for (const [position, neighbor] of Object.entries(tile.userData.neighbors))
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