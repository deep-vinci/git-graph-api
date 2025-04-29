# GitHub Contributions Data API

This API fetches and parses GitHub user contribution data. It provides two formats: flattened and sequentialized.

## Endpoints

### `GET /u/:user`

Fetches and processes contribution data for a GitHub user.

#### Parameters:

-   `user`: GitHub username.
-   `sequence`: Optional. Set to `"true"` to get sequentialized data. Defaults to flattened format.

#### Example Requests:

-   `GET /u/octocat`
-   `GET /u/octocat?sequence=true`

#### Responses:

-   **200**: JSON array of contribution data.
-   **500**: Error fetching or parsing data.

## How It Works

1. Fetch raw HTML from the user's GitHub contributions page.
2. Parse data using JSDOM to extract dates and contribution levels.
3. Return data either in flattened or sequentialized format.

## Example Response

```json
[
    {
        "date": "2025-04-01",
        "level": "1"
    },
    {
        "date": "2025-04-02",
        "level": "2"
    }
]
```

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/github-contributions-api.git
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run the server:

    ```bash
    npm start
    ```

Server runs at `http://localhost:4000`.

## Requirements

-   Node.js
-   TypeScript
-   express
-   jsdom

## License

MIT License.
