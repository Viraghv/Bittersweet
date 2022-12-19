const BadRequest = require("../exceptions/BadRequest");
const userRepository = require("../repositories/userRepository");
const bcrypt = require('bcrypt');
const NotFound = require("../exceptions/NotFound");


module.exports.register = (userData) => {
    const errors = [];

    if(!userData.username?.trim() || !userData.email?.trim() ||
       !userData.password?.trim() || !userData.passwordAgain?.trim()){
        errors.push("Please fill in all fields");
    }

    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters");
    }

    if(userData.email?.trim().length > 100) {
        errors.push("Email can't be longer than 100 characters");
    }

    if(userData.email?.trim() &&
        !userData.email?.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        errors.push("Invalid email");
    }

    if(userData.password?.trim() !== "" && userData.password?.trim().length < 6){
        errors.push("Password must be at least 6 characters long")
    }

    if(userData.password !== userData.passwordAgain){
        errors.push("Passwords do not match");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    delete userData.passwordAgain;

    try {
        return userRepository.createUser(userData);
    } catch (exception){
        throw exception
    }

}

module.exports.login = async (loginData) => {
    if(!loginData.username?.trim() || !loginData.password?.trim()){
        throw new BadRequest(["Please fill in all fields"]);
    }

    try {
        let user = await userRepository.getUserByUsername(loginData.username);
        if(await bcrypt.compare(loginData.password, user.password)){
            return user.id;
        }
        throw new NotFound(["Invalid username or password."])
    } catch (exception){
        throw exception
    }
}

module.exports.getUploadedRecipeCountById = async (userId) => {
    let recipeCount;

    try {
        recipeCount = await userRepository.getUploadedRecipeCountById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipeCount;
}