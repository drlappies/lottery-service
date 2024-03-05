## Lottery System

#### Starting it locally
1. docker-compose up -d
2. yarn start:dev

#### User Story

- There is no UI mockup/user story so I imagine the web application to be like:
- User can navigate to an index page and that index page would GET /lottery for the current lottery game
- There is a button for the user to buy a ticket and it would POST /lottery/:id/join, where the :id can be retrieved from the GET /lottery
- There should be a listing of previous lotteries results from GET /lottery paginated
- There should be a page for the user to check the result of any lottery so it should be using GET /lottery/:id for that specific game
- There should be a page for the user to check if the ticket is a winner ticket in any lottery

#### Design

- Postgres to store previous lottery results and tickets
- Redis to store the current lottery ticket pool; for using SCARD/SRANDMEMBER commands to retrieve ticket counts and get a random ticket from the pool

#### Limitation

- There should be a user model and proper authentication so we know which ticket belongs to which user.
- Tickets are supposed to have an encryption/signature so in case we are printing/ issuing tickets in real form.
- There is no way to gracefully/properly pause the lottery loop/ shutdown the entire game.
