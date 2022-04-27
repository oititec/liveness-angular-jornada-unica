import { MessageService } from '../../services/message.service';
import { Router } from "@angular/router";
import { AngularSampleApp } from "./../../../assets/angular-sample-controller";
import { Component, NgZone, OnInit } from "@angular/core";
import { FacecaptchaBackendService } from "../../backend/facecaptcha-backend.service";
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Crypto } from 'src/assets/utilities/Crypto';

@Component({
  selector: "app-facetec",
  templateUrl: "./facetec.component.html",
  styleUrls: ["./facetec.component.css"],
})
export class FacetecComponent implements OnInit {
  cliente = {
		cpf: '32557231835',
		nome: 'Nome Sobrenome',
		nascimento: '01/01/2001'
	};

  subscription: Subscription;
  appkey: any;
  
  constructor(
    private zone: NgZone,
    private router: Router,
    private faceCaptchaBackendService: FacecaptchaBackendService) {}

  ngOnInit() {    
    this.faceCaptchaBackendService.gerarAppkey(this.cliente).subscribe((resp: any) => {
      
      this.appkey = resp.body.appkey;
      AngularSampleApp.setAppkey(this.appkey);
      
      this.faceCaptchaBackendService.getProductionKey(this.appkey, 'web').subscribe((resp:any) => {
        environment.ProductionKeyText = JSON.parse(Crypto.decChData(resp, this.appkey)).productionKey;        
        AngularSampleApp.loadAssets();
      });

    });
  }

  // Perform Liveness Check.
  onLivenessCheckPressed() {
    AngularSampleApp.onLivenessCheckPressed();
    this.subscription = MessageService.getMessage().subscribe((message: boolean) => {
      if (message) {
        this.zone.run(() => {
          this.router.navigate(['/send-document'], {queryParams: {"appKey": this.appkey}, skipLocationChange: true})
        });
      } else {
        console.error('Liveness nao finalizado corretamente');
      }
    });
  }

  voltar() {
    this.router.navigateByUrl("").catch();
  }

}
