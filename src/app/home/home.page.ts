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
    { comando: 'ATZ', resposta: '' }, // Reseta o adaptador ELM327 para as configurações padrão.
    { comando: 'ATI', resposta: '' }, // Retorna informações sobre o adaptador ELM327, como versão de firmware e descrição.
    { comando: 'AT@1', resposta: '' }, // Retorna a descrição da interface do adaptador ELM327.
    { comando: 'AT@2', resposta: '' }, // Retorna o endereço MAC do adaptador ELM327 (se suportado).
    { comando: 'AT@3', resposta: '' } // Retorna o nome do dispositivo Bluetooth do adaptador ELM327 (se suportado).
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
