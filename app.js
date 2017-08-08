var express = require('express');
var app = express();
var axios = require('axios');
const csv=require('csvtojson')
var mongoose = require('mongoose')

var User   = require('./models/User'); // get our mongoose model

var bcrypt = require('bcrypt');
const saltRounds = 10;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

let csv_data;
mongoose.connect(process.env.MONGODB_URI);



app.post('/retrieve_key', function(req, res) {
  const username = req.body.username;
  User.findOne({
    username: username,
  }, function(err, user) {
    if (!user){
      res.json({success:false, error:'No user exists'})
    }else{
      bcrypt.compare(req.body.password, user.password, function(err, response) {
        if (response === true){
          res.json({success: true, api_key: user.api_key})
        }else{
          res.json({success: false, error:'Incorrect Password'})
        }
      });
    }
  });
});

app.post('/register', function(req, res) {
  const username = req.body.username;
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const api_key = username + hash;
    bcrypt.hash(api_key, saltRounds, function(err, hashed) {
      var newUser = new User({
        username: username,
        password: hash,
        api_key: hashed,
      });

      newUser.save(function(err) {
        if (err) throw err;
        console.log('User saved successfully');
        res.json({ success: true });
      });
    });
  });
});


app.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['api_key'];
  // decode token
  if (token) {
    User.findOne({
      api_key: token,
    }, function(err, user) {
      if (err) return res.send(500, { error: err });
      if (!user){
        res.json({success:false, error:'Non-existant key'})
      }else{
        next();
      }
    })
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No api key provided.'
    });

  }
});
app.get('/refresh_key', function(req, res) {
  const new_api_key = Date.now().toString();
  console.log(new_api_key);
  bcrypt.hash(new_api_key, saltRounds, function(err, hash) {
    User.findOneAndUpdate({api_key: req.headers['api_key']}, {api_key:hash}, {new: true},function(err, user) {
      if (err) return res.send(500, { error: err });

      if (!user) {
        res.json({ success: false, message: 'Authentication failed. Token not found.' });
      } else if (user) {

        // return the information including token as JSON
        console.log(user);
        res.json({
          success: true,
          new_api_key: user.api_key,
        });

      }
    });
  })
});



app.get('/listings', function(req,res){
  const min_price = req.query.min_price || 0;
  const max_price = req.query.max_price || Infinity;
  const min_bed = req.query.min_bed || 0;
  const max_bed = req.query.max_bed || Infinity;
  const min_bath = req.query.min_bath || 0;
  const max_bath = req.query.max_bath || Infinity;

  const returnJSON ={ "type": "FeatureCollection", "features": [] }

  csv()
  .fromString(csv_data)
  .on('csv',(csvRow)=>{
      const id = csvRow[0];
      const street = csvRow[1];
      const status = csvRow[2];
      const price = csvRow[3];
      const bedrooms = csvRow[4];
      const bathrooms = csvRow[5];
      const sq_ft = csvRow[6];
      const lat = csvRow[7];
      const long = csvRow[8];
      if (price<=max_price && price>=min_price && bedrooms<=max_bed && bedrooms>=min_bed && bathrooms<=max_bath && bathrooms>=min_bath ){
        const feature = {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lat,long]},
            "properties": {
              "id": id,
              "price": price,
              "street": street,
              "bedrooms": bedrooms,
              "bathrooms": bathrooms,
              "sq_ft": sq_ft
            }
          }
          returnJSON.features.push(feature);
      }
  })
  .on('done',(error)=>{
    if (error){
      console.log("There was an error: ", error);
      res.status(500).json(error);
    }else{
      console.log("Object pulled and parsed successfully")
      res.status(200).json(returnJSON);
    }
  })

});



var port = process.env.PORT || 3000;
app.listen(port, function() {
  axios.get('https://s3.amazonaws.com/opendoor-problems/listing-details.csv')
  .then(function (response) {
    csv_data = response.data;
    console.log('Express started, listening to port: ', port);
  })
  .catch((err)=>console.log("There was an error: ", err))
});
