var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');
var session = require('express-session');
var ejs = require('ejs')
var nodemailer = require('nodemailer');
var multer=require('multer');
var passport = require('passport')
var ObjectId=require('mongodb').ObjectID;
var GitHubStrategy = require('passport-github').Strategy;



passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


passport.use(new GitHubStrategy({
    clientID: "2de3e789a4d603eed366",
    clientSecret: "52b840158212311943e0bcdf98194aa3428dfca4",
    callbackURL: "/return"
  },
  function(accessToken, refreshToken, profile, cb) {
    //User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(null, profile);
    //});
  }
));


app.use(passport.initialize());
app.use(passport.session());


var storage=multer.diskStorage({
  destination : './public/uploads/',
  filename: function(req, file, cb){
    console.log("@@"+req.session.id);
    req.session.image="/uploads/"+req.session._id + path.extname(file.originalname);
    cb(null,req.session._id + path.extname(file.originalname));
  }
});

var storage1=multer.diskStorage({
  destination : './public/uploads/',
  filename: function(req, file, cb){
    console.log("@@"+req.session.communityid);
    req.session.communityimage="/uploads/"+req.session.communityid + path.extname(file.originalname);
    cb(null,req.session.communityid + path.extname(file.originalname));
  }
});

var upload=multer({
  storage: storage,
 limits:{fileSize: 1000000},
 fileFilter: function(req, file, cb){
   checkFileType(file, cb);
 }
}).single('profilePhoto');

var upload1=multer({
  storage: storage1,
 limits:{fileSize: 1000000},
 fileFilter: function(req, file, cb){
   checkFileType(file, cb);
 }
}).single('communityImage');

var upload2=multer({
  storage: storage,
 limits:{fileSize: 1000000},
 fileFilter: function(req, file, cb){
   checkFileType(file, cb);
 }
});



function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({secret: "xYzUCAchitkara"}));

var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/newCQ';

mongoose.connect(mongoDB);

mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});

mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});








var loginSchema = new mongoose.Schema({
  name : String,
      username : String ,
      password : String,
      email : String,
      phoneNo : String,
      dob : String,
      city : String,
      gender : String,
      userType : String,
      status : String,
      active : String,
      image : String,
      member : Array,
      request : Array,
      })

var login =  mongoose.model('users', loginSchema);



var communitySchema = new mongoose.Schema({
      name : String,
      rule : String ,
      location : String,
      owner : String,
      createdate : String,
      image : String,
      active : String,
      desc : String,
      ownerid : String,
      member : Array,
      request : Array
    });

      var memberDetails=new mongoose.Schema({
          communityid : String,
            communityName: String,
            member: [{email:String,name:String,id:String}]
      });

      var requestDetails=new mongoose.Schema({
          communityid : String,
            communityName: String,
            member: [{email:String,name:String,id:String}]
      });

      var ownerDetails=new mongoose.Schema({
            communityId : String,
            communityName: String,
            emailOwner: String,
            nameOwner: String,
            ownerId : String
      });

      var discussion=new mongoose.Schema({
        communityId : String,
        communityName : String,
        communityImage : String,
        messages : Array
      });




var community =  mongoose.model('communities', communitySchema);

var members =  mongoose.model('members', memberDetails);
var requests =  mongoose.model('requests', requestDetails);
var owners =  mongoose.model('owners', ownerDetails);


var discussions=mongoose.model('discussions',discussion);




var tagSchema = new mongoose.Schema({
  tname : String,
  createdby : String,
  createddate : String

      })

var tag =  mongoose.model('tagpannel',tagSchema);

app.post('/addtag',function (req, res) {
  //console.log(req.body);
  let newtag = new tag({
    tname : req.body.tname,
    createdby : req.session.username,
    createddate : req.body.createddate
  })
  newtag.save()
   .then(data => {
  //   console.log(data)
  //   mailer(data.email,data.password);
  //   res.redirect("/menutags");
     res.send(data)
   })
   .catch(err => {
     console.error(err)
     res.send(error)
   })

})



app.get('/gettags',function (req, res) {
  //console.log(req.body);
  tag.find({

  })

   .then(data => {
  //   console.log(data)
  //   mailer(data.email,data.password);
  //   res.redirect("/menutags");
     res.send(data)
   })
   .catch(err => {
     console.error(err)
     res.send(error)
   })

})



app.get('/auth/github',
  passport.authenticate('github'));

