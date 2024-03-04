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
    if (!checkbody(req.body, ['userName', 'password', 'token'])) {
      res.json({ result: false, error: 'Champ vide ou manquant' });
      return;
    }

    // Vérifiez si l'utilisateur existe
    const existingUser = await User.findOne({ token: req.body.token });

    if (!existingUser) {
      res.json({ result: false, error: 'Utilisateur non trouvé' });
      return;
    }

    // Mettez à jour les paramètres sauf le token
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const updateResult = await User.updateOne(
      { token: req.body.token },
      {
        $set: {
          userName: req.body.userName,
          password: hashedPassword,
          avatar: req.body.avatar,
          email: req.body.email,
        },
      }
    );

    if (updateResult.nModified > 0) {
      // Au moins un document a été modifié
      res.json({ result: true, message: 'Utilisateur mis à jour avec succès' });
    } else {
      // Aucun document n'a été modifié
      res.json({ result: false, error: 'Aucune modification effectuée' });
    }
  } catch (error) {
    res.json({ result: false, error: 'Une erreur est survenue lors de la mise à jour des paramètres' });
  }

});
 

module.exports = router;

