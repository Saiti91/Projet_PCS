const {Router} = require("express");
const commentsService = require("./service");
const {NotFoundError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", async (req, res, next) => {
    try {
        const data = await commentsService.getAllComments();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/:type/:id", async (req, res, next) => {
    try {
        const {type, id} = req.params;
        const data = await commentsService.getCommentsByEntity({type, id});
        if (data.length === 0) {
            throw new NotFoundError(`No comments found for ${type} with id ${id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/", authorize(["user", "admin", "staff", "owner"]), async (req, res, next) => {
    try {
        const comment = await commentsService.createComment(req.body);
        res.status(201).json(comment);
    } catch (err) {
        next(err);
    }
});

controller.patch("/:id", authorize(["user", "admin", "staff", "owner"]), async (req, res, next) => {
    try {
        const {id} = req.params;
        const updatedComment = await commentsService.updateComment(id, req.body);
        if (!updatedComment) {
            throw new NotFoundError(`Could not find comment with id ${id}`);
        }
        res.status(200).json(updatedComment);
    } catch (err) {
        next(err);
    }
});

controller.delete("/:id", authorize(["user", "admin", "staff", "owner"]), async (req, res, next) => {
    try {
        const {id} = req.params;
        const deletedComment = await commentsService.deleteComment(id);
        if (!deletedComment) {
            throw new NotFoundError(`Could not find comment with id ${id}`);
        }
        res.status(204).json();
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
