import express, { json } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Auth } from './infrastructure/models/auth.schema';
import { User } from './infrastructure/models/user.schema';
import { errorHandler } from './interface/middleware/errorHandler';
import { checkOrigin } from './interface/middleware/checkOrigin';

dotenv.config();
mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log("MongoDB koneksi sukses"))
    .catch(() => console.log("Koneksi MongoDB gagal"));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(errorHandler)
app.use(checkOrigin)

app.get('/api/v1.0/users', (req, res) => {
    console.log("user services")
    res.send('this is users services!');
});

// Register User
app.post("/api/v1/register", async (req, res) => {
    const { name, email, password } = req.body;
    // hash password
    const hashPassword = await bcrypt.hash(password, 10);
    console.log({ name, email, hashPassword });
    // Payload data transfer ke DB    
    const newUser = {
        name,
        email,
        password: hashPassword
    }
    const createUser = new User(newUser);
    const data = await createUser.save();

    return res.json({ message: "User register success", data });
});

// Login User
app.post("/api/v1/login", async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    // input validation
    if (!email || password.length < 6) {
        return res.status(201).json({ message: "email not valid and password not valid" });
    }
    // find user
    const user = await User.findOne({
        email,
    })
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!user.password) {
        return res.status(404).json({ message: "Password not set" });
    }
    //cek password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }
    // authorization
    const Payload = {
        id: user.id,
        name: user.name,
        email: user.email
    }
    const accessToken = jwt.sign(Payload, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: 5 // 1 hour or using literal "1d"
    });
    // console.log(accessToken);
    const refreshToken = jwt.sign(Payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: "30d"
    })
    // console.log(refreshToken);

    // Save refresh token
    const newRefreshToken = new Auth({
        userId: user.id,
        refreshToken: refreshToken
    })
    // console.log(newRefreshToken);
    await newRefreshToken.save();
    // return res.status(200).json({message:"Login success!",Payload});

    return res.cookie("accessToken", accessToken, { httpOnly: true }).cookie("refreshToken", refreshToken, { httpOnly: true }).status(200).json({ message: "Login success" });
});
// // logout user
app.post("/api/v1/logout", async (req, res) => {
    // delete token di DB
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    if (!refreshToken) {
        return res.status(401).json({ message: "please re-login" })
    }
    await Auth.findOneAndDelete({
        refreshToken
    });
    return res.clearCookie("accessToken").clearCookie("refreshToken").json({ message: "Logout success!" })
})


app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});