const request = require('request');
const cheerio = require('cheerio')
const iconv = require('iconv')
const entities = require('html-entities').XmlEntities;
const TelegramBot = require('node-telegram-bot-api');
const token_file = require('./token');

// replace the value below with the Telegram token you receive from @BotFather
const token = token_file.token;

// Listen for any kind of message. There are different kinds of
// messages.

const phrases = require('./phrases');

const func_array = [getRandomFC, getRandomHannibal, getRandomStalin, getRandomFC, getRandomBBT];


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
bot.onText(/\/(.+)/, function (msg) {
	interval = 1;
	if (msg.text.indexOf('http') == -1) {
		const chatId = msg.chat.id;
		const bash = msg.text.indexOf('bash') >= 0;
		const quote = msg.text.indexOf('цитат') >= 0;
		const russ = msg.text.toLowerCase().indexOf('росси') >= 0;
		const nietzsche = msg.text.toLowerCase().indexOf('ницше') >= 0;
		const advice = msg.text.indexOf('совет') >= 0;
		sendRandom(chatId, bash, quote, russ, nietzsche, advice);
	}
});

currencies = {
  'руб':'RUB',

  'доллар':'USD',
  'бакс':'USD',

  'кц':'CZK',
  'кч':'CZK',
  'крон':'CZK',

  'евро':'EUR'
}
const currencies_regexp = new RegExp("\\d+ (?:"+Object.keys(currencies).join('|')+")");
// Matches "/echo [whatever]"
bot.onText(currencies_regexp, function (msg, match) {
  const chatId = msg.chat.id;
  match.forEach(elem => {
    splitted = elem.split(' ')
    num = parseFloat(splitted[0]);
    let currency = splitted[1];
    if (currencies[currency] != undefined) {
      currency = currencies[currency];
      request('http://api.fixer.io/latest', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const resp = JSON.parse(body);
        let rates = resp.rates;
		rates['EUR'] = 1.0;
		rates['KZT'] = rates['RUB'] * 5.59;
        const date = resp.date;
        const current_rate = rates[currency];
        const converted = num / current_rate;
        const required_currencies = ['EUR', 'RUB', 'CZK', 'KZT', 'GBP']
		const converted_strings = required_currencies.filter(curr => curr!=currency).map(curr => (converted * rates[curr]).toFixed(2) + ' ' + curr).join('\n')
        bot.sendMessage(chatId, 'по курсу на '+date+'\n'+num.toString()+' '+currency+'\n'+converted_strings);
      }
    })
    }
  })

});
   



let timer = undefined;
let interval = 1;

function sendRandom(chatId, bash, quote, russ, nietzsche, advice) {
	if (Math.random() > 0.95 || nietzsche) {
		rand_promise = getRandomNietzsche();
	} else if (Math.random() > 0.95 || russ) { 
		rand_promise = getRandomPutin();
	} else if (Math.random() > 0.95 || quote) {
		rand_promise = func_array[Math.floor(Math.random() * func_array.length)]()
	} else if (Math.random() > 0.95 || bash) {
		rand_promise = getRandomBash();
	} else if (Math.random() > 0.95 || advice) {
		rand_promise = getRandomAdvice();
	} else {
		rand_promise = getRandomPhrase();
	}
	rand_promise.then(result => {
		bot.sendMessage(chatId,result);
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => { 
			sendRandom(chatId);			
		}, 60 * 60 * 1000 * interval);
		interval *= 2;
		console.log(interval);
	})
}

let previous = undefined;
function getRandomPhrase() {
	return new Promise((resolve, reject) => {
		let rand;
		while (true) {
			rand = phrases.text_array[Math.floor(Math.random() * phrases.text_array.length)]
			if (rand != previous) {
				previous = rand;
				break
			}
		}
		resolve(rand);
	})
}

function getRandomBash() {
	return new Promise((resolve, reject) => {
		const page = Math.round(Math.random()*100)+1;
		request({ 
			uri: 'http://bash.im/byrating/'+page.toString(),
			method: 'GET',
			encoding: 'binary'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				const body_buffer = new Buffer(body, 'binary');
				const conv = new iconv.Iconv('windows-1251', 'utf8');
				const body_text = conv.convert(body_buffer).toString();
				let $ = cheerio.load(body_text);
				const myhtml = $.html().replace(/<br>/gm, '\n'); // remove all html tags
				$ = cheerio.load(myhtml);
				const number = Math.round(Math.random()*49)+1;
				const text = $('.text').eq(number).text();
				resolve(text);
			}
		});
	})
}


function getRandomAdvice() {
	return new Promise((resolve, reject) => {
		const page = Math.round(Math.random()*10)+1;
		request({ 
			uri: 'http://fucking-great-advice.ru/advice/'+page.toString(),
			method: 'GET',
			encoding: 'binary'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				const body_buffer = new Buffer(body, 'binary');
				const body_text = body_buffer.toString();
				let $ = cheerio.load(body_text);
				const myhtml = $.html().replace(/<br>/gm, '\n'); // remove all html tags
				$ = cheerio.load(myhtml);
				const text = $('#advice').text();
				resolve(text); 
				
			}
		});
	})
}


function getRandomQuote(url, max_page, max_item) {
	return new Promise((resolve, reject) => {
		const page = Math.round(Math.random()*max_page);
		url = url+'?page='+page.toString();
		request({ 
			uri: url,
			method: 'GET',
			encoding: 'utf8'
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {		
				const $ = cheerio.load(body.replace('<br>',''));
				const number = Math.round(Math.random()*(10))+1;
				const text = $('.field-type-text-with-summary').eq(number).text();
				resolve(text);
			}
		});
	})	
}

function getRandomStalin() {
	return getRandomQuote('http://citaty.info/man/iosif-vissarionovich-stalin', 4, 11);
}

function getRandomHannibal() {
	return getRandomQuote('http://citaty.info/character/gannibal-lekter', 7, 11);
}

function getRandomFC() {
	return getRandomQuote('http://citaty.info/book/chak-palanik-boicovskii-klub', 9, 11);
}

function getRandomBBT() {
	return getRandomQuote('http://citaty.info/serial/teoriya-bolshogo-vzryva-the-big-bang-theory', 76, 11);
}

function getRandomPutin() {
	return getRandomQuote('http://citaty.info/man/vladimir-vladimirovich-putin', 7, 11);
}

function getRandomNietzsche() {
	return getRandomQuote('http://citaty.info/man/fridrih-vilgelm-nicshe', 19, 11);
}


