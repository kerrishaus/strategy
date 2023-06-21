import { GameWorld } from "./GameWorld.js";

import { NetworkClientState } from "./states/NetworkClientState.js";
import { UnitMoveState      } from "./states/UnitMoveState.js";
import { AttackState        } from "./states/AttackState.js";
import { UnitDropState      } from "./states/UnitDropState.js";
import { BotTurnState } from "./states/BotTurnState.js";
import { MainMenuState } from "./states/MainMenuState.js";

export class Game
{
    constructor(networked = false, lobby)
    {
        console.log(lobby);

        this.setNetworked(networked);

        this.clients = [0, 1];

        this.ownerId             = lobby.ownerId;

        this.currentTurnClientId = -1;
        this.currentTurnStage    = -1;

        this.turnStages = [
            "unitDropState",
            "attackState",
            "unitMoveState"
        ]

        this.world = new GameWorld();

        const world = this.world.generateWorld(lobby.width, lobby.height);

        this.world.loadWorld(world);

        if (clientId == this.ownerId)
        {
            this.world.applyTerritories(this.world.calculateTerritories(this.clients.length));

            console.log(this.world.territories);

            this.world.calculateInvadeableTerritories();

            if (networked)
            {
                socket.send(JSON.stringify({ command: "worldData", territories: this.world.territories }));
            }
        }
        
        // if we are not the owner of this lobby, we wait until we receive the world data

        this.setTurn(this.ownerId);
        this.setStage(0);
    }

    setNetworked(useNetwork)
    {
        if (window.networked == useNetwork)
            return;

        window.networked = useNetwork;

        $("#debug-networked").text(networked);

        if (networked && !useNetwork)
        {
            // TODO: remove all network event listeners. i don't know how though lol
            return;
        }

        $(document).on("serverDisconnected", function(event)
        {
            stateManager.changeState(new MainMenuState());
        });

        $(document).on("worldData", function(event)
        {
            // ignore incoming world data if we're the host
            if (game.ownerId == clientId)
            {
                console.log("Ignoring networked world data.");
                return;
            }

            console.log("Loading world data from network...", event.detail);
            game.world.applyTerritories(event.detail.territories);
        });

        $(document).on("clientNextStage", function(event)
        {
            if (networked)
                socket.send(JSON.stringify({ command: "nextStage" }));
        });

        $(document).on("nextTurn", function(event)
        {
            game.setTurn(event.detail.clientId);
            game.setStage(0);
        });

        $(document).on("setStage", function(event)
        {
            console.log(event);
            game.setStage(event.detail.stageId);
        });

        $(document).on("clientJoin", function(event)
        {
            addClient(event.detail.clientId);
        });

        $(document).on("clientLeave", function(event)
        {
            removeClient(event.detail.clientId);
        });
    }

    addClient(clientId, client)
    {
        this.clients.push(clientId, client);

        console.log(`Client ${clientId} joined.`);
    }

    removeClient(clientId)
    {
        // TODO: figure out how to remove something from an array again

        console.log(`Client ${clientId} left.`);
    }

    // uses an underscore because clientId is a global value
    // which refers to the id of the local player
    setTurn(_clientId)
    {
        console.log(`${_clientId}'s turn.`);

        // set currentTurnClientId to whatever client is next
        this.currentTurnClientId = _clientId;

        $("#playerName").text(this.currentTurnClientId);
        $("#debug-turnClientId").text(this.currentTurnClientId);
        this.setStage(0);

        // check if currentTurnClientId matches the local client id
        if (this.currentTurnClientId == clientId)
        {
            console.log(`Our turn! Us: ${this.currentTurnClientId}`);

            $("#nextStateButton").attr("data-visibility", null);
        }
        else
        {
            console.log("Someone else's turn.");

            $("#nextStateButton").attr("data-visibility", "hidden");

            if (networked)
                stateManager.changeState(new NetworkClientState());
            else
                stateManager.changeState(new BotTurnState());
        }

        $("#debug-turn").text(this.currentTurnClientId);
    }

    setStage(stageId)
    {
        console.log(`Stage ${stageId}.`);

        // TODO: change "round" in roundType and roundSpace to "turn"
        $(".roundSpace.active").removeClass("active");
        $("#roundType").children()[stageId].classList.add("active");
        $(".gameStatus").attr("data-state", stageId);

        this.stageId = stageId;

        if (this.currentTurnClientId == clientId)
        {
            if (stageId == 0)
                stateManager.changeState(new UnitDropState());
            else if (stageId == 1)
                stateManager.changeState(new AttackState());
            else if (stageId == 2)
                stateManager.changeState(new UnitMoveState());
        }

        $("#debug-stage").text(this.stageId);
    }

    // moves all territories back down and applies their idle colours
    resetTerritoryGraphics()
    {
        for (const object of this.world.tiles)
        {
            object.lower();
            object.material.color.setHex(Colors.ownedColor);

            //object.destroyUnitPlaceDialog();
        }
    }

    dropUnits(clientId, territoryId, amount)
    {
        if (this.currentTurnClientId != clientId)
        {
            console.error("currentTurnClientId does match clientId that requested action.");
            return;
        }
    }

    attack(forClientId, againstClientId, fromTerritoryId, toTerritoryId, unitCount)
    {
        if (this.currentTurnClientId != clientId)
        {
            console.error("currentTurnClientId does match clientId that requested action.");
            return;
        }
    }

    moveUnits(clientId, fromTerritoryId, toTerritoryId, amount)
    {
        if (this.currentTurnClientId != clientId)
        {
            console.error("currentTurnClientId does match clientId that requested action.");
            return;
        }

        // TODO: make sure this.currentTurnClientId matches fromTerritory's owner

        if (amount <= 0)
        {
            console.error("0 units chosen to move.");
            return;
        }

        const fromTerritory = this.world.tiles[fromTerritoryId];
        const toTerritory = this.world.tiles[toTerritoryId];
        
        // 1 unit must stay behind to maintain ownership of territory
        if (amount > fromTerritory.unitCount - 1)
        {
            console.error("Requested to move too many units.");
            return;
        }

        fromTerritory.unitCount -= amount;
        toTerritory.unitCount += amount;
        
        fromTerritory.label.element.innerHTML = fromTerritory.unitCount;
        toTerritory.label.element.innerHTML = toTerritory.unitCount;
    }
}