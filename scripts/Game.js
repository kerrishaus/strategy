import { GameWorld } from "./GameWorld.js";

export class Game
{
    constructor(networked = false)
    {
        this.setNetworked(networked);

        this.clients = [];

        this.ownerId             = -1;

        this.currentTurnClientId = -1;
        this.currentTurnStage    = -1;

        this.turnStages = [
            "unitDropState",
            "attackState",
            "unitMoveState"
        ]

        this.world = new GameWorld(10, 10);

        this.setTurn(0);
        this.setStage(0);
    }

    setNetworked(networked)
    {
        if (this.networked == networked)
            return;

        this.networked = networked;

        if (this.networked && !networked)
        {
            // TODO: remove all network event listeners. i don't know how though lol
            return;
        }

        $(document).on("buildGameWorld", function(event)
        {
            game.buildGameWorld(event.details.worldData);
        });

        $(document).on("clientNextStage", function(event)
        {
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

        $(document).on("netClientJoin", function(event)
        {
            addClient(event.detail.clientId);
        });

        $(document).on("netClientLeave", function(event)
        {
            removeClient(event.detail.clientId);
        });

        $(document).on("netGameStart", function(event)
        {
            startGame();
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

    setTurn(clientId)
    {
        console.log(`${clientId}'s turn.`);

        this.currentTurnClientId = clientId;
        $("#playerName").text(clientId);
        this.setStage(0);

        if (this.networked)
        {
            if (this.currentTurnClientId == network.clientId)
                $("#nextStateButton").attr("data-visibility", null);
            else
                $("#nextStateButton").attr("data-visibility", "hidden");
        }
        else
            return // TODO: actually do something here waaa
    }

    setStage(stageId)
    {
        console.log(`Stage ${stageId}.`);

        // TODO: change "round" in roundType and roundSpace to "turn"
        $(".roundSpace.active").removeClass("active");
        $("#roundType").children()[stageId].classList.add("active");
        $(".gameStatus").attr("data-state", stageId);

        this.stageId = stageId;
    }

    dropUnits(clientId, territoryId)
    {
        if (this.currentTurnClientId != clientId)
        {
            console.error("currentTurnClientId does match clientId that requested action.");
            return;
        }
    }

    attack(forClientId, againstClientId)
    {
        if (this.currentTurnClientId != clientId)
        {
            console.error("currentTurnClientId does match clientId that requested action.");
            return;
        }
    }

    moveUnits(clientId, fromTerritoryId, toTerritoryId)
    {
        if (this.currentTurnClientId != clientId)
        {
            console.error("currentTurnClientId does match clientId that requested action.");
            return;
        }
    }
}