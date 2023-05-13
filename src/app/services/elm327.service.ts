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

  read(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connectedDeviceId) {
        reject('Nenhum dispositivo conectado');
        return;
      }

      this.bluetoothSerial.read().then(
        data => {
          resolve(data);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  write(data: string): Promise<void> { // Adicione 'void' como o tipo de retorno
    return new Promise<void>((resolve, reject) => { // Adicione 'void' como o tipo de retorno
      if (!this.connectedDeviceId) {
        reject('Nenhum dispositivo conectado');
        return;
      }
        this.bluetoothSerial.write(data).then(
        () => {
          resolve(); // Remova os argumentos
        },
        error => {
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
        console.log(`Conectado ao dispositivo ${connectedDevice.name}`);
        this.bisConnected = true;
      }

      if (this.bisConnected && this.bBlueToothEnable){
        // Enviar comando ATZ para obter o nome do dispositivo
        console.log('Enviando comando ATZ...');
        await this.write('ATZ\r');

        // Ler a resposta do dispositivo
        console.log('Lendo resposta do dispositivo...');
        const response = await this.read();
        console.log('Resposta:', response);

        // Lista de comandos principais disponíveis no ELM327
        const commands = [
          'ATZ - Reset',
          'ATI - Get Device Info',
          // Adicione mais comandos aqui...
        ];

        console.log('Comandos disponíveis:');
        for (const command of commands) {
          console.log(command);
        }
      }
      // desconecta do dispositivo Bluetooth
      await this.bluetoothSerial.disconnect().then();

    } catch (error) {
      alert(error);
      console.error('Erro:', error);
      this.bisConnected = false;
      await this.bluetoothSerial.disconnect().then();
    }
  }
}
