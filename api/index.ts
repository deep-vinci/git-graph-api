import express, { Request, Response, NextFunction } from "express";
import { JSDOM } from "jsdom";
const app = express();

interface ContributionCell {
    date: string | null;
    level: string | null;
}

type ParsedData = ContributionCell[][];

const fetchData = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

const parseData = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const doc = new JSDOM(req.fetchedData).window;

        // todo: also get tooltip textContent and get the number of contributions from it

        let parsedArr: ParsedData = [];
        doc.document.querySelectorAll("tr").forEach((e, i) => {
            if (i !== 0) {
                parsedArr[i - 1] = [];

                e.querySelectorAll("td").forEach((a, j) => {
                    if (j === 0) return;

                    parsedArr[i - 1][j - 1] = {
                        date: a.getAttribute("data-date"),
                        level: a.getAttribute("data-level"),
                    };
                });
            }
        });

        req.parsedDataRaw = parsedArr;
        next();
    } catch (error) {
        console.error("Error parsing data:", error);
        res.status(500).send("Failed to parse data.");
    }
};

const sequentializeData = (parsedArr: ParsedData): ContributionCell[] => {
    let sequentializedArr: ContributionCell[] = [];

    parsedArr[0].forEach((_, i) => {
        for (let j = 0; j < parsedArr.length; j++) {
            sequentializedArr.push(parsedArr[j][i]);
        }
    });

    return sequentializedArr;
};

const flattenData = (parsedArr: ParsedData): ContributionCell[] => {
    return parsedArr.flat();
};

app.get("/", (req: Request, res: Response): void => {
    res.json({
        version: "1.0",
        endpoints: [
            { method: "GET", path: "/", description: "This page" },
            {
                method: "GET",
                path: "/u/{id}",
                description: "Get user contribution by ID",
            },
        ],
    });
});

app.get(
    "/u/:user",
    fetchData,
    parseData,
    (req: Request, res: Response): void => {
        const sequence = req.query.sequence === "true";

        if (sequence) {
            const sequenced: ContributionCell[] = sequentializeData(
                req.parsedDataRaw
            );
            res.json(sequenced);
        } else {
            const flattened: ContributionCell[] = flattenData(
                req.parsedDataRaw
            );
            res.json(flattened);
        }
    }
);

app.listen(4000, () => {
    console.log("Server running on port 4000");
});

module.exports = app;
