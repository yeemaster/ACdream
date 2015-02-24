
var router = require('express').Router();

var Solution = require('../models/solution.js');
var Problem = require('../models/problem.js');
var Contest = require('../models/contest.js');

var KEY = require('./key');
var Comm = require('../comm');
var LogErr = Comm.LogErr;

/*
 * 查看源代码的页面
 */
router.get('/:rid', function(req, res){
  var rid = parseInt(req.params.rid, 10);
  if (!rid) {
    return res.redirect('/404');
  }
  Solution.findOne({runID: rid})
  .then(function(sol) {
    if (!sol) {
      return res.redirect('/404');
    }
    var RP = function(flg){
      res.render('sourcecode', {
        title: 'Sourcecode',
        key: KEY.SOURCE_CODE,
        solution: sol,
        getDate: Comm.getDate,
        flg: flg,
        Res: Comm.solRes
      });
    };
    if (!req.session.user) {
      return RP(false);
    }
    var name = req.session.user.name;
    if (name == sol.userName || name == 'admin') {
      return RP(true);
    }
    Problem.watch(sol.problemID)
    .then(function(prob){
      if (!prob) {
        return res.redirect('/404');
      }
      if (name == prob.manager) {
        return RP(true);
      }
      if (sol.cID < 0) {
        return RP(false);
      }
      Contest.watch(sol.cID)
      .then(function(contest){
        return RP(contest && name == contest.userName);
      })
      .fail(function(err){
        FailRedirect(err, req, res);
      });
    })
    .fail(function(err){
      FailRedirect(err, req, res);
    });
  })
  .fail(function(err){
    FailRedirect(err, req, res);
  });
});

module.exports = router;
