import { GameWorld } from "./GameWorld.js";

import { OpponentState } from "./states/OpponentState.js";
import { UnitMoveState      } from "./states/UnitMoveState.js";
import { AttackState        } from "./states/AttackState.js";
import { UnitDropState      } from "./states/UnitDropState.js";
import { BotTurnState } from "./states/BotTurnState.js";
import { MainMenuState } from "./states/MainMenuState.js";

import * as Colors from "./Colors.js";

export class Game
{
    constructor(networked = false, lobby)
    {
        console.log(`Starting game with lobby: `, lobby);

        this.setNetworked(networked);

        this.clients = lobby.clients;

        $("#debug-clientCount").text(this.clients.length);

        this.ownerId = lobby.ownerId;

        $("#debug-lobbyOwnerId").text(this.ownerId);

        this.turnStages = [
            "unitDropState",
            "attackState",
            "unitMoveState"
        ]

        this.world = new GameWorld();

        const terrain = this.world.generateTerrain(lobby.width, lobby.height);

        this.world.loadWorld(terrain);

        if (clientId == this.ownerId)
        {
            const territories = this.world.distributeTerritories(this.clients);

            if (networked)
                socket.send(JSON.stringify({ command: "worldData", territories: territories }));

            this.world.applyTerritories(territories, this.clients);

            this.world.calculateInvadeableTerritories();
        }
        
        // if we are not the owner of this lobby, we wait until we receive the world data

        // always starts with the first client, which SHOULD be the lobby host
        this.currentTurnClientIndex = 0;
        this.currentTurnClientId    = this.clients[this.currentTurnClientIndex].id;
        this.currentTurnStage       = -1;
        
        console.log(this.clients, this.currentTurnClientIndex, this.currentTurnClientId);

        this.setTurn(this.currentTurnClientId);
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
            game.world.applyTerritories(event.detail.territories, this.clients);
            game.world.calculateInvadeableTerritories();
        });

        $(document).on("requestNextStage", function(event)
        {
            if (game.currentTurnClientId != clientId)
            {
                console.error(`Skipping request for next stage because it is not our turn. Current turn owner: ${game.currentTurnClientId}, us: ${clientId}`);
                return;
            }

            if (networked)
                socket.send(JSON.stringify({ command: "nextStage" }));
            else
                document.dispatchEvent(new CustomEvent("nextStage", { detail: { clientId: clientId } }));
        });

        $(document).on("nextStage", function(event)
        {
            if (event.detail.clientId != game.currentTurnClientId)
            {
                console.error("nextStage requested by invalid client. Can only be requested by the current turn client. Current turn client ID:" + game.currentTurnClientId + ", requester: " + event.detail.clientId);
                return;
            }

            game.nextStage();
        });

        if (networked)
        {
            $(document).on("dropUnits", function(event) {
                socket.send(JSON.stringify({ command: "dropUnitsResult", ...event.detail }));
            });
        }
        else
        {
            $(document).on("dropUnits", function(event) {
                document.dispatchEvent(new CustomEvent("dropUnitsResult", { detail: event.detail }));
            });
        }

        $(document).on("dropUnitsResult", function(event)
        {
            const territoryId = event.detail.territoryId;
            const amount      = event.detail.amount;

            console.log(game.world.tiles);
            console.log(game.world.tiles[territoryId]);

            game.world.tiles[territoryId].addUnits(amount);

            $("#count").html(this.availableUnits);
        });
        
        if (networked)
        {
            $(document).on("attack", function(event) {
                socket.send(JSON.stringify({ command: "attackResult", ...event.detail }));
            });
        }
        else
        {
            $(document).on("attack", function(event) {
                document.dispatchEvent(new CustomEvent("attackResult", { detail: event.detail }));
            });
        }

        $(document).on("attackResult", function(event)
        {
            const attackingTerritory = game.world.tiles[event.detail.attacker];
            const defendingTerritory = game.world.tiles[event.detail.defender];

            attackingTerritory.unitCount = event.detail.attackerPopulation;
            defendingTerritory.unitCount = event.detail.defenderPopulation;

            if (event.detail.result == "won")
            {
                console.log(`${event.detail.clientId} now owns ${defendingTerritory.territoryId}.`);

                defendingTerritory.userData.ownerId = event.detail.clientId;
                defendingTerritory.material.color.set(game.clients[defendingTerritory.userData.ownerId].color);

                game.client[event.detail.clientId].ownedTerritories += 1;
                game.client[event.detail.defenderOwnerId].ownedTerritories -= 1;

                game.world.calculateInvadeableTerritories();
            }

            attackingTerritory.label.element.innerHTML = attackingTerritory.unitCount;
            defendingTerritory.label.element.innerHTML = defendingTerritory.unitCount;

            console.log(`New unit allocation: Attacker: ${attackingTerritory.unitCount}, Defender: ${defendingTerritory.unitCount}`);
        });

        if (networked)
        {
            $(document).on("moveUnits", function(event) {
                socket.send(JSON.stringify({ command: "moveUnitsResult", ...event.detail }));
            });
        }
        else
        {
            $(document).on("moveUnits", function(event) {
                document.dispatchEvent(new CustomEvent("moveUnitsResult", { detail: event.detail }));
            });
        }

        $(document).on("moveUnitsResult", function(event)
        {
            const originTerritory = game.world.tiles[event.detail.origin];
            const destinationTerritory = game.world.tiles[event.detail.destination];

            console.log(`Moving ${event.detail.amount} units from origin territory ${event.detail.origin} (${originTerritory.unitCount} -> ${event.detail.originPopulation}) to destination territory ${event.detail.destination} (${destinationTerritory.unitCount} -> ${event.detail.destinationPopulation})`);

            originTerritory.unitCount = event.detail.originPopulation;
            destinationTerritory.unitCount = event.detail.destinationPopulation;

            originTerritory.label.element.innerHTML = originTerritory.unitCount;
            destinationTerritory.label.element.innerHTML = destinationTerritory.unitCount;
        });
    }

    nextStage()
    {
        if (this.currentTurnStage >= 2)
        {
            console.log(`Starting next turn. ${this.currentTurnStage} >= 2`);

            if (this.currentTurnClientIndex >= this.clients.length - 1)
                this.currentTurnClientIndex = 0;
            else
                this.currentTurnClientIndex += 1;

            this.currentTurnClientId = this.clients[this.currentTurnClientIndex].id;
    
            console.log(`${this.currentTurnClientId}'s turn is starting. (${this.currentTurnClientIndex} index)`);
    
            game.setTurn(this.currentTurnClientId);
            game.setStage(0);
        }
        else
            game.setStage(this.currentTurnStage += 1);
    }

    // uses an underscore because clientId is a global value
    // which refers to the id of the local player
    setTurn(_clientId)
    {
        console.log(`Set to ${_clientId}'s turn.`);

        this.currentTurnClientId = _clientId;

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
                stateManager.changeState(new OpponentState());
            else
                stateManager.changeState(new BotTurnState());
        }

        $("#playerName").text(this.clients[this.currentTurnClientId].name);
        $(".gameStatus").css("--playerColor", this.clients[this.currentTurnClientId].color);
        $("#debug-turn").text(this.currentTurnClientIndex);
        $("#debug-turnClientId").text(this.currentTurnClientId);
    }

    setStage(stageId)
    {
        console.log(`Stage ${stageId}.`);

        this.currentTurnStage = stageId;

        // TODO: some checks to make sure the stage is valid.

        // TODO: change "round" in roundType and roundSpace to "turn"
        $(".roundSpace.active").removeClass("active");
        $("#roundType").children()[this.currentTurnStage].classList.add("active");
        $(".gameStatus").attr("data-state", this.currentTurnStage);

        if (this.currentTurnClientId == clientId)
        {
            if (this.currentTurnStage == 0)
                stateManager.changeState(new UnitDropState(Math.floor(this.clients[this.currentTurnClientId].ownedTerritories / 3)));
            else if (this.currentTurnStage == 1)
                stateManager.changeState(new AttackState());
            else if (this.currentTurnStage == 2)
                stateManager.changeState(new UnitMoveState());
        }

        this.resetTerritoryGraphics();

        $("#debug-stage").text(this.currentTurnStage);
    }

    // moves all territories back down and applies their idle colours
    resetTerritoryGraphics()
    {
        console.debug("Resetting territory graphcis.");

        for (const object of this.world.tiles)
        {
            object.lower();
            object.material.color.set(this.clients[object.userData.ownerId]?.color ?? Colors.unownedColor);

            //object.destroyUnitPlaceDialog();
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