app.get('/return',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    login.find({
       // search query
       username : req.session.passport.user._json.login
         })
  .then(data => {
    if(data.length>0)
    {
      req.session.isLogin = 1;
      req.session._id = data[0]._id;
      req.session.username = data[0].username ;
      req.session.name = data[0].name ;
      req.session.dob = data[0].dob;
      req.session.city=data[0].city;
      req.session.gender=data[0].gender;
      req.session.phoneNo=data[0].phoneNo;
      req.session.email=data[0].email;
      req.session.userType=data[0].userType;
      req.session.image=data[0].image;
      console.log("@"+req.session._id);
       console.log("Welcome");
       if(data[0].active=="0")
       {
         res.redirect("/");
       }
       else {

         if(data[0].status.toLowerCase()=="confirmed")
         {
         res.redirect("/userProfile");
         }
         else {
           res.redirect("/userProfilePending");
         }
       }


      //res.redirect('/userProfile');
    }
      else {
        let newlogin = new login({
          name : req.session.passport.user._json.login,
          username : req.session.passport.user._json.login,
          email : req.session.passport.user._json.login,
          password : req.session.passport.user._json.login,
          phoneNo : '\"\"',
          city  : '\"\"',
          userType : "User",
          status : "Pending",
          active : "1",
          image : "dp.png"
        })
        console.log("gghj");
        newlogin.save()
         .then(data => {
        //   console.log(data)
        req.session.isLogin = 1;
        req.session._id = data._id;
        req.session.username = data.username ;
        req.session.name = data.name ;
        req.session.dob = data.dob;
        req.session.city=data.city;
        req.session.gender=data.gender;
        req.session.phoneNo=data.phoneNo;
        req.session.email=data.email;
        req.session.userType=data.userType;
        req.session.image=data.image;
        console.log("@"+req.session._id);
         console.log("Welcome");
          // mailer(data.email,data.password);
           //res.redirect("/getadduser");
           //res.send(data)
            res.redirect("/userProfilePending");
         })
         .catch(err => {
           console.error(err)
           res.send(err)
         })

      }

      })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
    //console.log(req.session.passport.user._json.login);
  //    console.log(req.session.passport.login);
    //res.redirect('/templating');
  });



function updateSession(req,data)
{
  req.session.isLogin = 1;
  req.session._id = data._id;
  req.session.username = data.username ;
  req.session.name = data.name ;
  req.session.dob = data.dob;
  req.session.city=data.city;
  req.session.gender=data.gender;
  req.session.phoneNo=data.phoneNo;
  req.session.email=data.email;
  req.session.userType=data.userType;
  req.session.image=data.image;
}



