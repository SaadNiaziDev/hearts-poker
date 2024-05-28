let router = require("express").Router();

router.use("/user", require("./user"));
router.use("/referral", require("./referral"));
router.use("/upload", require("./upload"));
router.use("/wallet", require("./wallet"));
router.use("/game", require("./game"));
router.use("/transaction", require("./transaction"));
router.use("/chats", require("./chat"));

module.exports = router;
