const express = require("express");
const router = express.Router();
const Post = require("../modules/Post");
const User = require("../modules/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;
/**
 Check for Login 
 Middleware
 */
const authMiddleware = function (req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "unathorized page" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(501).json({ err });
  }
};

/*
Logout
Admin
*/
router.get("/logout", authMiddleware, (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin");
});

/**
 Get
 Admin
 */
const adminlayout = "../views/layouts/admin";
router.get("/admin", (req, res) => {
  const locals = {
    title: "admin page",
    description: "admin page controlling center",
    loggedin: !req.cookies.token ? false : true,
  };
  console.log(locals.loggedin);
  res.render("admin/index", { locals, layout: adminlayout });
});

/**
 post
 Admin
 */
router.post("/admin", async (req, res) => {
  try {
    const locals = {
      title: "admin page",
      description: "admin page controlling center",
      loggedin: !req.cookies.token ? false : true,
    };
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "invalid credentials" });
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "invalid credentials" });
      } else {
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/dashboard");
      }
    }
  } catch (error) {
    res.status(501).json({ message: "internal server error", error });
  }
});

/**
  Get
  add-post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  const locals = {
    title: "add post page",
    description: "admin page post adding page",
    loggedin: !req.cookies.token ? false : true,
  };
  res.render("admin/add-post", { locals, layout: adminlayout });
});

/**
  post
  add-post
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  const locals = {
    title: "add post page",
    description: "admin page post adding page",
    loggedin: !req.cookies.token ? false : true,
  };
  try {
    const { title, body } = req.body;
    if (title.trim().length == 0 || body.trim().length == 0) {
      return res.status(401).json({ message: "invalid articles" });
    }
    const newPost = new Post({
      title,
      body,
    });
    const createdPost = await Post.create(newPost);
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});
/**
  Get
  edit-post
 */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    title: "add post page",
    description: "admin page post adding page",
    loggedin: !req.cookies.token ? false : true,
  };
  const postId = req.params.id;
  const data = await Post.findOne({ _id: postId });
  res.render("admin/edit-post", { data, locals, layout: adminlayout });
});
/**
 * PUT
 * EDIT-POST
 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (title.trim().length == 0 || body.trim().length == 0) {
      return res.status(401).json({ message: "invalid articles" });
    }
    await Post.findByIdAndUpdate(req.params.id, {
      title,
      body,
      createdAt: Date.now(),
    });
    res.redirect(`/post/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
});

/**
 * PUT
 * EDIT-POST
 */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.deleteOne({ _id: req.params.id });
    console.log(deletedPost);
    res.redirect(`/dashboard`);
  } catch (err) {
    console.log(err);
  }
});

/**
  Get
  Dashboard
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  const locals = {
    title: "dashboard page",
    description: "admin page dashboard center",
    loggedin: !req.cookies.token ? false : true,
  };
  const data = await Post.find();
  res.render("admin/dashboard", { data, locals, layout: adminlayout });
});

/*Register */
router.post("/register", async (req, res) => {
  const locals = {
    title: "admin page",
    description: "admin page controlling center",
    loggedin: !req.cookies.token ? false : true,
  };
  try {
    const { username, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashPassword });
      res.status(201).json({ user, message: "user Created successfully" });
    } catch (error) {
      if ((error.code = 11000)) {
        res.status(409).json({ message: "user already created" });
      }
      res.status(501).json({ message: "internal server error" });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
