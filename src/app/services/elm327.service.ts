// Documentação dos comandos : https://en.wikipedia.org/wiki/OBD-II_PIDs
import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Injectable({
  providedIn: 'root'
})
export class Elm327Service {
  private deviceName: string = 'OBDII'; // Nome do dispositivo ELM327
  private connectedDeviceId: string = ''; // Alterado de null para ''
  public  bBlueToothEnable: boolean = false;
  public  bisConnected: boolean = false;
  public  responseElement: any;
  public  responseStatus: any;
  constructor(private bluetoothSerial: BluetoothSerial) { }

  list(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.list().then(
        devices => {
          resolve(devices);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  connect(deviceId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('Conexão com o Device Id : ',deviceId);
      this.bluetoothSerial.connect(deviceId).subscribe(
        peripheral => {
          //this.connectedDeviceId = peripheral.id;
          this.connectedDeviceId = deviceId;
          console.log('Conexão estabelecida com sucesso', peripheral);
          resolve(peripheral);
        },
        error => {
          console.log('Erro de conexao : ',error);
          console.error('Erro de conexao : ',error);
          reject(error);
        }
      );
    });
  }

  write(data: string): Promise<void> { // Adicione 'void' como o tipo de retorno
    return new Promise<void>((resolve, reject) => { // Adicione 'void' como o tipo de retorno
      //console.log('Comando recebido : ', data);
      if (!this.connectedDeviceId) {
        reject('Nenhum dispositivo conectado');
        return;
      }
        this.bluetoothSerial.write(data).then(
        () => {
          resolve(); // Remova os argumentos
          //console.log('Comando enviado com sucesso.');
        },
        error => {
          //console.log('Erro no envio do comando : ',error);
          reject(error);
        }
      );
    });
  }


  bytesToString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(result));
}

readWithTimeout(timeout: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!this.connectedDeviceId) {
      reject('Nenhum dispositivo conectado');
      return;
    }

    let response = '';
    let timeoutId: any = null;

    const subscription = this.bluetoothSerial.subscribeRawData().subscribe(
      data => {
        const chunk = this.bytesToString(data);
        response += chunk;
        // console.log('Chunk recebido:', chunk);

        if (chunk.includes('\r')) {
          console.log('Resposta completa recebida:', response);
          // Mostrar a resposta na tela (substitua 'responseElement' pelo elemento adequado do seu template HTML)
          response = response.replace('\r', '').trim();
          response = response.replace('>', '').trim();
          this.responseElement = response;
          this.responseStatus = 1;
          clearTimeout(timeoutId);
          timeoutId = null;
          setTimeout(() => {
            // Limpar a resposta após 2 segundos
            this.responseElement = '';
            subscription.unsubscribe();
          }, timeout);
          resolve(response);
        }
      },
      error => {
        console.error('Erro ao receber resposta do dispositivo:', error);
        clearTimeout(timeoutId);
        timeoutId = null;
        reject(error);
      }
    );

    timeoutId = setTimeout(() => {
      //console.warn('Timeout de leitura excedido');
      timeoutId = null;
      subscription.unsubscribe();
      this.responseStatus = 0;
      //reject('Timeout de leitura excedido');
    }, timeout);
  });
}

/***/

  async connectToElm327( comandos:any) {
    try {
      /* Validar que o bluetooth esa ligado, caso contrario solicita a ativacao */
      await this.bluetoothSerial.isEnabled().then(() => {
        console.log('Bluetooth esta ligado !');
        this.bBlueToothEnable = true;
      }).catch((err) => {
        console.log('Vou ligar o bluetooth');
        this.bluetoothSerial.enable().then(() => {
          console.log('Bluetooth foi ativado');
          this.bBlueToothEnable = true;
        }).catch((err) => {
          console.log('Bluetooth não esta ativo, verificar : ' + err);
        });
      });

      console.log('Procurando dispositivos pareados...');
      const devices = await this.list();

      const elm327Device = await devices.find((device: { name: string; }) => device.name === this.deviceName);
      if (!elm327Device) {
        console.error('Dispositivo ',name,' não encontrado');
        return;
      }

      console.log('Detalhe do dispositivo ',elm327Device.name,' : ', elm327Device);
      if ( !this.bisConnected  ){
        console.log(`Conectando ao dispositivo ${elm327Device.name} (${elm327Device.id})...`);
        const connectedDevice = await this.connect(elm327Device.id);
        // console.log(`Conectado ao dispositivo ${connectedDevice.name}`);
        this.bisConnected = true;
      }

      if (this.bisConnected && this.bBlueToothEnable){
        for (const command of comandos) {
          try {
            //console.log('Enviando comando ', command.comando);
            await this.write(command.comando + '\r');
            const response = await this.readWithTimeout(5000);
            command.valor_hex = this.responseElement;
            //command.status = this.responseStatus;
            console.log('Resposta do dispositivo para o comando (',command.comando,') : ', command.valor_hex);
          }catch{
            //command.Status = 0;
            console.log('Time Out de resposta do dispositivo para o comando (',command.comando,') : ', command.valor_hex);
          }
        }
      }
      // desconecta do dispositivo Bluetooth
      await this.bluetoothSerial.disconnect().then();
      console.log('Dispositivo desconectado !')
    } catch (error) {
      console.error('Erro:', error);
      this.bisConnected = false;
      await this.bluetoothSerial.disconnect().then();
      console.log('Dispositivo desconectado devido a erro no processo!')
      alert(error);
    }
  }

/****************************************************************************************************/
/*   Funcoes de conversao  */
/****************************************************************************************************/
  convert2Bytes(hexValue: string): number | null {
    hexValue = hexValue.replace(/\s/g, '');
    const hexPairs = hexValue.match(/.{1,2}/g);
    let retorno: any = 0;
    if (hexPairs && hexPairs[0] === '41' ) {
      retorno = (( parseInt(hexPairs[2] , 16) * 256 ) + parseInt(hexPairs[3], 16)) ;
    }
    return retorno;
  }

  convertPercentA(hexValue: string): number | null {
    hexValue = hexValue.replace(/\s/g, '');
    const hexPairs = hexValue.match(/.{1,2}/g);
    let retorno: any = 0;
    if (hexPairs && hexPairs[0] === '41' ) {
      retorno = ( parseInt(hexPairs[2] , 16) * 100 ) / 255;
    }
    return retorno;
  }

  bitDecoder(hexValue: string): number | null {
    hexValue = hexValue.replace(/\s/g, '');
    const hexPairs = hexValue.match(/.{1,2}/g);
    let retorno: any = 0;
    if (hexPairs && hexPairs[0] === '41' ) {
      retorno = parseInt(hexPairs[2] , 2);
    }
    return retorno;
  }


  convertEngineFuelRate(hexValue: string): number | null {
    hexValue = hexValue.replace(/\s/g, '');
    const hexPairs = hexValue.match(/.{1,2}/g);
    let retorno: any = 0;
    if (hexPairs && hexPairs[0] === '41' ) {
      retorno = (( parseInt(hexPairs[2] , 16) * 256 ) + parseInt(hexPairs[3], 16)) / 20 ;
    }
    return retorno;
  }

}

