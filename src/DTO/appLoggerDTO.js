
export class appLoggerDTO{
    constructor(error){
        
        this.name=error.name
        this.cause=error.message
        this.stack=error.stack
    }
}