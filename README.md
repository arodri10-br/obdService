ionic start Elm327_V0 blank
cd Elm327_V0
code .
ionic generate service services/Elm327
npm install @ionic-native/bluetooth-serial
npm install cordova-plugin-bluetooth-serial
npm install @ionic-native/core

npm install @capacitor/android
npx cap add android

Abra o arquivo AndroidManifest.xml localizado em android/app/src/main/AndroidManifest.xml.
Dentro da tag <manifest>, adicione a permissão android.permission.BLUETOOTH_CONNECT usando o seguinte código:
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
Salve o arquivo AndroidManifest.xml e feche-o.
Certifique-se de reconstruir o aplicativo usando o comando ionic capacitor build android para aplicar as alterações no arquivo AndroidManifest.xml ao seu projeto Android.

Gerar os arquivos de build do android
ionic capacitor build android

Para executar no celular : 
ionic capacitor run android

Para ver o console do que esta executando no celular
chrome://inspect/#devices

Carregar no Git
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/arodri10-br/obdService.git
git push -u origin main

