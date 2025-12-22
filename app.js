var bcrypt = require("bcryptjs");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var { validationResult, body } = require("express-validator");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var multer = require("multer");
var flash = require("connect-flash");
var app = express();
const User = require("./models/user");
const { isArray } = require("util");
const { next } = require("mongodb/lib/operations/cursor_ops");

// view engine setup
app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false, // don’t create session until user logs in
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/members", (req, res) => {
  console.log(req.sessionID);
  res.send("Check console for sessionID");
});

app.get("/users/login", (req, res) => {
  res.render("login");
});

app.get("/users/register", (req, res) => {
  formData = {};
  errors = {};
  res.render("register");
});

// Validate user details on registration
//  add a special char validation to this password later

// Why can Express’ route methods (app.post, etc.) accept a single handler, multiple functions, or an array of functions, and how does it execute them in sequence to allow middleware like validation, logging, and final response handling?
// what is the difference between a middleware and a route handler in express.js, and how do they interact when processing an incoming request?

// validation
const validateUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").notEmpty().withMessage("Email is required"),
  body("email")
    .isEmail()
    .withMessage("Email is not valid")
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("Email already in use");
      }
      return true;
    }),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 chars long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  //final middleware in the array
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        errorMap[err.path] = err.msg;
        console.log(errorMap);
        console.log(errors);
        console.log(validationResult(req));
      });

      return res.status(400).render("register", {
        errors: errorMap,
        formData: req.body,
      });
    }

    next(); // ✅ move to createUser
  },
];

// user creation
const createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("User registered:", newUser);

    res.redirect("login"); // OR res.status(201).json(...)
  } catch (error) {
    console.error(error);
    res.status(500).render("register", {
      errors: { general: "Server error. Please try again." },
      formData: req.body,
    });
  }
};

app.post("/users/register", upload.none(), validateUser, createUser);

app.post("/users/login", upload.none(), async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).render("login", {
      error: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).render("login", {
      error: "Invalid email or password",
    });
  }

  // 2. Create session (log user in)
  console.log(req.session);
  req.session.userId = user._id;
  console.log(req.sessionID);

  // 3. Redirect to index page
  res.redirect("/");
});

// async function revealUsers(req, res) {
//   try {
//     const user = await User.findOne({ username: "dharnykay" });
//     console.log(user._id);
//   } catch (error) {
//     console.error(error);
//   }
// }

// revealUsers();
// listen at
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// You do need to understand these 3 things (you already mostly do):

// HTTP is stateless

// Cookies are sent automatically by the browser

// req.session persists across requests

// That’s enough to proceed.
