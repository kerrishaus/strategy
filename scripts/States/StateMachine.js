export class StateMachine
{
    constructor()
    {
        this.states = new Array();

        console.log("StateMachine is ready.");
    }
    
    cleanup()
    {
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
        this.states[this.states.length - 1].init();

        $("#debug-state").text(state.constructor.name);
        
        console.log("Pushed new state.");
    }
    
    popState()
    {
        this.states[this.states.length - 1].cleanup();
        this.states.pop();
        
        if (this.states.length > 0)
            this.states[this.states.length - 1].resume();
            
        console.log("Popped state.");
    }
    
    changeState(state)
    {
        this.popState();
        this.pushState(state);
        
        console.log("Changed state.");
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