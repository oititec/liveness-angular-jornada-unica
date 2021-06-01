import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FacecaptchaService } from './services/facecaptcha.service';
import { HttpClientModule } from '@angular/common/http';
import { FacecaptchaBackendService } from './backend/facecaptcha-backend.service';
import { AppRoutingModule } from './app-routing.module';
import { SendDocumentComponent } from './views/send-document/send-document.component';
import { LivenessComponent } from './views/liveness/liveness.component';

@NgModule({
  declarations: [
    AppComponent,
    SendDocumentComponent,
    LivenessComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    FacecaptchaService,
    FacecaptchaBackendService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
