import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          admin: user.admin,
          token: generateToken(user),
        });
        return;
      }
    }

    // Unauthorized status code
    res.status(401).send({ message: 'Hibás email vagy jelszó' });
  })
);

userRouter.post(
  '/registry',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      token: generateToken(user),
    });
  })
);

export default userRouter;
