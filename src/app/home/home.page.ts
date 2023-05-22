import { Component } from '@angular/core';
import { Elm327Service } from '../services/elm327.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public strStatusBlue: any;
  public strStatusConn: any;
  hexValue = '';
  convertedTemperature: number | null = null;

  convert() {
    this.convertedTemperature = this.convertAirTemperature(this.hexValue);
  }

  convertAirTemperature(hexValue: string): number | null {
    hexValue = hexValue.replace(/\s/g, '');
    const hexPairs = hexValue.match(/.{1,2}/g);

    if (hexPairs && hexPairs[0] === '41' && hexPairs[1] === '0E' && hexPairs.length === 4) {
      const temperature = parseInt(hexPairs[2], 16) - 40;

      console.log('Temperatura convertida : ', temperature);
      return temperature;
    }

    return null;
  }
  public comandos = [
    {
      "id_medida": "1",
      "ordem": "1",
      "Status": "A",
      "comando": "ATE0",
      "valor_hex": null,
      "valor_texto": null,
      "nome_medida": "Echo on/off",
      "desc_medida": "Echo on/off",
      "tamanho_medida": "1",
      "fnc_conversao": null,
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "0"
  },
  {
      "id_medida": "2",
      "ordem": "2",
      "Status": "A",
      "comando": "ATZ",
      "valor_hex": null,
      "valor_texto": null,
      "nome_medida": "Reset",
      "desc_medida": "Reset",
      "tamanho_medida": "1",
      "fnc_conversao": null,
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "0"
  },
  {
      "id_medida": "3",
      "ordem": "3",
      "Status": "A",
      "comando": "ATSP0",
      "valor_hex": null,
      "valor_texto": null,
      "nome_medida": "Def. Protocolo",
      "desc_medida": "Def. Protocolo",
      "tamanho_medida": "1",
      "fnc_conversao": null,
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "0"
  },
  {
      "id_medida": "4",
      "ordem": "4",
      "Status": "A",
      "comando": "ATI",
      "valor_hex": null,
      "valor_texto": null,
      "nome_medida": "Adaptador",
      "desc_medida": "Adaptador / versao",
      "tamanho_medida": "1",
      "fnc_conversao": null,
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "0"
  },
  {
      "id_medida": "5",
      "ordem": "5",
      "Status": "A",
      "comando": "ATDP",
      "valor_hex": null,
      "valor_texto": null,
      "nome_medida": "Protocolo",
      "desc_medida": "Protocolo",
      "tamanho_medida": "1",
      "fnc_conversao": null,
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "0"
  },
  {
      "id_medida": "134",
      "ordem": "39",
      "Status": "A",
      "comando": "0121",
      "valor_hex": '41 21 00 00',
      "valor_texto": null,
      "nome_medida": "mil_dist",
      "desc_medida": "Distance Travelled While MIL is Activated",
      "tamanho_medida": "2",
      "fnc_conversao": "convert2Bytes",
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "65535"
  },
  {
      "id_medida": "150",
      "ordem": "55",
      "Status": "A",
      "comando": "0131",
      "valor_hex": '41 31 13 63',
      "valor_texto": null,
      "nome_medida": "clr_dist",
      "desc_medida": "Distance since diagnostic trouble codes cleared",
      "tamanho_medida": "2",
      "fnc_conversao": "convert2Bytes",
      "unidade_medida": null,
      "sigla_medida": null,
      "min": "0",
      "max": "65535"
  }
];

  constructor(private storage: Storage, private platform: Platform, private elm327Service: Elm327Service) {
    this.platform.ready().then(() => {
      this.storage.create();
    });
  }

  async saveComandos() {
    console.log('Salvar comandos : ', this.comandos);
    this.storage.set('comandos', this.comandos);
  }

  async getComandos() {
    this.comandos = await this.storage.get('comandos');
    console.log('Restaurar comandos : ', this.comandos);
  }

  async converte(){
    for (const command of this.comandos) {
        if (command.fnc_conversao !== null) {
          try {
            //           comando.esperado = (this as any)[comando.funcao](comando.leitura);
            command.valor_texto = (this as any).elm327Service.fnc_conversao( command.valor_hex );
            //command.valor_texto = command.fnc_conversao( valor_hex );
          }catch (error){
            console.log('Erro de conversao ',command.comando,', pela funcao : ', command.fnc_conversao, '(', command.valor_hex,') \n Erro :', error);
          }
        }
    }
  }

  async connectToElm327() {
    await this.elm327Service.connectToElm327(this.comandos);

    //await this.elm327Service.connectToElm327();
    if (this.elm327Service.bisConnected) {
      this.strStatusConn = 'Conectado';
    } else {
      this.strStatusConn = 'Desconectado';
    }
    if (this.elm327Service.bBlueToothEnable) {
      this.strStatusBlue = 'Ativo';
    } else {
      this.strStatusBlue = 'Desligado';
    }
  }

}
