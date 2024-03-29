export class StateMachine
{
    constructor()
    {
        this.states = new Array();

        console.log("StateMachine is ready.");
    }
    
    cleanup()
    {
        console.log("Cleaning up StateMachine...");

        for (state of this.states)
        {
            state.cleanup();
            state = null;
        }
        
        this.states.length = 0;
        
        console.log("StateMachine is cleaned up.");
    }

    pushState(state)
    {
        if (this.states > 1)
            this.states[this.states.length - 1].pause();
            
        this.states.push(state);
        state.stateMachine = this;
        
        console.log("StateMachine: Initialising " + state.constructor.name + "...");
        state.init.apply(state, state.constructorArgs);
        console.log("StateMachine: Finished initialising " + state.constructor.name + ".");

        $("#debug-state").text(state.constructor.name);
    }
    
    popState()
    {
        const state = this.states[this.states.length - 1];

        console.log("StateMachine: Cleaning up " + state.constructor.name + "...");
        state.cleanup();
        console.log("StateMachine: Cleaned up " + state.constructor.name + ".");

        this.states.pop();
        
        if (this.states.length > 0)
            this.states[this.states.length - 1].resume();
            
        console.log("StateMachine: Popped state.");
    }
    
    changeState(state)
    {
        console.log("StateMachine: Changing from " + this.states[this.states.length - 1].constructor.name + " to " + state.constructor.name);

        this.popState();
        this.pushState(state);
        
        console.log("StateMachine: Changed states.");
    }
    
    update(deltaTime)
    {
        if (this.states.length > 0)
            this.states[this.states.length - 1].update(deltaTime);
    }

    forwardEvent(event)
    {
        if (this.states.length > 0)
            this.states[this.states.length - 1].dispatchEvent(event);
    }

    duplicateEvent(event)
    {
        if (this.states.length > 0)
            this.states[this.states.length - 1].dispatchEvent(new event.constructor(event.type, event));
    }
};