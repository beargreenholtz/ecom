import { Request, Response, NextFunction } from 'express';
import otpGenerator from 'otp-generator';
import OTP from '../models/otp';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

import { TUser } from '../types/user';
import User from '../models/user';
import HttpError from '../models/http-error';
import mailSender from '../utils/mailSender';

export const signUp: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data. ', 422)
    );
  }

  const name = req.body['name'] as string;
  const username = req.body['username'] as string;
  const email = req.body['email'] as string;
  const password = req.body['password'] as string;

  let existingUser: TUser | null;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );

    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );

    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err: unknown) {
    const error = new HttpError(
      'Could not create user, please try again ',
      500
    );

    throw error;
  }

  const createdUser = new User({
    name,
    email,
    username,
    password: hashedPassword,
    orders: [],
    reviews: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again.', 500);

    return next(error);
  }

  let token: string;

  if (!process.env['JWT_SECRET']) {
    const error = new HttpError('JWT secret key is not set', 500);
    return next(error);
  }

  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env['JWT_SECRET'],
      {
        expiresIn: '1h',
      }
    );
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again.', 500);

    return next(error);
  }

  const transporter = nodemailer.createTransport({
    service: process.env['MAIL_HOST'],
    auth: {
      user: process.env['MAIL_USER'],
      pass: process.env['MAIL_PASS'],
    },
  });

  const mailOptions = {
    from: 'ecomnow@gmail.com',
    to: email,
    subject: 'Welcome to EcomNow',
    html: '<img src="https://media.istockphoto.com/id/672526776/photo/cheddar-cheese-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=T6ykJOn4asR7Z21IG9D-ZdNUhEAHFW14lyqeq6a8io0=" alt="Chedder">',
  };

  await transporter.sendMail(mailOptions);

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

export const loginRequest: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body['email'] as string;
  const password = req.body['password'] as string;

  let existingUser: TUser | null;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );

    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );

    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password!);
  } catch (err) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );

    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid password, could not log you in.', 401);

    return next(error);
  }

  try {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };

    await OTP.create(otpPayload);

    await mailSender(
      email,
      'Verification Email',
      `<h1>Please confirm your OTP</h1>
		   <p>Here is your OTP code: ${otp}</p>`
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: error });
  }
};

export const loginWithOtp: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email as string;
  const otp = req.body.otp as string;

  try {
    const response = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!response) {
      const error = new HttpError('Invalid pass, could not log you in.', 401);

      return next(error);
    }

    if (!response || otp !== response?.otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }

    let existingUser: TUser | null;

    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        'Logging in failed, please try again later.',
        500
      );

      return next(error);
    }

    if (!existingUser) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );

      return next(error);
    }

    let token: string;

    if (!process.env['JWT_SECRET']) {
      const error = new HttpError('JWT secret key is not set', 500);
      return next(error);
    }

    token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env['JWT_SECRET'],
      {
        expiresIn: '1h',
      }
    );

    res.json({
      userId: existingUser._id,
      email: existingUser.email,
      token: token,
    });
  } catch (err) {
    const error = new HttpError(
      'Login with OTP failed, please try again.',
      500
    );
    return next(error);
  }
};

export const passwordResetRequest: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body['email'] as string;

  const resetToken = crypto.randomBytes(32).toString('hex');

  let user: TUser | null;

  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Password reset request failed, please try again later.',
      500
    );

    return next(error);
  }

  if (!user) {
    const error = new HttpError('No user found with that email address.', 404);
    return next(error);
  }

  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 3600000;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Password reset request failed, please try again.',
      500
    );
    return next(error);
  }

  const resetLink = `${process.env['CLIENT_URL']}/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    service: process.env['MAIL_HOST'],
    auth: {
      user: process.env['MAIL_USER'],
      pass: process.env['MAIL_PASS'],
    },
  });

  const mailOptions = {
    from: 'ecomnow@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    text: `To reset your password, click on this link: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    const error = new HttpError('Password reset email failed to send.', 500);
    return next(error);
  }
};

export const passwordReset: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resetToken = req.params['resetToken'] as string;
  const newPassword = req.body['newPassword'] as string;

  let user: TUser | null;

  try {
    user = await User.findOne({
      resetToken: resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    const error = new HttpError(
      'Password reset failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Invalid or expired reset token.', 400);
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not reset password, please try again.',
      500
    );
    return next(error);
  }

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Password reset failed, please try again.',
      500
    );
    return next(error);
  }

  res.json({ message: 'Password reset successful.' });
};
