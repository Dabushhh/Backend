const GAME_SERVER_IP = "62.219.106.76";
const GAME_SERVER_PORT = 8080;
const PLAYLIST = "playlist_defaultsolo";

import functions from "../utilities/structs/functions.js";
import { WebSocket } from "ws";

class matchmaker {

    static clients: number = 0;

    public async server(ws: WebSocket, req: any) {

        const ticketId = functions.MakeID();
        const matchId = functions.MakeID();
        const sessionId = functions.MakeID();

        Connecting();
        Waiting(matchmaker.clients);
        Queued(matchmaker.clients);
        matchmaker.clients++;
        SessionAssignment();
        Join();

        async function Connecting() {
            ws.send(
                JSON.stringify({
                    payload: {
                        state: "Connecting",
                    },
                    name: "StatusUpdate",
                }),
            );
        }

        async function Waiting(players: number) {
            ws.send(
                JSON.stringify({
                    payload: {
                        totalPlayers: players,
                        connectedPlayers: players,
                        state: "Waiting",
                    },
                    name: "StatusUpdate",
                }),
            );
        }

        async function Queued(players: number) {
            ws.send(
                JSON.stringify({
                    payload: {
                        ticketId: ticketId,
                        queuedPlayers: players,
                        estimatedWaitSec: 3,
                        status: {},
                        state: "Queued",
                    },
                    name: "StatusUpdate",
                }),
            );
        }

        async function SessionAssignment() {
            ws.send(
                JSON.stringify({
                    payload: {
                        matchId: matchId,
                        state: "SessionAssignment",
                    },
                    name: "StatusUpdate",
                }),
            );
        }

        async function Join() {
            ws.send(
                JSON.stringify({
                    payload: {
                        matchId: matchId,
                        sessionId: sessionId,
                        joinDelaySec: 1,
                        serverIp: GAME_SERVER_IP,
                        serverPort: GAME_SERVER_PORT,
                        playlist: PLAYLIST,
                        joinInfo: {
                            token: "dummy-join-token",
                            serverData: "dummy-server-data",
                        },
                    },
                    name: "Play",
                }),
            );
        }

    } // <-- closes server method

} // <-- closes class matchmaker

export default new matchmaker();