app.get('/gettaglist',function (req, res) {
  tag.find({
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
})






app.post('/log',function (req, res) {
//  console.log(req.body);
    login.find({
       // search query
       username : req.body.username,
       password : req.body.password
    })
  .then(data => {
    //  console.log(data)
    //res.send(data);
    if(data.length>0)
    {
      if(req.session.isLogin){
        //proceed
      }
      else {
       //Ask for id password
       console.log(data);
       req.session.isLogin = 1;
       req.session._id = data[0]._id;
       req.session.username = data[0].username ;
       req.session.name = data[0].name ;
       req.session.dob = data[0].dob;
       req.session.city=data[0].city;
       req.session.gender=data[0].gender;
       req.session.phoneNo=data[0].phoneNo;
       req.session.email=data[0].email;
       req.session.userType=data[0].userType;
       req.session.image=data[0].image;
       console.log("@"+req.session._id);
        console.log("Welcome");
      }

      if(data[0].active=="0")
      {
        res.redirect("/");
      }
      else {

      if(data[0].userType.toLowerCase()=="superuser")
      {
        res.redirect("/templating");
      }
      else
      {
        if(data[0].status.toLowerCase()=="confirmed")
        {
        res.redirect("/userProfile");
        }
        else {
          res.redirect("/userProfilePending");
        }
      }
    }
    }
      else
      res.redirect("/")
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })

})




var middleFunc = function(req, res, next){
    if(req.session.isLogin){

      next();
   } else {
     //Ask for id password
     res.redirect("/");
  //   next();
   }

  }





  app.post('/addcommunitydata',function (req, res) {
    console.log(req.body);
    let comm = new community({
      name : req.body.name,
      desc : req.body.desc,
      rule : req.body.rule,
      image : "/community.jpg",
      location : "NOT ADDED",
      active : "0",
      owner : req.session.name,
      ownerid : req.session._id,
      createdate : req.body.date,
      member : [{ email: req.session.email, name : req.session.name,id : req.session._id }]
    })
    comm.save()
     .then(data => {
       req.session.communityid=data._id;
       console.log("///////////////////////////////"+data._id);
////////////////////////////////////////

       let own = new owners({
         communityId : data._id,
         communityName : data.name,
         ownerId : req.session._id,
         emailOwner :  req.session.email,
         nameOwner : req.session.name,
       })
       own.save()
        .then(data1 => {

          //console.log(data)
        })
        .catch(err => {

        })

/////////////////////////////////////

let newdiscussion = new discussions({
  communityId : data._id,
  communityName : data.name,
  communityImage : data.image
})
newdiscussion.save()
 .then(data1 => {

   console.log(data1)
 })
 .catch(err => {

 })



/////////////////////////////////////
//var usr = { email: req.session.email, name : req.session.name,id : req.session._id };

// let mem = new members({
//   communityName : data.name,
//   communityid : data._id,
//   member : [{ email: req.session.email, name : req.session.name,id : req.session._id }]
// })
// mem.save()
//  .then(data1 => {
//
//    //console.log(data)
//  })
//  .catch(err => {
//
//  })



/////////////////////////////////////////
       res.send(data)
     })
     .catch(err => {
       console.error(err)
       res.send(error)
     })

//res.redirect("/addcommunity");

  })




app.post('/checkun',function (req, res) {
  console.log(req.body);
  login.find({
       // search query
       username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })

})


app.post('/discussionpost/:id',upload2.single('discussionImageFile'),function (req, res) {
  console.log(req.body);
  console.log(req.body.title);
  console.log(req.body.details);
  console.log("$$$$");
  console.log(req.body.tags);

    if(req.body.tags==undefined)
    {
      req.body.tags=[];
    }


  discussions.findOneAndUpdate(
  {
    _id : ObjectId(req.params.id)
       // search query
  }
  ,
  {
    $push : {messages : {$each:[{senderId : req.session._id,senderName : req.session.name, title : req.body.title,details : req.body.details,tags : req.body.tags}]}}
      // field:values to update
  },
  {
    new: true,                       // return updated doc
    runValidators: true              // validate before update
  })
  .then(data => {
    console.log(data);
  res.redirect("/discussion/"+data.communityId)
    })
    .catch(err => {
      console.error(err)
      res.send()
    })



})





app.get('/community',middleFunc,function (req, res) {
  res.render('usermenucommunity',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})

app.get('/addcommunity',middleFunc,function (req, res) {
  res.render('usermenuaddcommunity',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})

app.get('/communitysearch',middleFunc,function (req, res) {
  res.render('usermenucommunitysearch',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})


app.get('/userProfilePending',middleFunc,function (req, res) {
  res.render('usermenuprofilepending',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})


app.get('/changepassword',middleFunc,function (req, res) {
  res.render('menuchangepass',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})


app.get('/userchangepassword',middleFunc,function (req, res) {
  res.render('usermenuchangepass',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})



app.get('/userProfile',middleFunc,function (req, res) {
  res.render('usermenuprofile',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})



app.get('/getadduser',middleFunc,function (req, res) {
  res.render('menuadduser',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})



app.post('/adduserdata',function (req, res) {
  //console.log(req.body);
  let newlogin = new login({
    name : req.body.fullname,
    username : req.body.username,
    email : req.body.username,
    password : req.body.password,
    phoneNo : req.body.phone,
    city  :req.body.city,
    userType : req.body.roleoptions,
    status : "Pending",
    active : "1",
    image : "/dp.png"
  })
  console.log("gghj");
  newlogin.save()
   .then(data => {
  //   console.log(data)
     mailer(data.email,data.password);
     res.redirect("/getadduser");
     //res.send(data)
   })
   .catch(err => {
     console.error(err)
     res.send(err)
   })

})



app.get('/getdata',function (req, res) {
//console.log(req.session.username);
  res.send(req.session);
})



app.get('/gettable',function (req, res) {
  login.find({
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    })
})



app.get('/templating',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('menu',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})

app.get('/logout',middleFunc , (req,res)=>{
//  console.log(req.session.isLogin);
  //var data=JSON.parse(req.session);
  res.render('logout',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})

app.get('/yeslogout',function (req, res) {
  req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.send();
    });
})



app.get('/showuser',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('menushowuser',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})


app.get('/menutags',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('menutags',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})



app.get('/menucommunitylist',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('menucommunitylist',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})


app.get('/communitymanage',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('usermenumanagecommunity',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})


app.get('/discussion',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('userdiscussion',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});

})


app.post('/doupdate',function(req,res){
    console.log(req.body);
    login.findOneAndUpdate(
    {
      _id : req.body.id
         // search query
    },
    {
      username : req.body.username,
      phoneNo : req.body.phone,
      city : req.body.city,
      status : req.body.status,
      userType : req.body.role

        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        res.send(data)
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})




app.post('/changePass',function(req,res){
    //console.log(req.body);
  //    res.redirect("/changepassword");
    login.findOneAndUpdate(
    {
      username : req.session.username,
      password : req.body.oldPassword
         // search query
    },
    {
      password : req.body.newPassword

        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
        if(data)
        res.redirect("/changepassword");
        else
        console.log("wrongpass");
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})





app.post('/editProfile',function(req,res){
    console.log(req.body);
  //    res.redirect("/changepassword");
    login.findOneAndUpdate(
    {
      username : req.session.username,
         // search query
    },
    {
      name : req.body.fullname,
      dob : req.body.dob,
      gender : req.body.gender,
      phoneNo : req.body.phone,
      city : req.body.city,
      status : "Confirmed"


        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
    //    console.log(data)
    updateSession(req,data);
    if(data.userType=="superuser")
  res.redirect("/profileedit")
  else {
    res.redirect("/userProfile");
  }
  //      console.log("wrongpass");
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})




app.get('/showtaglist',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('menushowtaglist',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})



app.get('/editProfile',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('menueditprofilepage',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})




app.get('/usereditProfile',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
  res.render('usermenueditprofilepage',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})

app.get('/usercommunityprofile/:id',middleFunc , (req,res)=>{
  console.log(req.params.id);
  //var data=JSON.parse(req.session);


  community.findOne({
    _id : req.params.id
       // search query
      // username : req.body.username,
  })
  .then(d => {
      console.log(d)
    //  res.send(data)

      res.render('usercommunityprofile',{data : [{'email':req.session.email , 'username' : req.session.name,'image' : req.session.image,'id':d._id,'name' :d.name,'desc' : d.desc,'cimage' : d.image,'owner' : d.owner,'ownerid': d.ownerid,'rule' : d.rule }]});
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    })
})




app.get('/discussion/:id',middleFunc , (req,res)=>{

  discussions.findOne({
    communityId : req.params.id
       // search query
      // username : req.body.username,
  })
  .then(d => {
      res.render('userdiscussion',{data : [{'email':req.session.email , 'username' : req.session.name,'image' : req.session.image,d }]});
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    })
})







app.get('/manageCommunity/:id',middleFunc , (req,res)=>{
  console.log(req.params.id);
  //var data=JSON.parse(req.session);


  community.findOne({
    _id :req.params.id
       // search query
      // username : req.body.username,
  })
  .then(d => {
      console.log(d)
    //  res.send(data)
    //var reqno=d.request.length;
    //var memno=d.member.length;
    //console.log(reqno);
    //console.log(memno);
    res.render('usermenumanagecommunity',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image,d}]});

    //  res.render('usermenumanagecommunity',{data : [{'email':req.session.email , 'username' : req.session.name,'image' : req.session.image,'id':d._id,'name' :d.name,'desc' : d.desc,'cimage' : d.image,'owner' : d.owner,'ownerid': d.ownerid,'rule' : d.rule, }]});
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    })
//  res.redirect("/communitymanage");
})









app.post('/joincommunity',middleFunc , (req,res)=>{

  //var data=JSON.parse(req.session);
  var usr = { email: req.session.email, name : req.session.name,id : req.session._id };

  console.log(req.body);
  //var obj=mongoose.Types.ObjectId(req.body.id);
  //console.log(obj);
  community.findOneAndUpdate(
  {
    _id : ObjectId(req.body.id)
       // search query
  }
  ,
  {
    $push : {member : {$each:[{email: req.session.email, name : req.session.name,id : req.session._id}]}}
      // field:values to update
  },
  {
    new: true,                       // return updated doc
    runValidators: true              // validate before update
  })
  .then(data => {
    //  console.log(data)
    login.findOneAndUpdate(
    {
      _id : ObjectId(req.session._id)
         // search query
    }
    ,
    {
      $push : {member : {$each:[{communityid : req.body.id}]}}
        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.error(err)
      })
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send()
    })
})





app.post('/requestcommunity',middleFunc , (req,res)=>{

  //var data=JSON.parse(req.session);
  //var usr = { email: req.session.email, name : req.session.name,id : req.session._id };

  console.log(req.body);
  //var obj=mongoose.Types.ObjectId(req.body.id);
  //console.log(obj);
  community.findOneAndUpdate(
  {
    _id : ObjectId(req.body.id)
       // search query
  }
  ,
  {
    $push : {request : {$each:[{email: req.session.email, name : req.session.name,id : req.session._id}]}}
      // field:values to update
  },
  {
    new: true,                       // return updated doc
    runValidators: true              // validate before update
  })
  .then(data => {
    //  console.log(data)
    login.findOneAndUpdate(
    {
      _id : ObjectId(req.session._id)
         // search query
    }
    ,
    {
      $push : {request : {$each:[{communityid : req.body.id}]}}
        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.error(err)
      })
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send()
    })
})








app.get('/profileedit',middleFunc , (req,res)=>{
//  console.log(req.session.username);
  //var data=JSON.parse(req.session);
    res.render('menuedit',{data : [{'email':req.session.email , 'gender' : req.session.gender,'username' : req.session.name,'city' : req.session.city, 'dob' : req.session.dob, 'phoneNo' :req.session.phoneNo,'image' : req.session.image}]});
})


app.post('/deleteaction',function (req, res) {
// console.log(req.body);
    tag.find({
    _id : req.body.id
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    })
})



app.get('/getCommunityforSearch',function (req, res) {
  community.find({
    ownerid : {'$ne' :req.session._id},
    'member.id' : {'$ne' :req.session._id },
    'request.id' : {'$ne' :req.session._id }
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    })
})


app.get('/ownercommunities',function (req, res) {
  owners.find({
    ownerId : req.session._id
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
})



app.get('/getmessages/:id',function (req, res) {
  discussions.find({
    _id : ObjectId(req.params.id)
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
})


app.get('/membercommunities',function (req, res) {
  var set=[];
  login.findOne({
    _id: ObjectId(req.session._id),
       // search query
      // username : req.body.username,
  })
  .then(data => {
      console.log(data)
      console.log(data.member);
      var users = [];
      for(var i=0;i<data.member.length;i++)
      {
          users.push(ObjectId(data.member[i].communityid) );
      }

      community.find({
        _id : { $in : users }
           // search query
          // username : req.body.username,
      }).then(d=>{
        console.log(d);
        res.send(d);
        //set.push(d);
        //console.log(""+d);
      //  console.log("//////"+set);
      }).catch(e=>{
        console.log(e);
      })


    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
})







app.get('/requestcommunitiesdata',function (req, res) {
  login.findOne({
    _id: ObjectId(req.session._id),
       // search query
      // username : req.body.username,
  })
  .then(data => {
      //console.log(data)
      //console.log(data.member);
      var users = [];
      for(var i=0;i<data.request.length;i++)
      {
          users.push(ObjectId(data.request[i].communityid) );
      }

      community.find({
        _id : { $in : users }
           // search query
          // username : req.body.username,
      }).then(d=>{
        console.log(d);
        res.send(d);
        //set.push(d);
        //console.log(""+d);
      //  console.log("//////"+set);
      }).catch(e=>{
        console.log(e);
      })


    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
})








app.post('/searchCommunity',function (req, res) {
//console.log(req.body);
var search=req.body.search;
var findobj;
if(search!='')
     findobj= {
    "name":  { '$regex' : search, '$options' : 'i' },
    "ownerid" : {'$ne' :req.session._id},
    'member.id' : {'$ne' :req.session._id },
    'request.id' : {'$ne' :req.session._id }
}
else{
    delete findobj;
    findobj= {
   ownerid : {'$ne' :req.session._id},
   'member.id' : {'$ne' :req.session._id },
   'request.id' : {'$ne' :req.session._id }
}
}


community.find(findobj).then(data => {
  //  console.log(data)
    res.send(data)
  })
  .catch(err => {
    console.error(err)
  //  res.send(error)
  })
})



app.post('/updatepopup',function (req, res) {
console.log(req.body);
  login.find({
    _id : req.body.id
       // search query
      // username : req.body.username,
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
})


app.post('/activateuser',function(req,res){
    //console.log(req.body);
    login.findOneAndUpdate(
    {
      _id : req.body.id
         // search query
    },
    {
      active : "1"
        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        //console.log(data)
        res.send(data)
      })
      .catch(err => {
        console.error(err)
        res.send()
      })
})


app.post('/deactivateuser',function(req,res){
    //console.log(req.body);
    login.findOneAndUpdate(
    {
      _id : req.body.id
         // search query
    },
    {
      active : "0"
        // field:values to update
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        //console.log(data)
        res.send(data)
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.post('/deletetag',function (req, res) {
  tag.findOneAndDelete(
  {
    _id : req.body.id
       // search query
  })
  .then(data => {
    //  console.log(data)
      res.send(data)
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })

})







app.post('/updateProfilePic',middleFunc,function(req,res){
console.log("picupload");
console.log(req.body);
  upload(req, res,(err) => {
      if(err){
        console.log(err);
      } else {
        if(req.file == undefined){
          console.log(err);
          res.redirect("/editProfile");
        } else {
          login.findOneAndUpdate(
          {
            _id : req.session._id
               // search query
          },
          {
            image : req.session.image

              // field:values to update
          },
          {
            new: true,                       // return updated doc
            runValidators: true              // validate before update
          })
          .then(data => {
              console.log(data)
              if(req.session.userType=="superuser")
              res.redirect("/editProfile");
              else
              {
                if(data.status.toLowerCase()=="pending")
                  res.redirect("/userProfilePending");
                  else
                  res.redirect("/usereditProfile");
              }

      //        res.send(data)
            })
            .catch(err => {
              console.error(err)
              res.send(error)
            })
      //  console.log("done");

        }
      }
    });

});








app.post('/updatecommunityPic',middleFunc,function(req,res){
console.log("picupload");
console.log(req.body);
  upload1(req, res, (err) => {
      if(err){
        console.log(err);
      } else {
        if(req.file == undefined){
          console.log(err);
          res.redirect("/editProfile");
        } else {
          community.findOneAndUpdate(
          {
            _id : req.session.communityid
               // search query
          },
          {
            image : req.session.communityimage

              // field:values to update
          },
          {
            new: true,                       // return updated doc
            runValidators: true              // validate before update
          })
          .then(data => {
              console.log(data)
                  res.redirect("/addcommunity");


      //        res.send(data)
            })
            .catch(err => {
              console.error(err)
              res.send(error)
            })
      //  console.log("done");

        }
      }
    });

});


















app.post('/gettabledata',function (req, res) {
console.log(req.body);
// console.log(req.body.order[0].column);
var count;

if(req.body.order[0].column==0)
{
  if(req.body.order[0].dir=="asc")
  getdata("username",1);
  else
  getdata("username",-1);
}
else if(req.body.order[0].column==1)
{
  if(req.body.order[0].dir=="asc")
  getdata("phoneNo",1);
  else
  getdata("phoneNo",-1);
}
else if(req.body.order[0].column==2)
{
  if(req.body.order[0].dir=="asc")
  getdata("city",1);
  else
  getdata("city",-1);
}
else if(req.body.order[0].column==3)
{
  if(req.body.order[0].dir=="asc")
  getdata("status",1);
  else
  getdata("status",-1);
}
else if(req.body.order[0].column==4)
{
  if(req.body.order[0].dir=="asc")
  getdata("userType",1);
  else
  getdata("userType",-1);
}

else {
  getdata("username",1);
}







function getdata(colname,sortorder)
{
//  if(req.body.search.value.length>0)
//  {
// console.log(req.body);
    login.countDocuments(function(e,count){

      var start=parseInt(req.body.start);
      var len=parseInt(req.body.length);
      var role=req.body.role;
      var status=req.body.status;
      var search=req.body.search.value;
      var getcount=10;
      // console.log(req.body.search.value.length);

    //   login.find({
    //       "$or": [{
    //     "username":  { '$regex' : req.body.search.value, '$options' : 'i' }
    //   }, {
    //     "phoneNo":{ '$regex' : req.body.search.value, '$options' : 'i' }
    //   },{
    //     "city": { '$regex' : req.body.search.value, '$options' : 'i' }
    //   },{
    //     "userType": { '$regex' : req.body.search.value, '$options' : 'i' }
    //   }],
    // }).countDocuments(function(e,coun){
    //   //console.log(coun);
    //   getcount=coun;
    // }).catch(err => {
    //   console.error(err)
    //   res.send(error)
    // })



    var findobj={};
      // console.log(role,status);
      if(role!="All")
         { findobj.userType=role;}
      else{
          delete findobj["userType"];
      }
      if(status!="All")
          {findobj.status=status;}
      else{
          delete findobj["status"];
      }
      if(search!='')
          findobj["$or"]= [{
          "username":  { '$regex' : search, '$options' : 'i' }
      }, {
          "phoneNo":{ '$regex' : search, '$options' : 'i' }
      },{
          "city": { '$regex' : search, '$options' : 'i' }
      }
      ,{
          "status":  { '$regex' : search, '$options' : 'i' }
      }
      ,{
          "userType": { '$regex' : search, '$options' : 'i' }
      }]
      else{
          delete findobj["$or"];
      }


      login.find(findobj).countDocuments(function(e,coun){
      //console.log(coun);
      getcount=coun;
    }).catch(err => {
      console.error(err)
      res.send(error)
    })




      login.find(findobj).skip(start).limit(len).sort({[colname] : sortorder})
      .then(data => {
        //  console.log(data)
          res.send({"recordsTotal" : count,"recordsFiltered" :getcount,data})
        })
        .catch(err => {
          console.error(err)
        //  res.send(error)
        })
    });
  //}
//   else {
//   login.countDocuments(function(e,count){
//     var start=parseInt(req.body.start);
//     var len=parseInt(req.body.length);
//     if(req.body.status=="All"&&req.body.role=="All")
//     {
//     login.find({
//
//          // search query
//         // username : req.body.username,
//     }).skip(start).limit(len).sort({[colname] : sortorder})
//     .then(data => {
//         //console.log(data)
//         res.send({"recordsTotal" : count,"recordsFiltered" :count,data})
//       })
//       .catch(err => {
//         console.error(err)
//         res.send(error)
//       })
//     }
//   });
// }
}











/*
if(req.body.order[0].column==0)
{
  if(req.body.order[0].dir=="asc")
  {
    login.countDocuments(function(e,count){
      var start=parseInt(req.body.start);
      var len=parseInt(req.body.length);
      login.find({
           // search query
          // username : req.body.username,
      }).skip(start).limit(len)
      .then(data => {
        //  console.log(data)
          res.send({"recordsTotal" : count,"recordsFiltered" :count,data})
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
    });

  }
  else{
    login.countDocuments(function(e,count){
      var start=parseInt(req.body.start);
      var len=parseInt(req.body.length);
      login.find({
           // search query
          // username : req.body.username,
      }).skip(start).limit(len).sort({username : -1})
      .then(data => {
        //  console.log(data)
          res.send({"recordsTotal" : count,"recordsFiltered" :count,data})
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
    });

  }
}

else{

console.log("selse");
login.countDocuments(function(e,count){
  var start=parseInt(req.body.start);
  var len=parseInt(req.body.length);
  login.find({
       // search query
      // username : req.body.username,
  }).skip(start).limit(len)
  .then(data => {
    //  console.log(data)
      res.send({"recordsTotal" : count,"recordsFiltered" :count,data})
    })
    .catch(err => {
      console.error(err)
      res.send(error)
    })
});
}*/

})





app.post('/sendemail',function (req, res) {

console.log(req.body);
sendmailer(req.body.mailto,req.body.mailcontent,req.body.sub);
res.send()

})






function sendmailer(mailto,content,sub)
{
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'himanshugarg9113@gmail.com',
      pass: '@Himanshu99'
    }
  });

  var mailOptions = {
    from: 'himanshugarg9113@gmail.com',
    to: mailto,
    subject: sub,
    html : content
    // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
    //  console.log('Email sent: ' + info.response);
    }
  });

}








function mailer(mailto,userpass)
{
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'himanshugarg9113@gmail.com',
      pass: '@Himanshu99'
    }
  });

  var mailOptions = {
    from: 'himanshugarg9113@gmail.com',
    to: mailto,
    subject: 'cq',
    text: `Hi welcome to cq .
    Your username is `+mailto+`
    password : `+userpass+` .`
    // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
    //  console.log('Email sent: ' + info.response);
    }
  });

}







app.listen(2000);
