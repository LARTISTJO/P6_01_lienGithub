const Sauce = require('../models/sauces');
const fs = require('fs');

// Fonction qui crée une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename}`,
    likes: 0,
    dislikes: 0
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction qui affiche une seule sauce
exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Fonction qui permet de modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction qui permet de supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction qui permet d'afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction permettant de liker ou disliker 
exports.likeDislike = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;

  try {
    if (like == 1) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $addToSet: { usersLiked: userId }, $inc: { likes: +1 }})
        .then(() => res.status(200).json({ message: 'Aime !' }))
        .catch((error) => res.status(400).json({ error }));
      } 
        
    else if (like == -1) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $addToSet: { usersDisliked: userId }, $inc: { dislikes: +1 }})
        .then(() => res.status(200).json({ message: 'Aime Pas !' }))
        .catch((error) => res.status(400).json({ error }));
      } 
    
    else {
      Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
            .then(() => res.status(200).json({ message: 'Avis modifié !' }))
            .catch((error) => res.status(400).json({ error }));
        } 
        
    else if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
            .then(() => res.status(200).json({ message: 'Avis modifié !' }))
            .catch((error) => res.status(400).json({ error }));
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};