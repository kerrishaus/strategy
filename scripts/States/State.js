export class State
{
    constructor()
    {
        this.stateNumber = -1;
    }
    
    init(stateMachine)
    {
        this.stateMachine = stateMachine;
        this.stateMachine.setStateNumber(this.stateNumber);
    }
    
    cleanup()
    {
        
    }
    
    pause()
    {
        
    }
    
    resume()
    {
        
    }
    
    onHover(object)
    {
        
    }
    
    onStopHover(object)
    {
        
    }
    
    onMouseDown(event, object)
    {
        
    }
    
    onKeyDown(event)
    {
        
    }
    
    update(deltaTime)
    {
        
    }
};