import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const UserRegister = async (req, res, next) => {
  try {
    console.log(req.body);
    //accept data from Frontend
    const { fullName, email, password } = req.body;

    //verify that all data exist
    if (!fullName || !email || !password) {
      const error = new Error("All feilds required");
      error.statusCode = 400;
      return next(error);
    }

    console.log({ fullName, email, password });

    //Check for duplaicate user before registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      return next(error);
    }

    console.log("Sending Data to DB");

    //encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    console.log("Password Hashing Done. hashPassword = ", hashPassword);

    // const photoURL = `https://placehold.co/600x400?text=${fullName.charAt(0).toUpperCase()}`;
    // const photo = {
    //   url: photoURL,
    // };

    //save data to database
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),

      password: hashPassword,
    });

    // send response to Frontend
    console.log(newUser);
    res.status(201).json({ message: "Registration Successfull" });
    //End
  } catch (error) {
    next(error);
  }
};

export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. (Optional) Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: { name: user.fullName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};
