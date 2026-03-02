"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
var git_1 = require("../git/git");
var metrics_1 = require("../metrics/metrics");
var signals_1 = require("../signals/signals");
var profiles_1 = require("../profiles/profiles");
var scoring_1 = require("../scoring/scoring");
var anti_gaming_1 = require("../anti-gaming/anti-gaming");
var selection_1 = require("../selection/selection");
var confidence_1 = require("../confidence/confidence");
var report_1 = require("../report/report");
function runPipeline(repoUrl, token) {
    return __awaiter(this, void 0, void 0, function () {
        var report_2, error_1;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, git_1.withClonedRepo)(repoUrl, token, function (localPath) { return __awaiter(_this, void 0, void 0, function () {
                            var metrics_2, signals_2, profiles, activeProfiles, profilesToScore, candidates, selection_2, confidence, finalScore, winnerCandidate, winnerAntiGaming, innerError_1;
                            var _this = this;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, (0, metrics_1.extractRawMetrics)(localPath, repoUrl, token)];
                                    case 1:
                                        metrics_2 = _b.sent();
                                        signals_2 = (0, signals_1.deriveSignals)(metrics_2);
                                        profiles = (0, profiles_1.evaluateProfiles)(signals_2);
                                        activeProfiles = profiles.filter(function (p) { return p.status === 'active'; });
                                        profilesToScore = activeProfiles.length > 0 ? activeProfiles : profiles;
                                        return [4 /*yield*/, Promise.all(profilesToScore.map(function (profile) { return __awaiter(_this, void 0, void 0, function () {
                                                var score, antiGaming;
                                                return __generator(this, function (_a) {
                                                    score = (0, scoring_1.calculateScore)(metrics_2, profile.profileId);
                                                    antiGaming = (0, anti_gaming_1.detectGaming)(metrics_2, signals_2);
                                                    return [2 /*return*/, { profile: profile, score: score, antiGaming: antiGaming }];
                                                });
                                            }); }))];
                                    case 2:
                                        candidates = _b.sent();
                                        selection_2 = (0, selection_1.selectBestProfile)(candidates);
                                        confidence = (0, confidence_1.calculateConfidence)(metrics_2, selection_2);
                                        finalScore = (0, scoring_1.calculateScore)(metrics_2, selection_2.profileId);
                                        winnerCandidate = candidates.find(function (c) { return c.profile.profileId === selection_2.profileId; });
                                        winnerAntiGaming = (_a = winnerCandidate === null || winnerCandidate === void 0 ? void 0 : winnerCandidate.antiGaming) !== null && _a !== void 0 ? _a : { flags: [], flagCount: 0 };
                                        report_2 = (0, report_1.formatReport)(repoUrl, metrics_2, signals_2, selection_2, finalScore, winnerAntiGaming, confidence);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        innerError_1 = _b.sent();
                                        throw new Error("ANALYSIS_ERROR:".concat(innerError_1.message));
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _b.sent();
                    if (!report_2) {
                        throw new Error("ANALYSIS_ERROR:Report generation failed silently.");
                    }
                    return [2 /*return*/, {
                            success: true,
                            report: report_2
                        }];
                case 2:
                    error_1 = _b.sent();
                    if ((_a = error_1.message) === null || _a === void 0 ? void 0 : _a.startsWith('ANALYSIS_ERROR:')) {
                        return [2 /*return*/, {
                                success: false,
                                error: error_1.message.replace('ANALYSIS_ERROR:', ''),
                                stage: 'analysis'
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: error_1.message || 'Unknown error',
                            stage: 'clone'
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
