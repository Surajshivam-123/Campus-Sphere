<<<<<<< HEAD
class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode<400;
    }
}

=======
class ApiResponse{
    constructor(statusCode,data,message="Sucess"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode<400;
    }
}

>>>>>>> a64e1eb (resolved some minor issues)
export default ApiResponse