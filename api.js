import express from "express";
import { JSDOM } from "jsdom";
const app = express();

const fetchData = async (req, res, next) => {
    try {
        let username = req.params.user;

        const dataFetch = await fetch(
            `https://github.com/users/${username}/contributions`
        );
        const data = await dataFetch.text();

        req.fetchedData = data;
        next();
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Failed to fetch data.");
    }
};

const parseData = (req, res, next) => {
    try {
        const doc = new JSDOM(req.fetchedData).window;

        let parsedArr = [];
        doc.document.querySelectorAll("tr").forEach((e, i) => {
            if (i !== 0) {
                parsedArr[i - 1] = [];

                e.querySelectorAll("td").forEach((a, j) => {
                    if (j === 0) return; // skip day names

                    parsedArr[i - 1][j - 1] = {
                        date: a.getAttribute("data-date"),
                        level: a.getAttribute("data-level"),
                    };
                });
            }
        });

        req.parsedDataRaw = parsedArr; // store raw parsed data
        next();
    } catch (error) {
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
    } else {
        const flattened = flattenData(req.parsedDataRaw);
        res.json(flattened);
    }
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});
