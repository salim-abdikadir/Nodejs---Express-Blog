const express = require("express");
const router = express.Router();
const post = require("../modules/Post");

/* Router to the Home page */

router.get("/", async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
      currentRoute: "/",
    };

    let perPage = 3;
    let page = req.query.page || 1;

    const data = await post
      .aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    const count = await post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (err) {
    res.send(err.message);
  }
});

// function insertPosts(){
//   post.insertMany([
//     {
//       title: "myName",
//       body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, totam. Officia nam quisquam provident deserunt dicta quis natus officiis veritatis.",
//     },
//     {
//       title: "Salim",
//       body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, totam. Officia nam quisquam provident deserunt dicta quis natus officiis veritatis.",
//     },
//     {
//       title: "Abdikadir",
//       body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, totam. Officia nam quisquam provident deserunt dicta quis natus officiis veritatis.",
//     },
//     {
//       title: "Mohamed",
//       body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, totam. Officia nam quisquam provident deserunt dicta quis natus officiis veritatis.",
//     },
//     {
//       title: "Ahmed",
//       body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, totam. Officia nam quisquam provident deserunt dicta quis natus officiis veritatis.",
//     },
//     {
//       title: "myName",
//       body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, totam. Officia nam quisquam provident deserunt dicta quis natus officiis veritatis.",
//     },
//   ]);
// }

// insertPosts();

router.get("/about", (req, res) => {
  const locals = {
    title: "about page",
    description: "about page of the main ethnic cleansing",
    currentRoute: "/about",
  };
  res.render("about", locals);
});
router.get("/contact", (req, res) => {
  const locals = {
    title: "contact page",
    description: "contact page of the main ethnic cleansing",
    currentRoute: "/contact",
  };
  res.render("contact", locals);
});

/* Get
  Post 
*/
router.get("/post/:id", async (req, res) => {
  try {
    let slugg = req.params.id;
    const data = await post.findById(slugg);
    const locals = {
      title: data.title,
      description: "single Page",
    };

    res.render("post", { locals, data });
  } catch (error) {
    res.send(error.message);
  }
});

/* Post
  Search 
*/
router.post("/search", async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const refinedTerm = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await post.find({
      $or: [
        { title: { $regex: new RegExp(refinedTerm, "i") } },
        { body: { $regex: new RegExp(refinedTerm, "i") } },
      ],
    });
    const locals = {
      title: "search",
      description: "single Page",
      currentRoute: "/search",
    };

    res.render("search", { locals, data });
    console.log(data);
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;
