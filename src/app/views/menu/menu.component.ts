import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  rotearModulo(modulo: number) {
    if (modulo == 0) {
      this.router.navigateByUrl('/liveness').catch();
    }
    if (modulo == 1) {
      this.router.navigateByUrl('/facetec').catch();
    }
  }
}
