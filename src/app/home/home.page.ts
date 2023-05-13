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

  constructor(private elm327Service: Elm327Service) {}

  async connectToElm327() {
    await this.elm327Service.connectToElm327();
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
  async direct_conect(){
    await this.elm327Service.connect('00:00:00:33:33:33');
  }
}
