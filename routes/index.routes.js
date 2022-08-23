const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  // if user is logged in, redirect to collection view
  if (req.session.user) {
    res.redirect("/collection");
  }

  res.render("index");
});

module.exports = router;
