import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

//pass the types of env as a generic (this is the way provided by hono to give the types of environment variables)
const app = new Hono<{
  //telling the types of our db url
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
//signin route
app.post("/api/v1/signup", async (c) => {
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
app.post("/api/v1/signin", async(c) => {
  //initialize prisma
  const prisma=new PrismaClient({
    datasourceUrl:c.env?.DATABASE_URL,    
  }).$extends(withAccelerate());
  //get the body
  const body=await c.req.json();

  //find the user 
  const user=await prisma.user.findUnique({
    where:{
      email:body.email,
      password:body.password
    }
  });
  if(!user){
    c.status(403);
    return c.json({error:"User not found"});
  };
   
  //returnn the jwt to user
  const jwt=await sign({id:user.id},c.env.JWT_SECRET);
  return c.json({jwt});
});

//blog post route
app.post("/api/v1/blog", (c) => {
  return c.text("blog created route");
});
//blog update
app.post("api/v1/blog", (c) => {
  return c.text("blog update route");
});
//route to get a blog
app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param("id");
  console.log(id);
  return c.text("get blog route");
});
export default app;
