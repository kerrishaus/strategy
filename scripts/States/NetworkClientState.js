import { State } from "./State.js";

import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

import *  as Colors from "../Colors.js";

import { WorldObject } from "../WorldObject.js";
import { UnitDropState } from "./UnitDropState.js";

export class NetworkClientState extends State
{
    constructor()
    {
        super();
    }
    
    init(stateMachine)
    {
        this.stateMachine = stateMachine;
        this.stateMachine.setStateName("networkClientState");
    }
}
