"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReport = formatReport;
function sanitizeForJson(value) {
    if (typeof value === 'function' || typeof value === 'symbol') {
        return undefined; // Handled by object iteration to be removed
    }
    if (typeof value === 'bigint') {
        return Number(value);
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'number') {
        if (Number.isNaN(value) || !Number.isFinite(value)) {
            return 0;
        }
        return value;
    }
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }
    if (Array.isArray(value)) {
        var arr = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var item = value_1[_i];
            var sanitized = sanitizeForJson(item);
            if (sanitized !== undefined) {
                arr.push(sanitized);
            }
            else {
                arr.push(null); // Arrays keep their length, usually stringify turns undefined to null in arrays
            }
        }
        return arr;
    }
    if (typeof value === 'object') {
        var obj = {};
        for (var key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                var val = value[key];
                var sanitized = sanitizeForJson(val);
                if (sanitized !== undefined) {
                    obj[key] = sanitized;
                }
            }
        }
        return obj;
    }
    return undefined;
}
function deepFreeze(obj) {
    Object.freeze(obj);
    if (obj === undefined || obj === null)
        return obj;
    Object.getOwnPropertyNames(obj).forEach(function (prop) {
        var value = obj[prop];
        if (value && typeof value === "object" && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return obj;
}
function formatReport(repoUrl, metrics, signals, selection, scoreReport, antiGaming, confidence, options) {
    var reportUnsanitized = {
        version: "1.0.0",
        timestamp: (options === null || options === void 0 ? void 0 : options.timestamp) || new Date().toISOString(),
        repoUrl: repoUrl,
        summary: {
            profileId: selection.profileId,
            displayName: selection.displayName,
            overallScore: Math.round(scoreReport.overallScore),
            confidenceLevel: confidence.level,
            reliabilityLevel: selection.reliabilityLevel,
        },
        details: {
            dimensions: scoreReport,
            confidence: confidence,
            antiGaming: antiGaming,
            signals: signals,
            metrics: metrics,
        }
    };
    var sanitizedReport = sanitizeForJson(reportUnsanitized);
    return deepFreeze(sanitizedReport);
}
