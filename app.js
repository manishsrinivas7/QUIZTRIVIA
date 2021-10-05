const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const date = require(__dirname + "/date.js");
const _ = require("lodash");
const alert = require('alert');


// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
// global.document = document;
// const $ = require("jquery")(window);

const app = express();

mongoose.connect("mongodb://localhost:27017/quizDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  uname: String,
  email: String,
  password: String,
  college: String,
  collegeId: String
});

const Student = new mongoose.model("Student", userSchema);
const Teacher = new mongoose.model("Teacher", userSchema);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/:paramName", function(req, res) {
  const role = req.params.paramName;
  res.render("login", {
    roleName: role
  });
});

app.get("/reg/:paramName", function(req, res) {
  const role = req.params.paramName;
  res.render("register", {
    roleName: role
  });
});


app.post("/student_reg", function(req, res) {
  const student = new Student({
    uname: req.body.uName,
    email: req.body.uEmail,
    password: req.body.uPwd,
    college: req.body.uClg,
    collegeId: req.body.uClgId

  });
  student.save();
  res.render("login", {
    roleName: "stu_login"
  });

});

app.post("/teacher_reg", function(req, res) {
  const teacher = new Teacher({
    uname: req.body.uName,
    email: req.body.uEmail,
    password: req.body.uPwd,
    college: req.body.uClg,
    collegeId: req.body.uClgId
  });
  teacher.save();
  res.render("login", {
    roleName: "tech_login"
  });
});

app.post("/teacher", function(req, res) {
  Teacher.findOne({
    email: req.body.uEmail,
    password: req.body.uPwd
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        res.sendFile(__dirname + "/teacher.html");
      } else {
        res.render("error", {
          error: "Kindly check your Credentials",
          roleName: "tech_login"
        });
      }
    }
  });
});

app.post("/student", function(req, res) {
  Student.findOne({
    email: req.body.uEmail,
    password: req.body.uPwd
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        res.sendFile(__dirname + "/student.html");
      } else {
        res.render("error", {
          error: "Kindly check your Credentials",
          roleName: "stu_login"
        });
      }
    }
  });

});

const quizSchema = new mongoose.Schema({
  title: String,
  count: Number,
  marks: Number,
  questions: [String],
  option1: [String],
  option2: [String],
  option3: [String],
  option4: [String],
  answers: [Number]
});

const Quiz = new mongoose.model("Quiz", quizSchema);

app.post("/addtest", function(req, res) {
  const quiz = new Quiz({
    title: req.body.qTitle,
    count: req.body.qNumber,
    marks: req.body.qMarks,
    questions: req.body.ques,
    option1: req.body.option1,
    option2: req.body.option2,
    option3: req.body.option3,
    option4: req.body.option4,
    answers: req.body.answer
  });
  quiz.save();
  res.sendFile(__dirname + "/teacher.html");
});

app.post("/testpage", function(req, res) {
  Quiz.findOne({
    title: req.body.title
  }, function(err, foundQuiz) {
    if (err)
      console.log(err);
    else {
      if (foundQuiz) {
        res.render("test", {
          title: foundQuiz.title,
          questions: foundQuiz.questions,
          option1: foundQuiz.option1,
          option2: foundQuiz.option2,
          option3: foundQuiz.option3,
          option4: foundQuiz.option4,
          mark: foundQuiz.marks,
          count: foundQuiz.count
        });
      }
    }

  });
});

app.post("/cal_result/:paramName", function(req,res){
  const title = req.params.paramName;
  Quiz.findOne({title:title}, function(err, foundQuiz){
    if(err)
      console.log(err);
    else{
      if(foundQuiz){
        let score = 0;
        for(let i=0;i<foundQuiz.count;i++){
          const selected = "options"+(i+1);
          const arr = req.body;
          console.log("selected="+arr[selected]);
          console.log("correct="+foundQuiz.answers[i]);
          if(foundQuiz.answers[i] == arr[selected]){
            score += foundQuiz.marks;
          }
        }
        res.render("result",{score:score, total: (foundQuiz.count*foundQuiz.marks)})
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started has started sucessfully!");
});
