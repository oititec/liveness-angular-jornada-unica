import { FacetecComponent } from './views/facetec/facetec.component';
import { MenuComponent } from './views/menu/menu.component';
import { LivenessComponent } from './views/liveness/liveness.component';
import { SendDocumentComponent } from './views/send-document/send-document.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [

  {
    path: "",
    component: MenuComponent
  },
  {
    path: "liveness",
    component: LivenessComponent
  },
  {
    path: "send-document",
    component: SendDocumentComponent
  },
  {
    path: "facetec",
    component: FacetecComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
