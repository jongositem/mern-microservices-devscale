import express from "express";  
import dotenv from 'dotenv';
import cors from 'cors';
import {createProxyMiddleware} from 'http-proxy-middleware';

dotenv.config();
const app = express();
app.use(cors());


// Start Route
app.get('/', (req, res) => {
    console.log("aaapnpm")
    res.send('this is api-gateway!');
});


app.use("/api/v1.0/users", createProxyMiddleware({ 
    target: `${process.env.USERS_URI}`,
}));
// app.use("/api/v1.0/threads", createProxyMiddleware({ 
//     target: `${process.env.THREADS_URI}`,
// }));
// app.use("/api/v1.0/replies", createProxyMiddleware({ 
//     target: `${process.env.REPLIES_URI}`,
// }));

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});
