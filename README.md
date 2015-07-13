# Markov Twitter Speaker
##Config example
Create a file named 'config.js' and paste this code:
```javascript
module.exports = {
  twitter: {
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
  },

  autoFollow: true,
  autoRetweet: true,

  markov: {
    enabled: true,
    separator: " ",
    order: 2
  },

  lang: 'es, en'
}
```