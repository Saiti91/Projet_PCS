// const { Router } = require("express");
// const Service = require("./service");
// const { Location, PartialLocation } = require("./model");
// const { NotFoundError } = require("../common/http_errors");
// const authorize = require("../common/middlewares/authorize_middleware");
//
// const controller = Router();
// //TODO: Code all commentary methode
// controller.get("/", (req, res, next) => {
//     Service.getAll()
//         .then((data) => res.json(data))
//         .catch((err) => next(err));
// });
//
// controller.get("/:id", (req, res, next) => {
//     Service.getOne(Number(req.params.id))
//         .then((data) => {
//             if (data === null) {
//                 throw new NotFoundError(
//                     `Could not find location with id ${req.params.id}`,
//                 );
//             }
//
//             res.json(data);
//         })
//         .catch((err) => next(err));
// });
//
// controller.post("/", authorize(["staff"]), (req, res, next) => {
//     Service.createOne(req.body)
//         .then((data) => {
//             res.status(201).json(data);
//         })
//         .catch((err) => next(err));
// });
//
// controller.delete("/:id", authorize(["staff", "owner"]), (req, res, next) => {
//     Service.deleteOne(Number(req.params.id))
//         .then((id) => {
//             if (id === null) {
//                 throw new NotFoundError(
//                     `Could not find location with id ${req.params.id}`,
//                 );
//             }
//
//             res.status(204).json();
//         })
//         .catch((err) => next(err));
// });
//
// controller.patch("/:id", authorize(["staff", "owner"]), (req, res, next) => {
//     Service.updateOne(Number(req.params.id), req.body)
//         .then((data) => {
//             if (data === null) {
//                 throw new NotFoundError(
//                     `Could not find location with id ${req.params.id}`,
//                 );
//             }
//             res.status(200).json(data);
//         })
//         .catch((err) => next(err));
// });
//
// module.exports = controller;
