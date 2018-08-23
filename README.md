# Saftladen Dashboard

## Repo Structure

### API-Server

_(lives on the raspberry pi)_

Node Server based on fastify and graphql.

- Provides access to the Database.
- Performs crawling tasks for whatever we tell it to (twitter followers, steam active players, internal api-calls).
- Provides authorisation via Slack

### DB

_(lives on the raspberry pi)_

Postgres 9.6 DB

### Web Interface

_(deployed as flat files, living somewhere in the cloud.)_

Two Parts:

#### Dashboard

- Publicly accessible via dashboard.saftladen.berlin.
- Authorised people will be able to see all information, non-authorised people only public information
- Based on a 4x3 grid.
- Various content types: Images, Videos, Countdowns, Slack-Channel-integration, Charts
- Each element gets a placement-score including a decay-value. So different elements can have different characteristics: low score - no decay, medium score - slowly decreasing, massive score - quickly decreasing.
- The higher an element's placement score, the bigger the element on the dashboard (e.g. a countdown will have a massive score while it's counting, potentially displacing some low-score elements.)
- A placement algorithm dynamically places and sizes elements in the grid on the dashboard based on their current scores

#### Admin Interface

- Accessible via dashboard.saftladen.berlin/admin for logged in members (authorisation via the Saftladen Slack account)
- People will be able to create and manage all kinds of elements and assign their score characteristcs and whether it's public information or not.
- Dedicated section to setup web-crawler tasks. You can define url, headers, parameters, etc and the api will regularly call this endpoint. (E.g. steam api, google analytics, twitter api). Based on that information we'll be able to create time series for all (numerical) data and display it.
