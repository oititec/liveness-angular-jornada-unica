# Liveness Angular


##  Dependência 
* @angular/cli": "~8.3.20"
* crypto-js": "^3.1.9-1"
* ts-md5": "^1.2.7"
* webrtc-adapter": "^7.5.0"

## Credenciais
Altere as variaveis de ambiente do arquivo ***environment.ts***
```javascript
export const environment = {
  production: false,
  apiUrl: 'https://comercial.certiface.com.br',
  login: 'login',
  pass: 'senha'
};
```

## Install
```typescript
npm install
```

## Start
```typescript
ng serve
```

## Start HTTS
```
ng serve --ssl --host 192.168.0.9
```


## Teste
 http://localhost:4200/ 
