import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LivenessComponent } from './liveness.component';

describe('LivenessComponent', () => {
  let component: LivenessComponent;
  let fixture: ComponentFixture<LivenessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LivenessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LivenessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
