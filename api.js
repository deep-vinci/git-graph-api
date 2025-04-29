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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsdom_1 = require("jsdom");
const app = (0, express_1.default)();
const fetchData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let username = req.params.user;
        const dataFetch = yield fetch(`https://github.com/users/${username}/contributions`);
        const data = yield dataFetch.text();
        req.fetchedData = data;
        next();
    }
    catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Failed to fetch data.");
    }
});
const parseData = (req, res, next) => {
    try {
        const doc = new jsdom_1.JSDOM(req.fetchedData).window;
        let parsedArr = [];
        doc.document.querySelectorAll("tr").forEach((e, i) => {
            if (i !== 0) {
                parsedArr[i - 1] = [];
                e.querySelectorAll("td").forEach((a, j) => {
                    if (j === 0)
                        return;
                    parsedArr[i - 1][j - 1] = {
                        date: a.getAttribute("data-date"),
                        level: a.getAttribute("data-level"),
                    };
                });
            }
        });
        req.parsedDataRaw = parsedArr;
        next();
    }
    catch (error) {
        console.error("Error parsing data:", error);
        res.status(500).send("Failed to parse data.");
    }
};
const sequentializeData = (parsedArr) => {
    let sequentializedArr = [];
    parsedArr[0].forEach((_, i) => {
        for (let j = 0; j < parsedArr.length; j++) {
            sequentializedArr.push(parsedArr[j][i]);
        }
    });
    return sequentializedArr;
};
const flattenData = (parsedArr) => {
    return parsedArr.flat();
};
app.get("/u/:user", fetchData, parseData, (req, res) => {
    const sequence = req.query.sequence === "true";
    if (sequence) {
        const sequenced = sequentializeData(req.parsedDataRaw);
        res.json(sequenced);
    }
    else {
        const flattened = flattenData(req.parsedDataRaw);
        res.json(flattened);
    }
});
app.listen(4000, () => {
    console.log("Server running on port 4000");
});
