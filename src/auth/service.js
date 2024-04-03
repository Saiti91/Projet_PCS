const { loginSchema, registerSchema } = require("./model");
const userRepository = require("../users/repository");
const { AuthError, InvalidArgumentError } = require("../common/service_errors");
const generateJWT = require("../common/jwt_handler");

async function login(loginForm) {
    const { value, error } = loginSchema.validate(loginForm);

    if (error) {
        throw error;
    }

    const user = await userRepository.getOneBy("email", value.email);

    if (!user) {
        throw new AuthError("Could not login: unknown email provided");
    }

    // verify password - make sure to implement password verification here.

    return generateJWT(user.id, user.role);
}

async function register(user) {
    const { value, error } = registerSchema.validate(user);

    if (error) {
        throw error;
    }

    if (await userRepository.getOneBy("email", value.email)) {
        throw new InvalidArgumentError("This email is already taken.");
    }

    return await userRepository.createOne({ ...value, role: "customer" });
}

module.exports = { login, register };
