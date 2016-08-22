# twitsisbra
Twitsisbra - Detecção de terremotos através da Rede Social Twitter

Este trabalho traz em um mapa de calor informações de tweets postados com informações sobre desastres sísmicos.

Toda a lógica se encontra no arquivo server.js

Para utilizar é necessário se registrar no Twitter e fornecer as seguintes credenciais que podem ser cadastradas na página https://apps.twitter.com/

//Setup twitter stream api
var twit = new twitter({
  consumer_key: 'YOUR CONSUMER KEY',
  consumer_secret: 'YOUR CONSUMER SECRET',
  access_token_key: 'YOUR ACCESS TOKEN KEY',
  access_token_secret: 'YOUR ACCESS TOKEN SECRET'
}),

Na pasta onde o projeto for clonado é necessario usar

npm install

Para instalar as depêndencias do sistema

