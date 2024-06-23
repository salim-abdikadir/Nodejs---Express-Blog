require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./server/config/db.js");
const cookieParser = require("cookie-parser");
const mongoStore = require("connect-mongo");
const session = require("express-session");
const methodOverride = require("method-override");
const { isActiveRoute } = require("./server/helpers/routerHelper");

const app = express();

const PORT = 8000 || process.env.PORT;

connectDB();

//public folder setting
app.use(express.static("public"));

//to allow method overrid
app.use(methodOverride("_method"));
//to red from a form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//to allow setting cookies
app.use(cookieParser());
app.use(
  session({
    secret: "hello world",
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
    cookie: { maxAge: new Date(Date.now() + 3600000) },
  })
);
//layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("view engine", "ejs");

//routes
app.use("/", require("./server/routes/main.js"));
app.use("/", require("./server/routes/admin.js"));

// to allow function to be passed
app.locals.isActiveRoute = isActiveRoute;

app.listen(PORT, () => {
  console.log(`The App is on ${PORT}`);
});
