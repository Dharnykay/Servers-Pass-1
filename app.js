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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

const validateUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").notEmpty().withMessage("Email is required"),
  body("email").isEmail().withMessage("Email is not valid"),
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

  // 👇 final middleware in the array
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        errorMap[err.path] = err.msg;
      });

      return res.status(400).render("register", {
        errors: errorMap,
        formData: req.body,
      });
    }

    next(); // ✅ move to createUser
  },
];

const createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const newUser = new User({ name, email, username, password });
    await newUser.save();

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

// Test DB connection and fetch users

async function checkUsers() {
  const users = await User.find();
  console.log(users);
}

checkUsers();

// listen at
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// //Handle File Uploads
// app.use(multer({dest:__dirname+'/uploads/'}).any());

// // uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// //Handle EXpress Sessions
// app.use(session({
// 	secret:'secret' ,
// 	saveUninitialized: true,
// 	resave: true
// }));

// //Paasport
// app.use(passport.initialize());
// app.use(passport.session());

// ///Validator
// app.use(expressValidator({
// 	errorFormator: function(param,msg,value) {
// 		var namespace = param.split('.')
// 		, root = namespace.shift()
// 		, formParam = root;

// 		while(namespace.length) {
// 			formParam += '[' + namespace.shift() + ']';
// 		}

// 		return {
// 			param 	: formParam,
// 			msg 	: msg,
// 			value	: value
// 		};
// 	}
// }));

// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use(flash());
// app.use(function(req,res,next) {
// 	res.locals.messages = require('express-messages')(req,res);
// 	next();
// });

// app.get('*', function(req,res,next) {
// 	//local variable to hold user info
// 	res.locals.user = req.user ||  null;
// 	next();
// });

// app.use('/', routes);
// app.use('/users',users);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
