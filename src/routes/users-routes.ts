import express from 'express';
import { check } from 'express-validator';

import {
  signUp,
  loginRequest,
  passwordResetRequest,
  loginWithOtp,
  passwordReset,
} from '../controllers/users-controllers';

const router = express.Router();

router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('username').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/),
  ],
  signUp
);

router.post('/loginRequest', loginRequest);
router.post('/loginWithOtp', loginWithOtp);

router.post('/passwordresetrequest', passwordResetRequest);
router.post('/:resetToken', passwordReset);

export default router;
