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
          reject(error);
        }
      );
    });
  }
/*
  read(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connectedDeviceId) {
        reject('Nenhum dispositivo conectado');
        return;
      }

      this.bluetoothSerial.read().then(
        data => {
          console.log('Data recebida : ',data);
          resolve(data);
        },
        error => {
          console.log('Erro de Leitura : ',error);
          reject(error);
        }
      );
    });
  }
*/

/***/
/*
bytesToString(bytes: number[]): string {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
    console.log('bytesToString (i) :',i,' (bytes[i]) :',bytes[i]);
  }
  console.log('Conversão de dados (Recebido) :',bytes,' (Retornado) :',result);
  return decodeURIComponent(escape(result));
}
*/

bytesToString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(result));
}


readWithTimeout_1(timeout: number): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    if (!this.connectedDeviceId) {
      reject('Nenhum dispositivo conectado');
      return;
    }

    let responseReceived = false;

    const subscription = this.bluetoothSerial.subscribeRawData().subscribe(
      data => {

        const response = this.bytesToString(data);
        console.log('Resposta do dispositivo(data):',data, ' Resposta convertida :', response);
        // Mostrar a resposta na tela (substitua 'responseElement' pelo elemento adequado do seu template HTML)
        this.responseElement = response;
        responseReceived = true;
        /*
        setTimeout(() => {
          // Limpar a resposta após 2 segundos
          this.responseElement = '';
          subscription.unsubscribe();
        }, timeout);
        */
        resolve(response);
      },
      error => {
        console.error('Erro ao receber resposta do dispositivo:', error);
        reject(error);
      }
    );

    setTimeout(() => {
      if (!responseReceived) {
        const timeoutError = 'Timeout de leitura excedido';
        //console.error(timeoutError);
        console.log(timeoutError);
        subscription.unsubscribe();
        reject(timeoutError);
      }
    }, timeout);
  });
}


/*
readWithTimeout(timeout: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!this.connectedDeviceId) {
      reject('Nenhum dispositivo conectado');
      return;
    }

    let response = '';

    const subscription = this.bluetoothSerial.subscribeRawData().subscribe(
      data => {
        const chunk = this.bytesToString(data);
        response += chunk;
        console.log('Chunk recebido:', chunk);

        if (chunk.includes('\r')) {
          console.log('Resposta completa recebida:', response);
          // Mostrar a resposta na tela (substitua 'responseElement' pelo elemento adequado do seu template HTML)
          this.responseElement = response;
          setTimeout(() => {
            // Limpar a resposta após 2 segundos
            this.responseElement = '';
            subscription.unsubscribe();
          }, 2000);
          resolve(response);
        }
      },
      error => {
        console.error('Erro ao receber resposta do dispositivo:', error);
        reject(error);
      }
    );

    setTimeout(() => {
      const timeoutError = 'Timeout de leitura excedido';
      console.error(timeoutError);
      subscription.unsubscribe();
      reject(timeoutError);
    }, timeout);
  });
}
*/
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
        console.log('Chunk recebido:', chunk);

        if (chunk.includes('\r')) {
          console.log('Resposta completa recebida:', response);
          // Mostrar a resposta na tela (substitua 'responseElement' pelo elemento adequado do seu template HTML)
          this.responseElement = response;
          clearTimeout(timeoutId);
          timeoutId = null;
          setTimeout(() => {
            // Limpar a resposta após 2 segundos
            this.responseElement = '';
            subscription.unsubscribe();
          }, 2000);
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
      console.warn('Timeout de leitura excedido');
      timeoutId = null;
      subscription.unsubscribe();
      reject('Timeout de leitura excedido');
    }, timeout);
  });
}


/***/

  write(data: string): Promise<void> { // Adicione 'void' como o tipo de retorno
    return new Promise<void>((resolve, reject) => { // Adicione 'void' como o tipo de retorno
      console.log('Comando recebido : ', data);
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
  async connectToElm327() {
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
        // Enviar comando ATZ para obter o nome do dispositivo
        console.log('Enviando comando ATI...');
        await this.write('ATI\r');

        // Ler a resposta do dispositivo
        //console.log('Lendo resposta do dispositivo...');
        //const response = await this.read();
        const response = await this.readWithTimeout(2000);
        //console.log('Resposta do dispositivo para o comando (ATI) : ', response);

        // Lista de comandos principais disponíveis no ELM327
        const commands = [
          'ATZ\r', // - Reset',
          'AT0\r' // - Get Device Info',
          // Adicione mais comandos aqui...
        ];

        console.log('Comandos Adicionais :');
        for (const command of commands) {
          await this.write(command);
          const response = await this.readWithTimeout(2000);
          // console.log('Resposta do comando (',command,'):', response);
          console.log('Resposta do dispositivo para o comando (',command,') : ', response);

        }
      }
      // desconecta do dispositivo Bluetooth
      await this.bluetoothSerial.disconnect().then();

    } catch (error) {
      console.error('Erro:', error);
      this.bisConnected = false;
      await this.bluetoothSerial.disconnect().then();
      alert(error);
    }
  }
}
