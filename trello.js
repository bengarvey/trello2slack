console.log("Starting trello.js");

var request = require("request");
var async = require("async");
var yaml = require('js-yaml');
var fs   = require('fs');

// Load in config file
var config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'));
var key = config.key;
var token = config.token;
var supportBoardId = config.boardId;
var listIds = config.listIds;

var slackDomain = config.slackDomain;
var slackbotToken = config.slackbotToken;
var channel = config.channel;

// URL
var baseUrl = 'https://api.trello.com';

// Loop through each list ID and get the total number of cards in queue
var totalCards = 0;

function getList(id, callback) {
  console.log("Checking " + id);
  path = '/1/lists/' + id + '/cards?key=' + key + '&token=' + token;
  url = baseUrl + path;

  var req = request(url, function(error, response, body) {
    cardCount = JSON.parse(body).length;
    totalCards += cardCount;
    callback();
  });
}

function postList(err) {
  console.log("Found " + totalCards + " cards");
  console.log("Posting");
  path = 'https://' + slackDomain + '.slack.com/services/hooks/slackbot?token=' + slackbotToken + '&channel=' + channel;
  request.post(path, {form:{queue: totalCards}});
  console.log("Complete!");
}

async.each(listIds, getList, postList);

