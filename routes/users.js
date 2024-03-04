var express = require('express');
var router = express.Router();
require('../models/connection');


const User = require('../models/users');
const {checkbody} = require('../modules/checkbody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');



//--> Route Post signup

router.post('/signup', (req, res) => {

  if (!checkbody(req.body, ['userName', 'password'])) {
    res.json({ result: false, error: 'Champ vide ou manquant' });
    return;
  }

  //--> Vérification d'un compte déjà existant

  User.findOne({ userName: req.body.userName }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        avatar: '',
        userName: req.body.userName,
        email: req.body.email,
        password: hash,
        token: uid2(32),
    });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User déjà existant dans la database
      res.json({ result: false, error: 'Utilisateur déjà existant' });
    }
  });
});



//--> Route Post signin

router.post('/signin', (req, res) => {

  if (!checkbody(req.body, ['userName', 'password'])) {
    res.json({ result: false, error: 'Champ vide ou manquant' });
    return;
  }

  User.findOne({ userName: req.body.userName }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'Utilisateur non trouvé ou mot de passe erroné' });
    }
  });
});

//--> Route Put Modifier les paramètres

router.put('/update', (req, res) => {
  
 
  res.json({ result: true });
 });


module.exports = router;

