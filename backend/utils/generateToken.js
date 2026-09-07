import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', {
    expiresIn: '30d',
  });
};

export default generateToken;
