import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";


//pass the types of env as a generic (this is the way provided by hono to give the types of environment variables)
export const userRouter = new Hono<{
  //telling the types of our environment vars
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();


//signin route
userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  //get the request body from the context
  const body = await c.req.json();

  //create a new user
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    //create the jwt token and return it to user
    const jwt = await sign({ id: user.id }, c.env?.JWT_SECRET);
    return c.json({ jwt });
  } catch (e) {
    c.status(403);
    return c.json({ error: "error while signing up" });
  }
});

//sign up route
userRouter.post("/signin", async (c) => {
  //initialize prisma
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  //get the body
  const body = await c.req.json();

  //find the user
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  });
  if (!user) {
    c.status(403);
    return c.json({ error: "User not found" });
  }

  //returnn the jwt to user
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt });
  7;
});
