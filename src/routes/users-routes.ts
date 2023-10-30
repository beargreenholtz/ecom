import express from 'express';
import { passowrdvaliteregex } from '../utils/password-validate';
import { check } from 'express-validator';
import passport from 'passport';

import {
  signUp,
  loginGenerateOtp,
  passwordResetGenertor,
  loginOtp,
  passwordReset,
  callbackGoogleAuthHandler,
  failedgoogleauth,
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

router.post('/passwordresetrequest', passwordResetGenertor);
router.post('/:resettoken', passwordReset);

router.get('/failedgoogleauth', failedgoogleauth);

router.get(
  '/googleauth',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

router.get('/callbackgoogleauth', callbackGoogleAuthHandler);

export default router;
