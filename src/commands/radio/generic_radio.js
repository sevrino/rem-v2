let Command = require('../../structures/command');
let _ = require("lodash");
let Radio = require('../../structures/radio');
let SongTypes = require('../../structures/constants').SONG_TYPES;
let urlParser = require("url");
/**
 * The addRadioToQueueCommand
 * @extends Command
 *
 */
class AddGenericRadioToQueue extends Command {
    /**
     * Create the command
     * @param {Function} t - the translation module
     * @param {Object} v - the voice manager
     * @param mod
     */
    constructor({t, v, mod}) {
        super();
        this.cmd = 'genericradio';
        this.cat = 'radio';
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.r = mod.getMod('raven');
        this.accessLevel = 0;
    }

    async run(msg) {
        let streamUrl = msg.content.split(' ').splice(1);
        if (streamUrl.length === 0) {
          return msg.channel.createMessage(this.t('radio.need_url', {lngs: msg.lang}))
        }
        let parsedUrl = urlParser.parse(streamUrl[0]);
        console.error(parsedUrl.href);
        console.error(parsedUrl.hostname);
        let msgSplit = msg.content.split(' ').splice(2, 1);
        let options = this.checkOptions(msgSplit);
        let radio = new Radio({
            id: `radio_${Date.now()}`,
            type: SongTypes.radio,
            title: parsedUrl.hostname,
            url: 'http://' + parsedUrl.hostname + '/',
            needsResolve: false,
            local: false,
            duration: 'live',
            streamUrl: parsedUrl.href,
            live: true,
            needsYtdl: false,
            isOpus: false,
            radio: parsedUrl.hostname
        });
        try {
            let res = await this.v.addRadioToQueue(msg, radio, options.instant, options.next);
            if (options.next) return msg.channel.createMessage(this.t('play.next', {
                song: res.title,
                lngs: msg.lang,
                user: `${msg.author.username}#${msg.author.discriminator}`
            }));
            if (options.instant) {
                return msg.channel.createMessage(this.t('play.success', {
                    song: res.title,
                    lngs: msg.lang,
                    user: `${msg.author.username}#${msg.author.discriminator}`
                }));
            }
            msg.channel.createMessage(this.t('qa.success', {song: res.title, lngs: msg.lang, user: res.queuedBy}));
        } catch (e) {
            if (e.t) {
                return msg.channel.createMessage(this.t(e.t, {lngs: msg.lang}));
            }
            return msg.channel.createMessage(this.t('generic.error', {lngs: msg.lang}))
        }
    }

    checkOptions(msgSplit) {
        let next = false;
        let instant = false;
        let index = _.indexOf(msgSplit, '-next');
        if (index > -1) {
            next = true;
        }
        index = _.indexOf(msgSplit, '-play');
        if (index > -1) {
            instant = true;
        }
        return {next, instant};
    }
}
module.exports = AddGenericRadioToQueue;
