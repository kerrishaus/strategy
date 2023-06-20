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
        this.states[this.states.length - 1].init();
        console.log("StateMachine: Finished initialising " + state.constructor.name + ".");

        $("#debug-state").text(state.constructor.name);
    }
    
    popState()
    {
        const state = this.states[this.states.length - 1];

        console.log(state);

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
    
    onHover(object)
    {
        //this.states[this.states.length - 1].onHover(object);
    }
    
    onStopHover(object)
    {
        //this.states[this.states.length - 1].onStopHover(object);
    }
    
    onMouseDown(event, object)
    {
        //this.states[this.states.length - 1].onMouseDown(event, object);
    }
    
    onKeyDown(event)
    {
        //this.states[this.states.length - 1].onKeyDown(event);
    }
    
    update(deltaTime)
    {
        if (this.states.length > 0)
            this.states[this.states.length - 1].update(deltaTime);
    }
};