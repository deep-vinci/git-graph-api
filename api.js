import express from "express";
import { JSDOM } from "jsdom";
const app = express();

const fetchData = async (req, res, next) => {
    let username = req.params.user;

    const dataFetch = await fetch(
        `https://github.com/users/${username}/contributions`
    );
    const data = await dataFetch.text();

    req.fetchedData = data;

    next();
};

const parseData = (req, res, next) => {
    const doc = new JSDOM(req.fetchedData).window;

    let dataArr = [];
    doc.document.querySelectorAll("tr").forEach((e, i) => {
        if (i != 0) {
            dataArr[i - 1] = [];

            e.querySelectorAll("td").forEach((a, j) => {
                if (i == 0) return; // month names
                if (j == 0) return; // day names

                dataArr[i - 1][j - 1] = {
                    date: a.getAttribute("data-date"),
                    level: a.getAttribute("data-level"),
                };
            });
        }
    });

    console.log(dataArr);

    req.parsedData = dataArr;

    next();
};

app.get("/u/:user", fetchData, parseData, async (req, res) => {
    res.json(req.parsedData);
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});
