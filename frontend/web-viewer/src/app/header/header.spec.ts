import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch theme when the button is clicked', () => {
    const button = fixture.nativeElement.querySelector('.theme-toggle');

    button.click();
    expect(component.isDark()).toBe(false);

    button.click();
    expect(component.isDark()).toBe(true);
  });
});
