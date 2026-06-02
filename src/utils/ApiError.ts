interface ApiErrorData {
    statusCode: number;
    data: null;
    errors: any[];
    success: boolean; 
}

class ApiError extends Error implements ApiErrorData {

    statusCode  : number;
    data        : null =null;
    success     : boolean = false;
    errors      : any[];

    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: any[] = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError};
