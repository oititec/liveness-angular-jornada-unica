import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetecComponent } from './facetec.component';

describe('FacetecComponent', () => {
  let component: FacetecComponent;
  let fixture: ComponentFixture<FacetecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
