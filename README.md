ionic start Elm327_V0 blank
cd Elm327_V0
code .
ionic generate service services/Elm327







npm install @ionic-native/ble
npm install @ionic-native/core

ionic cordova plugin add cordova-plugin-ble-central

npm install @capacitor/android
npm install cordova-plugin-ble-central

npx cap add android

Gerar os arquivos de build do android
ionic capacitor build android

Para executar no celular : 
ionic capacitor run android

Para ver o console do que esta executando no celular
chrome://inspect/#devices
