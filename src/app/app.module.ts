import { FacetecComponent } from './views/facetec/facetec.component';
import { MenuComponent } from './views/menu/menu.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FacecaptchaService } from './services/facecaptcha.service';
import { HttpClientModule } from '@angular/common/http';
import { FacecaptchaBackendService } from './backend/facecaptcha-backend.service';
import { AppRoutingModule } from './app-routing.module';
import { SendDocumentComponent } from './views/send-document/send-document.component';
import { LivenessComponent } from './views/liveness/liveness.component';
import { NotifierModule, NotifierOptions } from 'angular-notifier';

const customNotifierOptions: NotifierOptions = {
  position: {
		horizontal: {
			position: 'left',
			distance: 12
		},
		vertical: {
			position: 'top',
			distance: 12,
			gap: 10
		}
	},
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};
@NgModule({
  declarations: [
    AppComponent,
    SendDocumentComponent,
    LivenessComponent,
    MenuComponent,
    FacetecComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NotifierModule.withConfig(customNotifierOptions)
  ],
  providers: [
    FacecaptchaService,
    FacecaptchaBackendService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
