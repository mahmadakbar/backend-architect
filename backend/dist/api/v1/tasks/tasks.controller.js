"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CGetAllTasks = exports.CDeleteTask = exports.CUpdateTask = exports.CCreateTask = void 0;
const tasks_service_1 = require("./tasks.service");
const axios_1 = require("axios");
const error_utils_1 = require("@utils/error.utils");
const CCreateTask = async (req, res, next) => {
    try {
        const { body, user } = req;
        const { title, description, status, deadline } = body;
        const result = await (0, tasks_service_1.SCreateTask)(Number(user?.id), title, description, status, deadline);
        res.status(axios_1.HttpStatusCode.Created).json({
            success: true,
            message: "Task created successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CCreateTask = CCreateTask;
const CUpdateTask = async (req, res, next) => {
    try {
        const { body, user, params } = req;
        const { title, description, status, deadline } = body;
        const taskId = Number(params.taskId);
        if (!user?.role) {
            throw new Error("Unauthorized: User role not found");
        }
        const result = await (0, tasks_service_1.SUpdateTask)(Number(user.id), taskId, user.role, title, description, status, deadline);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Task updated successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CUpdateTask = CUpdateTask;
const CDeleteTask = async (req, res, next) => {
    try {
        const { user, params } = req;
        if (!user?.role) {
            throw new Error("Unauthorized: User role not found");
        }
        const taskId = Number(params.taskId);
        const result = await (0, tasks_service_1.SDeleteTask)(taskId, Number(user.id), user.role);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Task deleted successfully",
            data: result || {},
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CDeleteTask = CDeleteTask;
const CGetAllTasks = async (req, res, next) => {
    try {
        const { user } = req;
        if (!user?.role) {
            throw new Error("Unauthorized: User role not found");
        }
        const tasks = await (0, tasks_service_1.SGetTasksByUserId)(Number(user.id), user.role);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Tasks retrieved successfully",
            data: tasks,
        });
    }
    catch (error) {
        console.log("Error in CGetAllTasks:", error);
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.NotFound);
    }
};
exports.CGetAllTasks = CGetAllTasks;
//# sourceMappingURL=tasks.controller.js.map