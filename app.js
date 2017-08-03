var express = require('express');
var app = express();
var axios = require('axios');
const csv=require('csvtojson')
var fs = require('fs')



var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());




app.get('/listings', function(req,res){ //For user Registration
  console.log(req.query);
  const min_price = req.query.min_price || 0;
  const max_price = req.query.max_price || Infinity;
  const min_bed = req.query.min_bed || 0;
  const max_bed = req.query.max_bed || Infinity;
  const min_bath = req.query.min_bath || 0;
  const max_bath = req.query.max_bath || Infinity;


  const returnJSON ={ "type": "FeatureCollection", "features": [] }

  axios.get('https://s3.amazonaws.com/opendoor-problems/listing-details.csv')
  .then(function (response) {
    csv()
  .fromString(response.data)
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
    res.status(200).json(returnJSON)
  })
  })

  .catch(function (error) {
    console.log("ERROR", error);
  });
});

// app.post('/users/register', function(req,res){ //For user Registration
//   var newUser = new User({
//     username:req.body.username,
//     password:req.body.password
//   });
//   newUser.save(function(err){
//     if (err){
//       res.status(400).json({error:err});
//     }
//     else{
//       res.status(200).json({success:true});
//     }
//   });
// });
//
// app.post('/users/login', function(req,res){ //Checking to see if user is logged in
//   User.findOne({username:req.body.username},function(err,obj){
//     if (err || !obj){
//       res.status(400).json({error:err});
//     }else{
//       if (req.body.password  === obj.password){
//         res.status(200).json({success:true});
//       }else{
//         res.status(401).json({error:"Incorrect Password"});
//       }
//     }
//   });
// });
//
//
//
//
// app.post('/designs/voteup/:designId', function(req,res){ //upvote a design
//   //SEND THE USERNAME INSIDE THE BODY OF THE REQUEST SO THAT YOU CAN UPDATE THE USERS OVERALL rating
//   // req.body.usernamedesignerRating
//
//   Design.findOne({_id:req.params.designId},function(err,design){
//     if(err){
//       res.status(400).json({error:err});
//     } else {
//       if (design){
//         design.rating = design.rating + 1;
//         design.save(function(err){
//           if (err){
//             res.status(400).json({error:err});
//           }
//           else{
//             res.status(200).json({success:true, rating: design.rating});
//           }
//         });
//       }
//     }
//   });
// });
//
// app.post('/designs/votedown/:designId', function(req,res){ //downvote a design
//   Design.findOne({_id:req.params.designId},function(err,design){
//     if (design){
//       design.rating = design.rating - 1;
//       design.save(function(err){
//         if (err){
//           res.status(400).json({error:err});
//         }
//         else{
//           res.status(200).json({success:true, rating: design.rating});
//         }
//       });
//     }else{
//       res.status(400).json({error:err});
//     }
//   });
// });

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Express started, listening to port: ', port);
});
