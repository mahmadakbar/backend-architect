"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPaths = exports.authSchemas = void 0;
exports.authSchemas = {
    RegisterRequest: {
        type: "object",
        required: ["username", "password", "name"],
        properties: {
            username: {
                type: "string",
                example: "johndoe",
                minLength: 3,
                maxLength: 50,
                description: "Username (3-50 characters)",
            },
            password: {
                type: "string",
                example: "password123",
                minLength: 6,
                description: "Password (min 6 characters)",
            },
            name: {
                type: "string",
                example: "John Doe",
                minLength: 2,
                maxLength: 100,
                description: "Full name (2-100 characters)",
            },
        },
    },
    LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
            username: {
                type: "string",
                example: "johndoe",
            },
            password: {
                type: "string",
                example: "password123",
            },
        },
    },
    LoginResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "User logged in successfully",
            },
            data: {
                type: "object",
                properties: {
                    token: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: {
                        type: "object",
                        properties: {
                            id: {
                                type: "integer",
                                example: 1,
                            },
                            username: {
                                type: "string",
                                example: "johndoe",
                            },
                            name: {
                                type: "string",
                                example: "John Doe",
                            },
                        },
                    },
                },
            },
        },
    },
};
exports.authPaths = {
    "/api/v1/auth/register": {
        post: {
            tags: ["Auth"],
            summary: "Register a new user",
            description: "Create a new user account with username, password, and name",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RegisterRequest",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "User registered successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true,
                                    },
                                    message: {
                                        type: "string",
                                        example: "User registered successfully",
                                    },
                                },
                            },
                        },
                    },
                },
                "409": {
                    description: "User already exists",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                "400": {
                    description: "Validation error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/v1/auth/login": {
        post: {
            tags: ["Auth"],
            summary: "Login user",
            description: "Authenticate user and receive JWT token",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginRequest",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "Login successful",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LoginResponse",
                            },
                        },
                    },
                },
                "401": {
                    description: "Invalid credentials",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                "400": {
                    description: "Validation error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=auth.swagger.js.map