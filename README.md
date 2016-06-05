# Basic Checkout

#### An Express / PayPal / Braintree checkout experiment.

Implements a basic checkout form in node.js using Express.js, and the PayPal and Braintree API libraries

## Getting started
 
1) npm install

2) Add variables to your .env file (or provide them on the command line).

Accepted environment variables:

- NODE_PORT the port to listen on, default 3000
- NODE_ENV development or production. Also affects payment gateway backend (sandbox or live)
- NODE_SESSION_KEY the session encryption key
- PAYPAL_ID The PayPal account ID
- PAYPAL_SECRET The PayPal secret key
- BRAINTREE_ID The braintree account ID
- BRAINTREE_PUBLIC The braintree public key
- BRAINTREE_PRIVATE The braintree private key
- BRAINTREE_ACCOUNT_CURRENCIES Mapping of currency to merchant account in JSON format (`{"currency1": "accountid1", "currency2": "accountid2"}`)

3) npm run start

## Linting 

#### npm run lint

Codebase should conform to AirBNB standards

## Testing

#### npm run test

Testing implemented with Mocha, Chai (for the assertions), Proxiquire (for pseudo-DI injection) and Sinai (for spies)

#### npm run coverage

Outputs a summary of test coverage to the console

#### npm run coverage-html

Opens an html coverage report in the browser. Only works on OS X

## License

(C) Hamish Friedlander. Distributable under the GPLv3.
