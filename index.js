var request = require('request');
let cheerio = require('cheerio')
let iconv = require('iconv')
var entities = require('html-entities').XmlEntities;
var TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
var token = 'YOUR_TOKEN';

// Create a bot that uses 'polling' to fetch new updates
var bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.

var phrases = require('./phrases')

func_array = [getRandomFC, getRandomHannibal, getRandomStalin, getRandomFC, getRandomBBT]


bot.on('message', function (msg) {
	console.log(msg)
	var chatId = msg.chat.id;
	var bash = msg.text.indexOf('bash') >= 0
	var quote = msg.text.indexOf('цитат') >= 0
	sendRandom(chatId, bash, quote)
});

var timing = undefined
function sendRandom(chatId, bash, quote) {
	if (Math.random() > 0.95 || quote) {
		rand_promise = func_array[Math.floor(Math.random() * func_array.length)]()
	}	
	else if (Math.random() > 0.95
	 || bash) {
		rand_promise = getRandomBash()
		console.log('getRandomBash()')
	} else
		rand_promise = getRandomPhrase()
		console.log('getRandomPhrase()')
	rand_promise.then(result => {
		bot.sendMessage(chatId,result);
		if (timing)
			clearTimeout(timing);
		timing = setTimeout(() => { 
			sendRandom(chatId) 
		}, 60 * 1000 * 60)		
	})
}

var previous = undefined
function getRandomPhrase() {
	return new Promise((resolve, reject) => {
		while (true) {
			var rand = phrases.text_array[Math.floor(Math.random() * phrases.text_array.length)]
			if (rand != previous) {
				previous = rand
				break
			}
		}
		resolve(rand)
	})
}

function getRandomBash() {
	return new Promise((resolve, reject) => {
		page = Math.round(Math.random()*10)+1
		request({ 
			uri: 'http://bash.im/byrating/'+page.toString(),
			method: 'GET',
			encoding: 'binary'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				body = new Buffer(body, 'binary');
				conv = new iconv.Iconv('windows-1251', 'utf8');
				body = conv.convert(body).toString();		
				let $ = cheerio.load(body)
				var myhtml = $.html().replace(/<br>/gm, '\n') // remove all html tags
				$ = cheerio.load(myhtml)
				number = Math.round(Math.random()*49)+1
				text = $('.text').eq(number).text()
				resolve(text)
			}
		});
	})
}


function getRandomStalin() {
	return new Promise((resolve, reject) => {
		page = Math.round(Math.random()*4)
		request({ 
			uri: 'http://citaty.info/man/iosif-vissarionovich-stalin?page='+page.toString(),
			method: 'GET',
			encoding: 'utf8'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				$ = cheerio.load(body.replace('<br>',''))
				number = Math.round(Math.random()*10)+1
				text = $('.field-type-text-with-summary').eq(number).text()
				resolve(text)
			}
		});
	})	
}

function getRandomHannibal() {
	return new Promise((resolve, reject) => {
		page = Math.round(Math.random()*7)
		request({ 
			uri: 'http://citaty.info/character/gannibal-lekter?page='+page.toString(),
			method: 'GET',
			encoding: 'utf8'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				$ = cheerio.load(body.replace('<br>',''))
				number = Math.round(Math.random()*10)+1
				text = $('.field-type-text-with-summary').eq(number).text()
				resolve(text)
			}
		});
	})	
}


function getRandomFC() {	
	return new Promise((resolve, reject) => {
		page = Math.round(Math.random()*9)
		request({ 
			uri: 'http://citaty.info/book/chak-palanik-boicovskii-klub?page='+page.toString(),
			method: 'GET',
			encoding: 'utf8'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				$ = cheerio.load(body.replace('<br>',''))
				number = Math.round(Math.random()*10)+1
				text = $('.field-type-text-with-summary').eq(number).text()
				resolve(text)
			}
		});
	})	
}

function getRandomBBT() {
	return new Promise((resolve, reject) => {
		page = Math.round(Math.random()*76)
		request({ 
			uri: 'http://citaty.info/serial/teoriya-bolshogo-vzryva-the-big-bang-theory?page='+page.toString(),
			method: 'GET',
			encoding: 'utf8'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				// body = new Buffer(body, 'binary');
				// conv = new iconv.Iconv('windows-1251', 'utf8');
				// body = conv.convert(body).toString();		
				// let $ = cheerio.load(body)
				// var myhtml = $.html().replace(/<br>/gm, '\n') // remove all html tags
				$ = cheerio.load(body.replace('<br>',''))
				number = Math.round(Math.random()*10)+1
				text = $('.field-type-text-with-summary').eq(number).text()
				resolve(text)
			}
		});
	})	
}



// $('h2.title').text('Hello there!')
// $('h2').addClass('welcome')

