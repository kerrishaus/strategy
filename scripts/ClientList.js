import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

export class ClientList
{
    constructor(clients)
    {
        this.clients = clients;

        // TODO: eventually I'd like the host to be the one who goes first, but this is fine for now.
        this.clients.sort((a, b) => {
            return a.id > b.id;
        });

        // an array of numerically ordered keys with the clientId as the value
        this.clientIdToArrayPosition = new Map;
        this.numericallyOrderedClientIds = [];

        for (const clientId in this.clients)
            if (this.clients[clientId] instanceof Object)
            {
                this.clientIdToArrayPosition.set(this.clients[clientId].id, clientId);
                this.numericallyOrderedClientIds[clientId] = this.clients[clientId].id;
            }

        this.internalIterator = 0;

        console.log("ClientList:", this.clients, this.clientIdToArrayPosition, this.numericallyOrderedClientIds);
    }

    advanceInternalIterator()
    {
        if (this.internalIterator >= this.clientIdToArrayPosition.size - 1)
            this.internalIterator = 0;
        else
            this.internalIterator++;

        console.log("ClientList internal iterator: " + this.internalIterator);
        console.log("Client ID: " + this.current().id);
    }

    getById(clientId)
    {
        return this.clients[this.clientIdToArrayPosition.get(clientId)];
    }

    getRandom()
    {
        return this.clients[this.clientIdToArrayPosition.get(this.numericallyOrderedClientIds[getRandomInt(this.numericallyOrderedClientIds.length)])];
    }

    current()
    {
        return this.clients[this.clientIdToArrayPosition.get(this.numericallyOrderedClientIds[this.internalIterator])];
    }

    // selects the next client
    next()
    {
        return this.clients[this.clientIdToArrayPosition[this.advanceInternalIterator()]];
    }

    length()
    {
        return this.numericallyOrderedClientIds.length;
    }
}