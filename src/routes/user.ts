import express, { Request } from "express";
const app = express.Router();

import error from "../utilities/structs/error.js";

import { verifyToken } from "../tokenManager/tokenVerify.js";
import User from "../model/user.js";

app.get("/account/api/public/account", async (req, res) => {
    let response:Object[] = [];

    if (typeof req.query.accountId == "string") {
        let user = await User.findOne({ accountId: req.query.accountId, banned: false }).lean();

        if (user) {
            response.push({
                id: user.accountId,
                displayName: user.username,
                externalAuths: {}
            });
        }
    }

    if (Array.isArray(req.query.accountId)) {
        let users = await User.find({ accountId: { $in: req.query.accountId }, banned: false }).lean();

        if (users) {
            for (let user of users) {
                if (response.length >= 100) break;
                
                response.push({
                    id: user.accountId,
                    displayName: user.username,
                    externalAuths: {}
                });
            }
        }
    }

    res.json(response);
});

app.get("/account/api/public/account/displayName/:displayName", async (req, res) => {
    let user = await User.findOne({ username_lower: req.params.displayName.toLowerCase(), banned: false }).lean();
    if (!user) return error.createError(
        "errors.com.epicgames.account.account_not_found",
        `Sorry, we couldn't find an account for ${req.params.displayName}`, 
        [req.params.displayName], 18007, undefined, 404, res
    );
    
    res.json({
        id: user.accountId,
        displayName: user.username,
        externalAuths: {}
    });
});

app.get("/persona/api/public/account/lookup", async (req, res) => {
    if (typeof req.query.q != "string" || !req.query.q) return error.createError(
        "errors.com.epicgames.bad_request",
        "Required String parameter 'q' is invalid or not present", 
        undefined, 1001, undefined, 400, res
    );

    let user = await User.findOne({ username_lower: req.query.q.toLowerCase(), banned: false }).lean();
    if (!user) return error.createError(
        "errors.com.epicgames.account.account_not_found",
        `Sorry, we couldn't find an account for ${req.query.q}`, 
        [req.query.q], 18007, undefined, 404, res
    );
    
    res.json({
        id: user.accountId,
        displayName: user.username,
        externalAuths: {}
    });
});

app.get("/api/v1/search/:accountId", async (req, res) => {
    let response:Object[] = [];

    if (typeof req.query.prefix != "string" || !req.query.prefix) return error.createError(
        "errors.com.epicgames.bad_request",
        "Required String parameter 'prefix' is invalid or not present", 
        undefined, 1001, undefined, 400, res
    );

    let users = await User.find({ username_lower: new RegExp(`^${req.query.prefix.toLowerCase()}`), banned: false }).lean();

    for (let user of users) {
        if (response.length >= 100) break;

        response.push({
            accountId: user.accountId,
            matches: [
                {
                    "value": user.username,
                    "platform": "epic"
                }
            ],
            matchType: req.query.prefix.toLowerCase() == user.username_lower ? "exact" : "prefix",
            epicMutuals: 0,
            sortPosition: response.length
        });
    }
    
    res.json(response);
});

app.get("/account/api/public/account/:accountId", verifyToken, (req: any, res) => {
    res.json({
        id: req.user.accountId,
        displayName: req.user.username,
        name: "Lawin",
        email: `[hidden]@${req.user.email.split("@")[1]}`,
        failedLoginAttempts: 0,
        lastLogin: new Date().toISOString(),
        numberOfDisplayNameChanges: 0,
        ageGroup: "UNKNOWN",
        headless: false,
        country: "US",
        lastName: "Server",
        preferredLanguage: "en",
        canUpdateDisplayName: false,
        tfaEnabled: false,
        emailVerified: true,
        minorVerified: false,
        minorStatus: "NOT_MINOR",
        cabinedMode: false,
        hasHashedEmail: false
    });
});

app.get("/account/api/public/account/*/externalAuths", (req, res) => {
    res.json([]);
});

app.get("/sdk/v1/*", (req, res) => {
    const sdk = require("./../responses/sdkv1.json");
    res.json(sdk);
})

app.get("/epic/id/v2/sdk/accounts", async (req, res) => {
    let user = await User.findOne({ accountId: req.query.accountId, banned: false }).lean();
    if (!user) return error.createError(
        "errors.com.epicgames.account.account_not_found",
        `Sorry, we couldn't find an account for ${req.query.accountId}`, 
        [req.query.accountId], 18007, undefined, 404, res
    );
    res.json([{
        accountId: user.accountId,
        displayName: user.username,
        preferredLanguage: "en",
        cabinedMode: false,
        empty: false
    }]);
})

app.get('/fortnite/api/game/v2/profile/:accountId/client/QueryProfile', (req, res) => {
  res.json({
    profileRevision: 1,
    profileId: 'athena',
    profileChangesBaseRevision: 1,
    profileChanges: [],
    profileCommandRevision: 1,
    serverTime: new Date().toISOString(),
    responseVersion: 1
  });
});

app.get('/api/v1/playlists', (req, res) => {
  res.json({
    playlists: [
      { name: "playlist_defaultsolo", status: "ACTIVE" },
      { name: "playlist_defaultsquad", status: "ACTIVE" }
    ]
  });
});

// User settings (POST /api/v1/user/setting)
app.post('/api/v1/user/setting', (req, res) => {
  res.json({ status: 'success' });
});

// Content controls (GET /content-controls/:id)
app.get('/content-controls/:id', (req, res) => {
  res.json({ data: {} });
});

// Presence subscriptions (GET /presence/api/v1/_/:id/settings/subscriptions)
app.get('/presence/api/v1/_/:id/settings/subscriptions', (req, res) => {
  res.json({ subscriptions: [] });
});

// Presence last online (GET /presence/api/v1/_/:id/last-online)
app.get('/presence/api/v1/_/:id/last-online', (req, res) => {
  res.json({ lastOnline: new Date().toISOString() });
});

// Friends recent Fortnite (GET /friends/api/v1/:id/recent/fortnite)
app.get('/friends/api/v1/:id/recent/fortnite', (req, res) => {
  res.json({ recent: [] });
});

// Fortnite privacy account (GET /fortnite/api/game/v2/privacy/account/:id)
app.get('/fortnite/api/game/v2/privacy/account/:id', (req, res) => {
  res.json({ privacy: { isPrivate: false } });
});

// API v1 Fortnite get (GET /api/v1/Fortnite/get)
app.get('/api/v1/Fortnite/get', (req, res) => {
  res.json({});
});


app.all("/v1/epic-settings/public/users/*/values", (req, res) => {
    res.json({});
})



export default app;