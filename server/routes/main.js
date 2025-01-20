const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

/**
 * GET /
 * HOME
 */
// Route to fetch posts with pagination
router.get("", async (req, res) => {
  // Page metadata to pass to the view
  const locals = {
    title: "NodeJs Blog",
    description: "Simple Blog created with NodeJs, Express & MongoDB",
  };

  // Number of posts to display per page
  let perPage = 5;

  // Current page number extracted from the URL (defaults to 1 if not provided)
  let page = req.query.page || 1;

  // Fetch sorted posts from the database using aggregation
  const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
    .skip(perPage * page - perPage) // Skip the posts of previous pages
    .limit(perPage) // Limit the number of posts per page
    .exec();

  // Count total number of posts in the collection (without filters)
  const count = await Post.countDocuments({});
  // Calculate the next page number
  const nextPage = parseInt(page) + 1;
  // Check if there is a next page
  const hasNextPage = nextPage <= Math.ceil(count / perPage); //boolean

  // Render the index view with the fetched data and pagination info
  res.render("index", {
    locals,
    data,
    current: page,
    nextPage: hasNextPage ? nextPage : null,
    currentRoute: "/",
  });
});

/**
 * GET /
 * Post:id
 */
router.get("/post/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const data = await Post.findById({ _id: id });

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("post", {
      locals,
      data,
      currentRoute: `/post/${id}`,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about");
});

/**
 * POST /
 * Post - searchTerm
 */

router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJs, Express & MongoDB.",
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      data,
      locals,
      currentRoute: "/",
    });
  } catch (error) {
    console.log(error);
  }
});

// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic."
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan."
//     },
//   ])
// }

// insertPostData();

module.exports = router;
