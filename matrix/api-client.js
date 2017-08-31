/* eslint-disable camelcase, no-use-before-define, no-invalid-this */
const lodash = require('lodash');
const Ramda = require('ramda');
const to = require('await-to-js').default;
const conf = require('../config');
const log = require('../utils/log.js')(module);

const api = {
    createRoom: client => (
        async function createRoom(options) {
            const [err, response] = await to(
                client.createRoom(Object.assign({visibility: 'private'}, options))
            );
            if (err) {
                log.error(`Error while creating room:\n ${err}`);
                return;
            }
            return response;
        }
    ),

    getRoomId: client => (
        async function getRoomId(alias) {
            const [err, response] = await to(
                client.getRoomIdForAlias(`#${alias}:${conf.matrix.domain}`)
            );
            if (err) {
                if (err.errcode !== 'M_NOT_FOUND') {
                    log.warn(
                        `Error while getting room id for ${alias} from Matrix:\n${err}`
                    );
                }
                return;
            }
            const {room_id} = response;
            return room_id;
        }
    ),

    getRoomByAlias: client => (
        async function getRoomByAlias(alias) {
            const roomID = await this.getRoomId(alias);
            if (!roomID) {
                return;
            }
            const room = client.getRoom(roomID);
            return room;
        }
    ),

    getRoomMembers: () => (
        async function getRoomMembers(roomAlias) {
            const room = await this.getRoomByAlias(roomAlias);
            if (!room) {
                return;
            }
            return lodash.values(room.currentState.members).map(member => member.userId);
        }
    ),

    invite: client => (
        async function invite(roomId, userId) {
            const [err, response] = await to(client.invite(roomId, userId));
            if (err) {
                log.error(`Error while inviting a new member to a room:\n ${err}`);
                return;
            }
            return response;
        }
    ),

    sendHtmlMessage: client => (
        async function sendHtmlMessage(roomId, body, htmlBody) {
            const [err] = await to(client.sendHtmlMessage(roomId, body, htmlBody));
            if (err) {
                log.error(`Error while sending message to a room:\n ${err}`);
            }
            return !err;
        }
    ),

    createAlias: client => (
        async function createAlias(alias, roomId) {
            const [err] = await to(client.createAlias(
                `#${alias}:${conf.matrix.domain}`,
                roomId
            ));
            if (err) {
                log.error(`Error while creating alias for a room:\n ${err}`);
            }
            return !err;
        }
    ),

    setRoomName: client => (
        async function setRoomName(roomId, name) {
            const [err] = await to(client.setRoomName(roomId, name));
            if (err) {
                log.error(`Error while setting room name:\n ${err}`);
            }
            return !err;
        }
    ),

    setRoomTopic: client => (
        async function setRoomTopic(roomId, topic) {
            const [err] = await to(client.setRoomTopic(roomId, topic));
            if (err) {
                log.error(`Error while setting room's topic:\n ${err}`);
            }
            return !err;
        }
    ),
};

module.exports = sdkConnect => (
    async function connect() {
        const matrixClient = await sdkConnect();
        if (!matrixClient) {
            return;
        }
        return Ramda.map(closer => closer(matrixClient))(api);
    }
);
