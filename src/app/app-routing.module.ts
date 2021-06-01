import { LivenessComponent } from './views/liveness/liveness.component';
import { SendDocumentComponent } from './views/send-document/send-document.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    component: LivenessComponent
  },
  {
    path: "send-document",
    component: SendDocumentComponent
  } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
