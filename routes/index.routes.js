const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  // if user is logged in, redirect to collection view
  if (req.session.user) {
    return res.redirect("/collection");
  }
  return res.render("index");
});

module.exports = router;
