import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '10d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Hibás token' });
      } else {
        req.user = decode;

        // By calling next(), we go to the order routes, to the next function
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'Nincs token' });
  }
};
