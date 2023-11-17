const express = require("express");
const router = express.Router();

//import model users dari folder model
const User = require("../model/User");
const {
  getAllUser,
  getUserById,
  postUser,
  loginHandler,
  updateUser,
  deleteUser,
  getUserByToken,
} = require("../controller/user");

//GET /users (ENDPOINT 1)
router.get("/users/fetch-all", getAllUser);

//GET /users by token
router.get("/users/fetch-by-token", getUserByToken);

//GET /users/:userId -> GET /users/1
router.get("/users/:userId", getUserById);

//POST /users
router.post("/users", postUser);

//POST users/login
router.post("/users/login", loginHandler);

//PUT /users/:userId isi body dengan isi tabel users
router.put("/users/:userId", updateUser);

//DELETE /users/:userId
router.delete("/users/:userId", deleteUser);


module.exports = router;
