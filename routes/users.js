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
        res.json({ result: true, token: newDoc.token, userName: newDoc.userName });
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
      res.json({ result: true, token: data.token, userName: data.userName });
    } else {
      res.json({ result: false, error: 'Utilisateur non trouvé ou mot de passe erroné' });
    }
  });
});

//--> Route Put Modifier / Mettre à jour les paramètres (username, password, avatar, email)

router.put('/update', async (req, res) => {
  
  try {
    // Vérifiez que le corps de la requête a bien les champs nécessaires
    if (!checkbody(req.body, ['userName', 'password', 'avatar', 'email'])) {
      res.json({ result: false, error: 'Champ vide ou manquant' });
      return;
    }

    // Créez un objet de mise à jour avec les champs à mettre à jour
    const updateFields = {
      userName: req.body.userName,
      password: bcrypt.hashSync(req.body.password, 10),
      avatar: req.body.avatar,
      email: req.body.email,
    };

    // Utilisez updateOne() pour mettre à jour les champs spécifiés
    const result = await userSchema.updateOne({ token: req.body.token }, updateFields);

    // Ajoutez des logs pour le débogage
    console.log(result);

    // Vérifiez si la mise à jour a réussi (au moins un document a été filtré)
    if (result.n > 0 && result.ok === 1) {
      res.json({ result: true, user: updateFields });
    } else {
      res.json({ result: false, error: 'Aucun utilisateur mis à jour' });
    }
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'Une erreur est survenue lors de la mise à jour des paramètres' });
  }
});
 

module.exports = router;

