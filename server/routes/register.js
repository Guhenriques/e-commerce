const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");
const { User } = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

const router = express.Router() // api endpoint

// schema validate incoming data 
router.post("/", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(3).max(200).required().email(),
    password: Joi.string().min(6).max(200).required(),
  });

  const { error } = schema.validate(req.body);

  // throw error
  if (error) return res.status(400).send(error.details[0].message);

  // check if user email already exists
  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send("User already exist");

  // create a doc for new user
  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // hash the user.password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // save user to db
  user = await user.save();

  // generate token
  const token = genAuthToken(user);

  // send token response
  res.send(token);

});

module.exports = router;