import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
//signin route
app.post("/api/v1/signin", (c) => {
  return c.text("signin route");
});

//sign up route
app.post("/api/v1/signup", (c) => {
  return c.text("signup route");
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
