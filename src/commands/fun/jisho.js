let Command = require('../../structures/command');
let request = require('request');

class Jisho extends Command {
    constructor({t}) {
        super();
        this.cmd = 'jisho';
        this.cat = 'fun';
        this.needGuild = false;
        this.t = t;
        this.accessLevel = 0;
    }

    run(msg) {
        function jishoEmbed(keyword, result) {
            var embed = {
                "embed": {
                    "title": "Result for “" + keyword + "”",
                    "url": "http://jisho.org/search/" + encodeURIComponent(keyword),
                    "color": 5160000,
                    "timestamp": (new Date()).toISOString(),
                    "footer": {
                        "text": "Results provided by jisho.org"
                    },
                    "thumbnail": {
                        "url": "http://assets.jisho.org/assets/jisho-logo-v4@2x-7330091c079b9dd59601401b052b52e103978221c8fb6f5e22406d871fcc746a.png"
                    },
                    "author": {
                        "name": "Jisho",
                        "url": "http://jisho.org",
                        "icon_url": "http://assets.jisho.org/assets/jisho-logo-v4@2x-7330091c079b9dd59601401b052b52e103978221c8fb6f5e22406d871fcc746a.png"
                    },
                    "fields": [
                      {
                        "name": "",
                        "value": "(common word) *Noun*"
                      }
                    ]
                }
            };

            if ("word" in result["japanese"][0]) {
                embed["embed"]["fields"][0]["name"] = result["japanese"][0]["word"] + "【" + result["japanese"][0]["reading"] + "】";
            } else {
                embed["embed"]["fields"][0]["name"] = result["japanese"][0]["reading"];
            }
            return embed;
        }

        var index = 0;
        var desiredIndex = 1;

        var keyword = msg.content.split(' ');
        keyword.shift();

        desiredIndex = parseInt(keyword[0]);
        if (isNaN(desiredIndex)) {
            desiredIndex = 1;
        } else {
            keyword.shift();
        } 

        keyword = keyword.join(' ').trim();

        if (keyword === '') return msg.channel.createMessage(this.t('generic.empty-search', {lngs: msg.lang}));

        request.get('http://jisho.org/api/v1/search/words', {
            qs: {
                keyword: keyword
            }
        }, (error, response, body) => {
            if (error) {
                return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
            }
            if (!error && response.statusCode === 200) {
                try {
                    body = JSON.parse(body)["data"];
                } catch (e) {
                    return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}));
                }
                if (typeof body !== 'undefined') {
                    index = index + desiredIndex - 1;
                    if (body.length > 0 && index < body.length && index >= 0) {
                        msg.channel.createMessage(jishoEmbed(keyword, body[index]));
                        return;
                    }
                }

                msg.channel.createMessage(this.t('search.no-results', {lngs: msg.lang}));
            }
        });
    }
}
module.exports = Jisho;