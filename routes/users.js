var express = require('express');
var router = express.Router();
require('../models/connection');


const User = require('../models/users');
const {checkbody} = require('../modules/checkbody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
  try {
    if (!checkbody(req.body, ['userName', 'password', 'email'])) {
      res.json({ result: false, error: 'Champ vide ou manquant' });
      return;
    }

    // Vérification d'un compte déjà existant
    const existingUser = await User.findOne({ userName: req.body.userName });
    const existingEmail = await User.findOne({ email: req.body.email});

    if (existingUser && existingEmail) {
      res.json({ result: false, userName: false, email: false, error: 'Existing user and email' });
      return;
    }
    if (existingUser) {
      res.json({ result: false, userName: false, email: true, error: 'Existing user' });
      return;
    }
    if (existingEmail) {
      res.json({ result: false, userName: true, email: false, error: 'Existing email' });
      return;    
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const newUser = new User({
      avatar: '',
      userName: req.body.userName,
      email: req.body.email,
      password: hash,
      token: uid2(32),
    });

    const newDoc = await newUser.save();
    res.json({ result: true, token: newDoc.token, userName: newDoc.userName, email: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false,  error: 'Erreur serveur' });
  }
});

//--> Route Post signup

// router.post('/signup', (req, res) => {

//   if (!checkbody(req.body, ['userName', 'password', "email"])) {
//     res.json({ result: false, error: 'Champ vide ou manquant' });
//     return;
//   }

//   //--> Vérification d'un compte déjà existant

//   User.findOne({ userName: req.body.userName }).then(data => {
//     if (data === null) {
//       const hash = bcrypt.hashSync(req.body.password, 10);

//       const newUser = new User({
//         avatar: '',
//         userName: req.body.userName,
//         email: req.body.email,
//         password: hash,
//         token: uid2(32),
//     });

//       newUser.save().then(newDoc => {
//         res.json({ result: true, token: newDoc.token, userName: newDoc.userName });
//       });
//     } else {
//       // User déjà existant dans la database
//       res.json({ result: false, error: 'Utilisateur déjà existant' });
//     }
//   });
// });

//--> Route Post signin

router.post('/signin', async (req, res) => {
  try {
    if (!checkbody(req.body, ['credential', 'password'])) {
      res.json({ result: false, error: 'Champ vide ou manquant' });
      return;
    }

    const user = await User.findOne({
      $or: [{ userName: req.body.credential }, { email: req.body.credential }],
    });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.json({ result: true, token: user.token, userName: user.userName });
    } else {
      res.json({ result: false, error: 'Incorrect email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});

// router.post('/signin', (req, res) => {

//   if (!checkbody(req.body, ['credential', 'password'])) {
//     res.json({ result: false, error: 'Champ vide ou manquant' });
//     return;
//   }

//   User.findOne({
//     $or: [{ userName: req.body.credential }, { email: req.body.credential }],
//   }).then((data) => {
//     if (data && bcrypt.compareSync(req.body.password, data.password)) {
//       res.json({ result: true, token: data.token, userName: data.userName });
//     } else {
//       res.json({
//         result: false,
//         error: 'Utilisateur non trouvé ou mot de passe erroné',
//       });
//     }
//   });
// });

//--> Route Put Modifier / Mettre à jour les paramètres (username, password, avatar, email)

router.put('/', async (req, res) => {
  
  try {
    let updateFields = {};

    for (const key in req.body) {
      if (key === "password") {
        updateFields[key] = bcrypt.hashSync(req.body[key], 10) 
      } else {
        updateFields[key] = req.body[key]
      }
    }

    // Utilisez updateOne() pour mettre à jour les champs spécifiés
    const result = await User.updateOne({ token: req.body.token }, updateFields);

    // Ajoutez des logs pour le débogage
    console.log(result);

    // Vérifiez si la mise à jour a réussi (au moins un document a été filtré)
    if (result.modifiedCount > 0) {
      res.json({ result: true, user: updateFields });
    } else {
      res.json({ result: false, error: 'Aucun utilisateur mis à jour' });
    }
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'Une erreur est survenue lors de la mise à jour des paramètres' });
  }
});
 

//--> Route delete un compte

router.delete("/", (req, res) => {
  User.findOne({ token: req.body.token }).then(data => {
      if(data) {
          User.deleteOne({ token: req.body.token }).then(() => {
          res.json({result: true, message: "utilisateur supprimé"})
          })
      } else {
          res.json({result: false, message: "utilisateur introuvable"})
      }
  })
})


module.exports = router;

