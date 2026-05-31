"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SGetTasksByUserId = exports.SDeleteTask = exports.SUpdateTask = exports.SCreateTask = void 0;
const prisma_clients_1 = require("@prisma/prisma.clients");
const SCreateTask = async (userId, title, description, status, deadline) => {
    try {
        console.log(`Creating task for user ID ${userId} with description:`, description);
        if (!userId || isNaN(Number(userId))) {
            throw new Error("Invalid user ID");
        }
        const userExists = await prisma_clients_1.prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        console.log(`Checking if user with ID ${userId} exists:`, userExists);
        if (!userExists) {
            throw new Error(`User with ID ${userId} not found`);
        }
        await prisma_clients_1.prisma.task.create({
            data: {
                title,
                description,
                status: status || false,
                deadline: deadline || null,
                created_by: userExists.username,
                user_id: Number(userId),
            },
        });
        return {
            success: true,
            message: "Task created successfully",
        };
    }
    catch (error) {
        console.error("Task creation error:", error);
        throw error;
    }
};
exports.SCreateTask = SCreateTask;
const SUpdateTask = async (userId, taskId, userRole, title, description, status, deadline) => {
    try {
        const userExists = await prisma_clients_1.prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        console.log(`Checking if user with ID ${userId} exists:`, userExists);
        if (!userExists) {
            throw new Error(`User with ID ${userId} not found`);
        }
        const taskExists = await prisma_clients_1.prisma.task.findUnique({
            where: { id: Number(taskId) },
        });
        if (!taskExists) {
            throw new Error(`Task with ID ${taskId} not found`);
        }
        // Role-based permission check
        // Superadmin can edit any task
        // Regular user can only edit their own tasks
        if (userRole !== "superadmin" && taskExists.user_id !== Number(userId)) {
            throw new Error(`You don't have permission to update this task`);
        }
        await prisma_clients_1.prisma.task.update({
            where: { id: Number(taskId) },
            data: {
                title: title || taskExists.title,
                description: description || taskExists.description,
                status: status !== undefined ? status : taskExists.status,
                deadline: deadline || taskExists.deadline,
            },
        });
        return {
            success: true,
            message: "Task updated successfully",
        };
    }
    catch (error) {
        console.error("Task update error:", error);
        throw error;
    }
};
exports.SUpdateTask = SUpdateTask;
const SDeleteTask = async (taskId, userId, userRole) => {
    try {
        if (!taskId || isNaN(Number(taskId))) {
            throw new Error("Invalid task ID");
        }
        const taskExists = await prisma_clients_1.prisma.task.findUnique({
            where: { id: Number(taskId) },
        });
        console.log(`Checking if task with ID ${taskId} exists:`, taskExists);
        if (!taskExists) {
            throw new Error(`Task with ID ${taskId} not found`);
        }
        // Role-based permission check
        // Superadmin can delete any task
        // Regular user can only delete their own tasks
        if (userRole !== "superadmin" && taskExists.user_id !== Number(userId)) {
            throw new Error(`You don't have permission to delete this task`);
        }
        await prisma_clients_1.prisma.task.delete({
            where: { id: Number(taskId) },
        });
        return {
            success: true,
            message: "Task deleted successfully",
        };
    }
    catch (error) {
        console.error("Task deletion error:", error);
        throw error;
    }
};
exports.SDeleteTask = SDeleteTask;
const SGetTasksByUserId = async (userId, userRole) => {
    try {
        if (!userId || isNaN(Number(userId))) {
            throw new Error("Invalid user ID");
        }
        const userExists = await prisma_clients_1.prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        console.log(`Checking if user with ID ${userId} exists:`, userExists);
        if (!userExists) {
            throw new Error(`User with ID ${userId} not found`);
        }
        // Role-based filtering
        // Superadmin and Admin can see all tasks
        // Regular user can only see their own tasks
        let tasks;
        if (userRole === "superadmin" || userRole === "admin") {
            tasks = await prisma_clients_1.prisma.task.findMany({
                orderBy: { createdAt: "desc" },
            });
        }
        else {
            tasks = await prisma_clients_1.prisma.task.findMany({
                where: { user_id: Number(userId) },
                orderBy: { createdAt: "desc" },
            });
        }
        return tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt?.toISOString() || "",
            deadline: task.deadline?.toISOString() || null,
        }));
    }
    catch (error) {
        console.error("Task retrieval error:", error);
        throw error;
    }
};
exports.SGetTasksByUserId = SGetTasksByUserId;
//# sourceMappingURL=tasks.service.js.map