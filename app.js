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
var mongo = require("mongodb");
var mongoose = require("mongoose");
var db = mongoose.connection;
var routes = require("./routes/index");
var users = require("./routes/users");
var app = express();

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

// Validate and register user
app.post(
  "/users/register",
  upload.none(),

  [
    body("name", "Name is required").notEmpty(),
    body("email", "Email is required").notEmpty(),
    body("email", "Email is not valid").isEmail(),
    body("username", "Username is required").notEmpty().isLength({ min: 5 }),
    body("password", "Password is required")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 chars long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((err) => {
        errorMap[err.path] = err.msg;
      });

      return res.status(400).render("register", {
        errors: errorMap,
        formData: req.body || {},
      });
    }

    res.redirect("login");
  }
);

// come back to add a special char validation to this

// difference between that implementaion and this one below ?

//  app.use(expressValidator({
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

app.post("/users/login", upload.none(), (req, res) => {
  console.log(req.body.username);
  console.log(req.body.password);
});

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
