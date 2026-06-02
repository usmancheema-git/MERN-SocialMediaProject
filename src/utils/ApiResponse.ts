class ApiResponse<T> {
    public statusCode: number;
    public success: boolean;
    public data: T;
    public message?: string

constructor(statusCode: number,data: T,message?: string){
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.data = data;
    this.message = message;
}
}

export { ApiResponse };