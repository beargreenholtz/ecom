import express from 'express';
import { passowrdvaliteregex } from '../utils/password-validate';
import { check } from 'express-validator';

import {
  signUp,
  loginGenerateOtp,
  passwordResetRequest,
  loginOtp,
  passwordReset,
} from '../controllers/user.controller';

const router = express.Router();

router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('username').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }).matches(passowrdvaliteregex),
  ],
  signUp
);

router.post('/logingenerateotp', loginGenerateOtp);
router.post('/loginotp', loginOtp);

router.post('/passwordresetrequest', passwordResetRequest);
router.post('/:resettoken', passwordReset);

export default router;
