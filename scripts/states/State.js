export class State extends EventTarget
{
    constructor(...args)
    {
        super();

        this.constructorArgs = args;

        console.warn("constructor args", args, this.constructorArgs);
    }
    
    init()
    {
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
    
    update(deltaTime)
    {
        
    }
};