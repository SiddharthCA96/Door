import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput,updateBlogInput } from "@siddharthsingh/door-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  try {
    const header = c.req.header("authorization") || "";

    if (!header) {
      c.status(401);
      return c.json({ error: "Authorization header missing" });
    }

    const response = await verify(header, c.env.JWT_SECRET);

    if (!response || !response.id) {
      c.status(403);
      return c.json({ error: "Invalid or expired token" });
    }

    c.set("userId", String(response.id)); 
    await next();
  } catch (error) {
    c.status(500);
    return c.json({ error: "Server error during authentication" });
  }
});

//  Create Blog
blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const {success}=createBlogInput.safeParse(body);

  if(!success){
    c.status(411);
    return c.json({
      message:"Please Provide valid inputs"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("userId");
  console.log(userId);
  

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });

  return c.json({ id: blog.id });
});

// Update Blog
blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const {success}=updateBlogInput.safeParse(body);

  if(!success){
    c.status(411);
    return c.json({
      message:"Please Provide valid inputs"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.update({
    where: { id: body.id },
    data: { title: body.title, content: body.content },
  });

  return c.json({ id: blog });
});
//  Get All Blogs
blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blogs = await prisma.post.findMany();

  return c.json({ blogs });
});

// Get Single Blog
blogRouter.get("/:id ", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.post.findFirst({
      where: { id: id },
    });

    return c.json({ blog });
  } catch (e) {
    c.status(411);
    return c.json({ message: "Error while fetching blog" });
  }
});

