import { Component } from '@angular/core';
import { Elm327Service } from '../services/elm327.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public strStatusBlue : any;
  public strStatusConn : any;
  public comandos = [
    { comando: 'ATE0',  status:0, resposta: '' }, // 0 -> Echo Off / 1 -> Echo On
    { comando: 'ATZ',   status:0, resposta: '' }, // Reseta o adaptador ELM327 para as configurações padrão.
    { comando: 'ATSP0', status:0, resposta: '' }, //  Definir protocolo para automático.
    { comando: 'ATI',   status:0, resposta: '' }, // Retorna informações sobre o adaptador ELM327, como versão de firmware e descrição.
    { comando: 'ATDP',  status:0, resposta: '' }, // Mostra o protocolo utilizado
    { comando: '0104',  status:0, resposta: '' }, //Mostra o protocolo utilizado
    { comando: '0105',  status:0, resposta: '' }, // Temperatura do líquido de arrefecimento
    { comando: '010B',  status:0, resposta: '' }, // Pressão no coletor de admissão
    { comando: '010C',  status:0, resposta: '' }, //  Rotação atual do motor
    { comando: '010D',  status:0, resposta: '' }, // Velocidade instantânea do veiculo
    { comando: '010E',  status:0, resposta: '' }, // Avanço do ângulo de ignição
    { comando: '010F',  status:0, resposta: '' }, // Temperatura do Ar
    { comando: '0111',  status:0, resposta: '' }, // Posição da válvula borboleta - TPS
    { comando: '03',    status:0, resposta: '' }, // DTC – Sem DTC (erros armazenados)

    { comando: 'ATRV',  status:0, resposta: '' }, // Tensao da bateria
    { comando: '0121',  status:0, resposta: '' }, // Odometro Milhas
    { comando: '0131',  status:0, resposta: '' }, // Odometro KM
    { comando: '012F',  status:0, resposta: '' }, // Nivel combustivel %

    { comando: '0105',  status:0, resposta: '' }, // Temperatura do Motor
    { comando: '015E',  status:0, resposta: '' } // Consumo instantaneo
  ];

  constructor(private elm327Service: Elm327Service) {}

  async connectToElm327(  ) {
    await this.elm327Service.connectToElm327(this.comandos);
    //await this.elm327Service.connectToElm327();
    if ( this.elm327Service.bisConnected ) {
      this.strStatusConn = 'Conectado';
    }else{
      this.strStatusConn = 'Desconectado';
    }
    if ( this.elm327Service.bBlueToothEnable){
      this.strStatusBlue = 'Ativo';
    }else{
      this.strStatusBlue = 'Desligado';
    }
  }
}
