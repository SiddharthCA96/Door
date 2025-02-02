import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
//pass the types of env as a generic (this is the way provided by hono to give the types of environment variables)
const app = new Hono<{
  //telling the types of our environment vars
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.route("/api/v1/user",userRouter);
app.route("/api/v1/blog",blogRouter);


export default app;
