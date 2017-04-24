var request = require('request');
var cheerio = require('cheerio')
var iconv = require('iconv')
var entities = require('html-entities').XmlEntities;
var TelegramBot = require('node-telegram-bot-api');
var token_file = require('./token')

// replace the value below with the Telegram token you receive from @BotFather
var token = token_file.token

// Listen for any kind of message. There are different kinds of
// messages.

var phrases = require('./phrases')

var func_array = [getRandomFC, getRandomHannibal, getRandomStalin, getRandomFC, getRandomBBT]


// Create a bot that uses 'polling' to fetch new updates
var bot = new TelegramBot(token, { polling: true });
bot.onText(/\/(.+)/, function (msg) {
	console.log(msg)
	var chatId = msg.chat.id;
	var bash = msg.text.indexOf('bash') >= 0
	var quote = msg.text.indexOf('цитат') >= 0
	var russ = msg.text.toLowerCase().indexOf('росси') >= 0
	sendRandom(chatId, bash, quote, russ)
});

currencies = {
  'руб':'RUB',
  'крон':'CZK',
  'доллар':'USD',
  'бакс':'USD',
  'кц':'CZK',
  'кч':'CZK',
  'евро':'EUR'
}

// Matches "/echo [whatever]"
bot.onText(/\d+ (?:руб|крон|доллар|бакс|кц|евро)/, function (msg, match) {
  var chatId = msg.chat.id;
  console.log(match)
  match.forEach(elem => {
    splitted = elem.split(' ')
    num = parseFloat(splitted[0])
    currency = splitted[1]
    if (currencies[currency] != undefined) {
      currency = currencies[currency]
      request('http://api.fixer.io/latest', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resp = JSON.parse(body)
        rates = resp.rates
		rates['EUR'] = 1.0
        date = resp.date
        current_rate = rates[currency]
        converted = num / current_rate

		converted_rub = converted * rates['RUB']
        bot.sendMessage(chatId, 'по курсу на '+date+'\n'+num.toString()+' '+currency+' = '+converted.toFixed(2)+' EUR = '+converted_rub.toFixed(2)+' RUB' );
      }
    })
    }
  })

});
   



var timing = undefined
function sendRandom(chatId, bash, quote, russ) {
	if (Math.random() > 0.95 || russ) { 
		rand_promise = getRandomPutin()
	} else if (Math.random() > 0.95 || quote) {
		rand_promise = func_array[Math.floor(Math.random() * func_array.length)]()
	}	
	else if (Math.random() > 0.95 || bash) {
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
				var $ = cheerio.load(body)
				var myhtml = $.html().replace(/<br>/gm, '\n') // remove all html tags
				$ = cheerio.load(myhtml)
				number = Math.round(Math.random()*49)+1
				text = $('.text').eq(number).text()
				resolve(text)
			}
		});
	})
}


function getRandomQuote(url, max_page, max_item) {
	return new Promise((resolve, reject) => {
		page = Math.round(Math.random()*max_page)
		url = url+'?page='+page.toString()
		console.log(url)
		request({ 
			uri: url,
			method: 'GET',
			encoding: 'utf8'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				$ = cheerio.load(body.replace('<br>',''))
				number = Math.round(Math.random()*(10))+1
				text = $('.field-type-text-with-summary').eq(number).text()
				resolve(text)
			}
		});
	})	
}

function getRandomStalin() {
	return getRandomQuote('http://citaty.info/man/iosif-vissarionovich-stalin', 4, 11)	
}

function getRandomHannibal() {
	return getRandomQuote('http://citaty.info/character/gannibal-lekter', 7, 11)	
}

function getRandomFC() {
	return getRandomQuote('http://citaty.info/book/chak-palanik-boicovskii-klub', 9, 11)	
}

function getRandomBBT() {
	return getRandomQuote('http://citaty.info/serial/teoriya-bolshogo-vzryva-the-big-bang-theory', 76, 11)	
}

function getRandomPutin() {
	return getRandomQuote('http://citaty.info/man/vladimir-vladimirovich-putin', 7, 11)	
}

function getRandomNietzsche() {
	return getRandomQuote('http://http://citaty.info/man/fridrih-vilgelm-nicshe', 19, 11)	
}


